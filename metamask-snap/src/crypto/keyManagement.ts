/**
 * Post-Quantum Key Management
 * Handles Dilithium3 (ML-DSA-65) key generation and storage
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { PQKeyPair, SnapState, SnapError, ErrorCode } from '../types';

/**
 * Generate a new Dilithium3 keypair from BIP-44 entropy
 */
export async function generatePQKeypair(): Promise<PQKeyPair> {
  try {
    // Request BIP-44 entropy from MetaMask (coinType 60 = Ethereum)
    const entropy = await snap.request({
      method: 'snap_getBip44Entropy',
      params: {
        coinType: 60,
      },
    });

    // Convert entropy to seed (32 bytes for Dilithium3)
    const seed = new Uint8Array(
      entropy.privateKey.slice(0, 64).match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );

    // Generate Dilithium3 keypair
    const secretKey = ml_dsa65.keygen(seed);
    const publicKey = ml_dsa65.getPublicKey(secretKey);

    return {
      publicKey,
      secretKey,
    };
  } catch (error) {
    console.error('Failed to generate PQ keypair:', error);
    throw new SnapError(
      'Failed to generate post-quantum keypair',
      ErrorCode.SIGNING_FAILED
    );
  }
}

/**
 * Store PQ keys in Snap state (encrypted by MetaMask)
 */
export async function storePQKeys(keyPair: PQKeyPair): Promise<void> {
  try {
    const currentState = await getSnapState();

    const newState: SnapState = {
      ...currentState,
      pqPublicKey: Array.from(keyPair.publicKey),
      pqSecretKey: Array.from(keyPair.secretKey),
      initialized: true,
    };

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState,
      },
    });
  } catch (error) {
    console.error('Failed to store PQ keys:', error);
    throw new SnapError('Failed to store keys', ErrorCode.STATE_ERROR);
  }
}

/**
 * Retrieve PQ keys from Snap state
 */
export async function getPQKeys(): Promise<PQKeyPair> {
  try {
    const state = await getSnapState();

    if (!state.initialized || !state.pqPublicKey || !state.pqSecretKey) {
      throw new SnapError(
        'Wallet not initialized. Please create a wallet first.',
        ErrorCode.NOT_INITIALIZED
      );
    }

    return {
      publicKey: new Uint8Array(state.pqPublicKey),
      secretKey: new Uint8Array(state.pqSecretKey),
    };
  } catch (error) {
    if (error instanceof SnapError) {
      throw error;
    }
    console.error('Failed to retrieve PQ keys:', error);
    throw new SnapError('Failed to retrieve keys', ErrorCode.STATE_ERROR);
  }
}

/**
 * Get current Snap state
 */
export async function getSnapState(): Promise<SnapState> {
  try {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
      },
    });

    return (state as SnapState) || { initialized: false, vaults: [] };
  } catch (error) {
    console.error('Failed to get snap state:', error);
    return { initialized: false, vaults: [] };
  }
}

/**
 * Update Snap state
 */
export async function updateSnapState(updates: Partial<SnapState>): Promise<void> {
  try {
    const currentState = await getSnapState();
    const newState = {
      ...currentState,
      ...updates,
    };

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState,
      },
    });
  } catch (error) {
    console.error('Failed to update snap state:', error);
    throw new SnapError('Failed to update state', ErrorCode.STATE_ERROR);
  }
}

/**
 * Clear all Snap state (reset)
 */
export async function clearSnapState(): Promise<void> {
  try {
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'clear',
      },
    });
  } catch (error) {
    console.error('Failed to clear snap state:', error);
    throw new SnapError('Failed to clear state', ErrorCode.STATE_ERROR);
  }
}

/**
 * Derive wallet address from public key
 * Note: For ERC-4337 PQWallet, address is determined by CREATE2
 */
export function deriveWalletAddress(publicKey: Uint8Array): string {
  // For now, return a placeholder
  // In production, this should interact with PQWalletFactory to get CREATE2 address
  const publicKeyHex = Buffer.from(publicKey).toString('hex');
  return `0x${publicKeyHex.slice(0, 40)}`; // Placeholder
}

/**
 * Check if wallet is initialized
 */
export async function isWalletInitialized(): Promise<boolean> {
  const state = await getSnapState();
  return state.initialized === true;
}
