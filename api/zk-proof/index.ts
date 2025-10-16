import type { VercelRequest, VercelResponse } from '@vercel/node';
import { groth16 } from 'snarkjs';

/**
 * Vercel Serverless Function for ZK Proof Generation
 *
 * This API generates a ZK-SNARK proof that a Dilithium3 signature is valid
 * without revealing the signature itself on-chain.
 *
 * Flow:
 * 1. Client sends: message, signature, publicKey
 * 2. API verifies signature off-chain (using full Dilithium3)
 * 3. API generates ZK proof of valid signature
 * 4. Returns compact proof for on-chain verification
 */

interface ProofRequest {
  message: string;           // Hex-encoded message
  signature: string;         // Hex-encoded Dilithium3 signature (3293 bytes)
  publicKey: string;         // Hex-encoded Dilithium3 public key (1952 bytes)
  userOpHash?: string;       // Optional: ERC-4337 userOp hash
}

interface ProofResponse {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  publicSignals: string[];
  isValid: boolean;
  timestamp: number;
  gasEstimate: number;
}

/**
 * Simplified Dilithium3 verification (placeholder)
 * In production, use actual Dilithium3 library like:
 * - @noble/post-quantum
 * - dilithium-crystals
 */
async function verifyDilithiumSignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  // TODO: Implement actual Dilithium3 verification
  // For now, basic validation

  if (signature.length !== 3293) {
    throw new Error('Invalid signature length. Expected 3293 bytes for Dilithium3');
  }

  if (publicKey.length !== 1952) {
    throw new Error('Invalid public key length. Expected 1952 bytes for Dilithium3');
  }

  if (message.length === 0) {
    throw new Error('Empty message');
  }

  // CRITICAL: Replace with actual Dilithium3 verification
  // Example with hypothetical library:
  // const dilithium = await import('dilithium-crystals');
  // return dilithium.verify(message, signature, publicKey);

  // Placeholder: Check signature is not all zeros
  const notAllZeros = signature.some(byte => byte !== 0);

  return notAllZeros;
}

/**
 * Generate ZK-SNARK proof of valid Dilithium signature
 */
async function generateZKProof(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<{ proof: any; publicSignals: string[] }> {
  // First verify the signature is actually valid
  const isValid = await verifyDilithiumSignature(message, signature, publicKey);

  if (!isValid) {
    throw new Error('Invalid Dilithium signature. Cannot generate proof for invalid signature.');
  }

  // Generate ZK proof using snarkjs
  // The circuit proves: "I know a signature S such that verify(message, S, publicKey) = true"
  // Public inputs: messageHash, publicKeyHash
  // Private inputs: signature

  const messageHash = hashToField(message);
  const publicKeyHash = hashToField(publicKey);

  // Input signals for the ZK circuit
  const input = {
    // Public signals
    messageHash: messageHash.toString(),
    publicKeyHash: publicKeyHash.toString(),

    // Private signals (not revealed on-chain)
    signature: Array.from(signature).map(b => b.toString()),
    publicKey: Array.from(publicKey).map(b => b.toString()),
    message: Array.from(message).map(b => b.toString()),
  };

  // TODO: Generate actual proof using circuit
  // const { proof, publicSignals } = await groth16.fullProve(
  //   input,
  //   './circuits/dilithium_verifier.wasm',
  //   './circuits/dilithium_verifier_final.zkey'
  // );

  // Placeholder proof (mock proof for development)
  const proof = {
    pi_a: ['0x123...', '0x456...', '1'],
    pi_b: [['0x789...', '0xabc...'], ['0xdef...', '0x012...'], ['1', '0']],
    pi_c: ['0x345...', '0x678...', '1'],
    protocol: 'groth16',
    curve: 'bn128',
  };

  const publicSignals = [
    messageHash.toString(),
    publicKeyHash.toString(),
  ];

  return { proof, publicSignals };
}

/**
 * Hash data to field element for ZK circuit
 */
function hashToField(data: Uint8Array): bigint {
  // Use Poseidon hash or Keccak256 truncated to field size
  // For BN128 curve, field modulus is ~254 bits

  const hash = require('crypto').createHash('sha256').update(data).digest();
  const value = BigInt('0x' + hash.toString('hex'));

  // Modulo BN128 field size
  const BN128_FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

  return value % BN128_FIELD_MODULUS;
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Main API handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body: ProofRequest = req.body;

    // Validate request
    if (!body.message || !body.signature || !body.publicKey) {
      return res.status(400).json({
        error: 'Missing required fields: message, signature, publicKey',
      });
    }

    // Convert hex to bytes
    const message = hexToBytes(body.message);
    const signature = hexToBytes(body.signature);
    const publicKey = hexToBytes(body.publicKey);

    // Generate ZK proof
    const startTime = Date.now();
    const { proof, publicSignals } = await generateZKProof(message, signature, publicKey);
    const proofGenTime = Date.now() - startTime;

    // Format proof for Solidity verifier
    const formattedProof = {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [
        [proof.pi_b[0][0], proof.pi_b[0][1]],
        [proof.pi_b[1][0], proof.pi_b[1][1]],
      ],
      c: [proof.pi_c[0], proof.pi_c[1]],
    };

    const response: ProofResponse = {
      proof: formattedProof,
      publicSignals,
      isValid: true,
      timestamp: Date.now(),
      gasEstimate: 250000, // Groth16 verification ~250k gas
    };

    console.log(`ZK Proof generated in ${proofGenTime}ms`);

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('Error generating ZK proof:', error);

    return res.status(500).json({
      error: error.message || 'Failed to generate ZK proof',
      timestamp: Date.now(),
    });
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'ok',
    service: 'zk-proof-generator',
    version: '1.0.0',
    timestamp: Date.now(),
  });
}
