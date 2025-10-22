/**
 * Post-Quantum Transaction Signing
 * Signs transactions with Dilithium3 and generates ZK-SNARK proofs
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { groth16 } from 'snarkjs';
import { TransactionData, SignedTransaction, ZKProof, SnapError, ErrorCode } from '../types';
import { getPQKeys } from './keyManagement';
import { ethers } from 'ethers';

/**
 * Sign a transaction with Dilithium3
 */
export async function signTransaction(txData: TransactionData): Promise<Uint8Array> {
  try {
    const { secretKey } = await getPQKeys();

    // Serialize transaction data
    const message = serializeTransactionData(txData);
    const messageBytes = ethers.getBytes(message);

    // Sign with Dilithium3 (ML-DSA-65)
    const signature = ml_dsa65.sign(secretKey, messageBytes);

    return signature;
  } catch (error) {
    console.error('Failed to sign transaction:', error);
    throw new SnapError(
      'Failed to sign transaction with Dilithium3',
      ErrorCode.SIGNING_FAILED
    );
  }
}

/**
 * Verify a Dilithium3 signature (for testing)
 */
export async function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    return ml_dsa65.verify(publicKey, message, signature);
  } catch (error) {
    console.error('Failed to verify signature:', error);
    return false;
  }
}

/**
 * Generate ZK-SNARK proof for Dilithium signature verification
 * This allows on-chain verification with ~250K gas instead of ~50M gas
 */
export async function generateZKProof(
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array
): Promise<ZKProof> {
  try {
    // Note: In production, circuit files should be hosted and fetched
    // For now, this is a placeholder showing the structure

    // Circuit inputs
    const input = {
      signature: Array.from(signature),
      message: Array.from(message),
      publicKey: Array.from(publicKey),
      // Additional inputs for signature verification circuit
    };

    // TODO: Load actual circuit files
    // const wasmFile = await fetchCircuitFile('dilithium_verifier.wasm');
    // const zkeyFile = await fetchCircuitFile('dilithium_verifier.zkey');

    // For now, return a mock proof structure
    // In production, this would call:
    // const { proof, publicSignals } = await groth16.fullProve(input, wasmFile, zkeyFile);

    console.warn('ZK proof generation not yet implemented - using mock proof');

    return {
      proof: {
        pi_a: ['0', '0', '1'],
        pi_b: [['0', '0'], ['0', '0'], ['1', '0']],
        pi_c: ['0', '0', '1'],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals: [
        ethers.keccak256(message),
        ethers.keccak256(publicKey),
        '1', // validity flag
      ],
    };
  } catch (error) {
    console.error('Failed to generate ZK proof:', error);
    throw new SnapError(
      'Failed to generate ZK-SNARK proof',
      ErrorCode.PROOF_GENERATION_FAILED
    );
  }
}

/**
 * Sign transaction and generate ZK proof in one step
 */
export async function signAndProve(txData: TransactionData): Promise<SignedTransaction> {
  try {
    const { publicKey } = await getPQKeys();

    // 1. Sign with Dilithium3
    const signature = await signTransaction(txData);

    // 2. Serialize message
    const message = serializeTransactionData(txData);
    const messageBytes = ethers.getBytes(message);

    // 3. Generate ZK proof
    const zkProof = await generateZKProof(signature, messageBytes, publicKey);

    // 4. Return combined result
    return {
      dilithiumSignature: signature,
      zkProof,
      messageHash: ethers.keccak256(message),
    };
  } catch (error) {
    console.error('Failed to sign and prove transaction:', error);
    if (error instanceof SnapError) {
      throw error;
    }
    throw new SnapError(
      'Failed to sign and prove transaction',
      ErrorCode.SIGNING_FAILED
    );
  }
}

/**
 * Serialize transaction data for signing
 */
function serializeTransactionData(txData: TransactionData): string {
  // EIP-712 style structured data hashing
  const types = {
    Transaction: [
      { name: 'to', type: 'address' },
      { name: 'data', type: 'bytes' },
      { name: 'value', type: 'uint256' },
      { name: 'chainId', type: 'uint256' },
    ],
  };

  const domain = {
    name: 'EthVaultPQ',
    version: '1',
    chainId: txData.chainId,
  };

  const message = {
    to: txData.to,
    data: txData.data,
    value: txData.value || '0',
    chainId: txData.chainId,
  };

  // For now, use a simple keccak256 hash
  // In production, use proper EIP-712 encoding
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'bytes', 'uint256', 'uint256'],
      [message.to, message.data, message.value, message.chainId]
    )
  );
}

/**
 * Sign a message (for off-chain verification)
 */
export async function signMessage(message: string): Promise<Uint8Array> {
  try {
    const { secretKey } = await getPQKeys();
    const messageBytes = ethers.toUtf8Bytes(message);
    const signature = ml_dsa65.sign(secretKey, messageBytes);
    return signature;
  } catch (error) {
    console.error('Failed to sign message:', error);
    throw new SnapError('Failed to sign message', ErrorCode.SIGNING_FAILED);
  }
}

/**
 * Fetch circuit files from remote source (IPFS, CDN, etc.)
 */
async function fetchCircuitFile(filename: string): Promise<ArrayBuffer> {
  // TODO: Implement actual fetching from IPFS or CDN
  // For now, throw error
  throw new Error(`Circuit file fetching not implemented: ${filename}`);
}
