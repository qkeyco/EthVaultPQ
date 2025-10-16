/**
 * ZK Proof API Client
 *
 * Calls Vercel serverless function to generate ZK-SNARK proofs
 * for Dilithium signature verification
 */

interface ZKProofRequest {
  message: string;
  signature: string;
  publicKey: string;
  userOpHash?: string;
}

interface ZKProofResponse {
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

const API_BASE_URL = process.env.VITE_ZK_API_URL || 'http://localhost:3000';

/**
 * Generate ZK proof for Dilithium signature
 */
export async function generateZKProof(request: ZKProofRequest): Promise<ZKProofResponse> {
  const response = await fetch(`${API_BASE_URL}/api/zk-proof`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate ZK proof');
  }

  return response.json();
}

/**
 * Encode ZK proof for Solidity
 */
export function encodeZKProof(proof: ZKProofResponse['proof']): `0x${string}` {
  // Pack proof components into bytes for Solidity
  const encoded = [
    proof.a[0],
    proof.a[1],
    proof.b[0][0],
    proof.b[0][1],
    proof.b[1][0],
    proof.b[1][1],
    proof.c[0],
    proof.c[1],
  ].join('').replace(/0x/g, '');

  return `0x${encoded}`;
}

/**
 * Compare gas costs between verification methods
 */
export function getGasComparison() {
  return {
    onChain: {
      name: 'On-Chain Dilithium',
      gas: 10_000_000, // ~10M gas for full verification
      cost: '~$50-200 depending on gas price',
      pros: ['No external dependencies', 'Fully decentralized'],
      cons: ['Very expensive', 'May hit block gas limit'],
    },
    zkProof: {
      name: 'ZK-SNARK Proof',
      gas: 250_000, // ~250k gas for Groth16 verification
      cost: '~$1.25-5 depending on gas price',
      pros: ['Much cheaper', 'Fixed gas cost', 'Privacy preserving'],
      cons: ['Requires off-chain computation', 'Trusted setup needed'],
    },
    savings: {
      gasReduction: '97.5%',
      multiplier: '40x cheaper',
    },
  };
}
