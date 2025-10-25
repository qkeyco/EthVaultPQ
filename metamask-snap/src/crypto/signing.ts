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
    console.log('🔐 Getting PQ keys...');
    const { secretKey } = await getPQKeys();
    console.log('✅ Got secret key, length:', secretKey?.length);
    console.log('   Type:', typeof secretKey, 'isUint8Array:', secretKey instanceof Uint8Array);

    // Serialize transaction data
    console.log('📝 Serializing transaction data...');
    const message = serializeTransactionData(txData);
    console.log('   Message hash:', message);
    const messageBytes = ethers.getBytes(message);
    console.log('   Message bytes length:', messageBytes.length);

    // Sign with Dilithium3 (ML-DSA-65)
    console.log('✍️ Signing with Dilithium3...');
    const signature = ml_dsa65.sign(secretKey, messageBytes);
    console.log('✅ Signature created, length:', signature.length);

    return signature;
  } catch (error) {
    console.error('❌ Failed to sign transaction:', error);
    console.error('   Error type:', typeof error);
    console.error('   Error message:', (error as Error).message);
    console.error('   Full error:', error);
    throw new SnapError(
      `Failed to sign transaction with Dilithium3: ${(error as Error).message}`,
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
    // Import circuit loader dynamically
    const { getCircuitFiles } = await import('./zkCircuitLoader');

    // First verify the signature off-chain
    const isValid = ml_dsa65.verify(publicKey, message, signature);

    if (!isValid) {
      throw new SnapError(
        'Signature verification failed - cannot generate proof for invalid signature',
        ErrorCode.SIGNING_FAILED
      );
    }

    console.log('✅ Dilithium signature verified off-chain');

    // Load circuit files (will use cache if available)
    const circuits = await getCircuitFiles(false); // Set to true for local testing

    // Prepare circuit inputs
    // Note: We need to chunk the large inputs (signature, publicKey, message)
    // to fit within circuit constraints
    const input = {
      // Chunk signature (3309 bytes) into smaller pieces
      signatureChunks: bytesToChunks(signature, 10),
      // Chunk message (variable size, typically 32 bytes for hash)
      messageChunks: bytesToChunks(message, 4),
      // Chunk public key (1952 bytes)
      publicKeyChunks: bytesToChunks(publicKey, 8),
      // Validity flag (1 = valid)
      isValid: isValid ? '1' : '0',
    };

    console.log('Generating ZK-SNARK proof...');
    console.time('ZK Proof Generation');

    // Generate Groth16 proof using snarkjs
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      new Uint8Array(circuits.wasm),
      new Uint8Array(circuits.zkey)
    );

    console.timeEnd('ZK Proof Generation');
    console.log('✅ ZK proof generated successfully');

    // Convert proof to format expected by Solidity verifier
    return {
      proof: {
        pi_a: [proof.pi_a[0], proof.pi_a[1]],
        pi_b: [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ],
        pi_c: [proof.pi_c[0], proof.pi_c[1]],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals,
    };
  } catch (error) {
    console.error('Failed to generate ZK proof:', error);
    throw new SnapError(
      `Failed to generate ZK-SNARK proof: ${(error as Error).message}`,
      ErrorCode.PROOF_GENERATION_FAILED
    );
  }
}

/**
 * Convert bytes to field element chunks for circuit
 */
function bytesToChunks(bytes: Uint8Array, numChunks: number): string[] {
  const chunks: string[] = [];
  const chunkSize = Math.ceil(bytes.length / numChunks);

  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, bytes.length);
    const chunk = bytes.slice(start, end);

    // Convert chunk to bigint
    let value = 0n;
    for (let j = 0; j < chunk.length; j++) {
      value = (value << 8n) | BigInt(chunk[j]);
    }

    chunks.push(value.toString());
  }

  return chunks;
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

