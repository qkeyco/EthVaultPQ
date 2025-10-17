/**
 * Vercel Serverless Function: ZK Proof Generation for Dilithium Signatures
 *
 * Endpoint: POST /api/prove
 *
 * Request body:
 * {
 *   "message": "0x1234...",           // Hex string of message
 *   "signature": "0xabcd...",         // Hex string of Dilithium signature (3293 bytes)
 *   "publicKey": "0xef01..."          // Hex string of public key (1952 bytes)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "proof": [...],                   // Groth16 proof (8 field elements)
 *   "publicSignals": [...],           // Public inputs (message_hash, pk_hash, is_valid)
 *   "timing": {
 *     "witness": "123ms",
 *     "proof": "456ms",
 *     "total": "579ms"
 *   }
 * }
 */

const snarkjs = require('snarkjs');
const crypto = require('crypto');
const path = require('path');
const { checkRateLimit, sendRateLimitError } = require('./rate-limit');
const { checkApiKey, sendAuthError } = require('./auth');

// Helper: Convert hex string to array of field elements
function hexToFieldElements(hexString, size) {
  const bytes = Buffer.from(hexString.replace('0x', ''), 'hex');
  const elements = [];

  for (let i = 0; i < size; i++) {
    if (i < bytes.length) {
      // Convert byte to field element (mod prime)
      elements.push(BigInt(bytes[i]).toString());
    } else {
      elements.push('0');
    }
  }

  return elements;
}

// Helper: Compute Poseidon hash (simplified to keccak256 for now)
function computeHash(data) {
  const hash = crypto.createHash('sha256').update(Buffer.from(data)).digest();
  // Convert to field element (< BN254 prime)
  const prime = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');
  return (BigInt('0x' + hash.toString('hex')) % prime).toString();
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  // API Key authentication
  if (!checkApiKey(req)) {
    return sendAuthError(res);
  }

  // Rate limiting: 20 requests per minute per IP
  if (!checkRateLimit(req, 20, 60000)) {
    return sendRateLimitError(res, 60);
  }

  const startTime = Date.now();

  try {
    const { message, signature, publicKey } = req.body;

    // Validate inputs
    if (!message || !signature || !publicKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: message, signature, publicKey'
      });
    }

    console.log('Generating ZK proof...');
    console.log('Message length:', message.length);
    console.log('Signature length:', signature.length);
    console.log('PublicKey length:', publicKey.length);

    // Prepare circuit inputs
    const witnessStart = Date.now();

    // For SimpleDilithiumVerifier circuit (8 elements each)
    const signatureElements = hexToFieldElements(signature, 8);
    const publicKeyElements = hexToFieldElements(publicKey, 8);

    const messageHash = computeHash(message);
    const publicKeyHash = computeHash(publicKey);

    const input = {
      message_hash: messageHash,
      public_key_hash: publicKeyHash,
      signature: signatureElements,
      public_key: publicKeyElements
    };

    console.log('Input prepared:', {
      message_hash: messageHash.slice(0, 20) + '...',
      public_key_hash: publicKeyHash.slice(0, 20) + '...',
      signature_length: signatureElements.length,
      public_key_length: publicKeyElements.length
    });

    const witnessEnd = Date.now();

    // Generate real ZK-SNARK proof
    const proofStart = Date.now();

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      __dirname + '/../build/dilithium_simple_js/dilithium_simple.wasm',
      __dirname + '/../build/dilithium_simple.zkey'
    );

    const proofEnd = Date.now();
    const totalTime = Date.now() - startTime;

    console.log('Proof generated successfully');
    console.log('Timing:', {
      witness: `${witnessEnd - witnessStart}ms`,
      proof: `${proofEnd - proofStart}ms`,
      total: `${totalTime}ms`
    });

    return res.status(200).json({
      success: true,
      proof: proof,
      publicSignals: publicSignals,
      timing: {
        witness: `${witnessEnd - witnessStart}ms`,
        proof: `${proofEnd - proofStart}ms`,
        total: `${totalTime}ms`
      }
    });

  } catch (error) {
    console.error('Error generating proof:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
