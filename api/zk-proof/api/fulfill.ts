import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';

/**
 * Vercel API Endpoint: Check for unfulfilled proofs and fulfill them
 *
 * This replaces the separate operator service!
 *
 * Can be called:
 * 1. Manually: POST /api/fulfill
 * 2. Via webhook: When oracle emits ProofRequested event
 * 3. Via cron: Every minute (check for pending requests)
 */

// Oracle ABI (minimal)
const ORACLE_ABI = [
  'event ProofRequested(bytes32 indexed requestId, address indexed requester, bytes32 messageHash, bytes32 publicKeyHash)',
  'function getRequest(bytes32 requestId) view returns (tuple(address requester, bytes32 messageHash, bytes32 publicKeyHash, bytes message, bytes signature, bytes publicKey, uint256 timestamp, uint8 status, bytes proof, uint256[3] publicSignals))',
  'function fulfillProof(bytes32 requestId, uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[3] calldata _pubSignals) external',
  'function isRequestFulfilled(bytes32 requestId) view returns (bool)'
];

interface ProofGenerationResponse {
  proof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  };
  publicSignals: string[];
}

/**
 * Main handler - Check and fulfill pending proofs
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests or cron jobs
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const TENDERLY_RPC_URL = process.env.TENDERLY_RPC_URL || process.env.RPC_URL;
    const ZK_ORACLE_ADDRESS = process.env.ZK_ORACLE_ADDRESS;
    const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;

    if (!TENDERLY_RPC_URL || !ZK_ORACLE_ADDRESS || !OPERATOR_PRIVATE_KEY) {
      return res.status(500).json({
        error: 'Missing environment variables',
        required: ['TENDERLY_RPC_URL', 'ZK_ORACLE_ADDRESS', 'OPERATOR_PRIVATE_KEY']
      });
    }

    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(TENDERLY_RPC_URL);
    const wallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
    const oracle = new ethers.Contract(ZK_ORACLE_ADDRESS, ORACLE_ABI, wallet);

    // Get specific requestId if provided, otherwise find pending requests
    const requestId = req.body?.requestId;

    if (requestId) {
      // Fulfill specific request
      const result = await fulfillRequest(oracle, requestId, req);
      return res.status(200).json(result);
    } else {
      // Check for recent unfulfilled requests (last 100 blocks)
      const currentBlock = await provider.getBlockNumber();
      const filter = oracle.filters.ProofRequested();
      const events = await oracle.queryFilter(filter, currentBlock - 100, currentBlock);

      const results = [];
      for (const event of events) {
        const isFulfilled = await oracle.isRequestFulfilled(event.args.requestId);
        if (!isFulfilled) {
          const result = await fulfillRequest(oracle, event.args.requestId, req);
          results.push(result);
        }
      }

      return res.status(200).json({
        checked: events.length,
        fulfilled: results.length,
        results
      });
    }

  } catch (error: any) {
    console.error('Error in fulfill handler:', error);
    return res.status(500).json({
      error: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * Fulfill a single proof request
 */
async function fulfillRequest(
  oracle: ethers.Contract,
  requestId: string,
  req: VercelRequest
): Promise<any> {
  const startTime = Date.now();

  try {
    // Check if already fulfilled
    const isFulfilled = await oracle.isRequestFulfilled(requestId);
    if (isFulfilled) {
      return {
        requestId,
        status: 'skipped',
        reason: 'Already fulfilled'
      };
    }

    // Get request details
    const request = await oracle.getRequest(requestId);

    // Convert bytes to hex
    const messageHex = ethers.hexlify(request.message);
    const signatureHex = ethers.hexlify(request.signature);
    const publicKeyHex = ethers.hexlify(request.publicKey);

    // Call proof generation API (same server!)
    const baseUrl = req.headers.host?.includes('localhost')
      ? 'http://localhost:3000'
      : `https://${req.headers.host}`;

    const apiResponse = await fetch(`${baseUrl}/api/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageHex,
        signature: signatureHex,
        publicKey: publicKeyHex
      })
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.text();
      throw new Error(`Proof generation failed: ${error}`);
    }

    const proofData: ProofGenerationResponse = await apiResponse.json();
    const proofGenTime = Date.now() - startTime;

    // Submit proof to oracle
    const tx = await oracle.fulfillProof(
      requestId,
      proofData.proof.a,
      proofData.proof.b,
      proofData.proof.c,
      proofData.publicSignals,
      { gasLimit: 500000 }
    );

    const receipt = await tx.wait();
    const totalTime = Date.now() - startTime;

    return {
      requestId,
      status: 'fulfilled',
      transactionHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      proofGenerationTime: proofGenTime,
      totalTime,
      blockNumber: receipt.blockNumber
    };

  } catch (error: any) {
    return {
      requestId,
      status: 'failed',
      error: error.message,
      time: Date.now() - startTime
    };
  }
}
