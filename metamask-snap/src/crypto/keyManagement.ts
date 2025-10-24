/**
 * Post-Quantum Key Management
 * Handles Dilithium3 (ML-DSA-65) key generation and storage
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { PQKeyPair, SnapState, SnapError, ErrorCode } from '../types';

/**
 * Convert hex string to Uint8Array
 */
async function hexToBytes(hex: string): Promise<Uint8Array> {
  return new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
}

/**
 * Derive a secure 32-byte seed from BIP-32 private key using HKDF-SHA256
 * Provides domain separation and avoids direct key material reuse
 */
async function deriveSeedFromPrivateKeyHKDF(privateKeyHex: string): Promise<Uint8Array> {
  const privBytes = await hexToBytes(privateKeyHex);

  // Import as raw key material for HKDF
  const ikm = await crypto.subtle.importKey(
    "raw",
    privBytes,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  // Use snap-specific salt & info for domain separation
  const salt = new TextEncoder().encode("ethvaultpq.hkdf.salt.v1");
  const info = new TextEncoder().encode("Dilithium3 seed derivation v1");

  // Derive 256 bits (32 bytes) for Dilithium seed
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    ikm,
    256
  );

  return new Uint8Array(derivedBits);
}

/**
 * Generate a new Dilithium3 keypair from BIP-32 entropy
 * Uses HKDF for secure key derivation with domain separation
 */
export async function generatePQKeypair(): Promise<PQKeyPair> {
  try {
    console.log('🔑 Starting PQ keypair generation...');

    // Get BIP-32 entropy from MetaMask seed phrase
    // Using testnet path (m/44'/1'/0'/0) - must match manifest permission exactly
    console.log('📝 Requesting BIP-32 entropy from MetaMask...');
    const bip32Entropy = await snap.request({
      method: 'snap_getBip32Entropy',
      params: {
        path: ['m', "44'", "1'", "0'", "0"],
        curve: 'secp256k1',
      },
    });

    console.log('✅ Retrieved BIP-32 entropy from MetaMask');
    // NOTE: Never log raw private key material in production!

    // Derive a secure 32-byte seed using HKDF-SHA256
    // This provides domain separation and avoids direct ECDSA private key reuse
    console.log('🔐 Deriving seed using HKDF-SHA256...');
    const seed = await deriveSeedFromPrivateKeyHKDF(bip32Entropy.privateKey);

    console.log('✅ Derived seed from BIP-32 entropy (HKDF-SHA256)');
    console.log('Seed length:', seed.length, 'bytes');

    // Generate Dilithium3 keypair from deterministic seed
    console.log('🔐 Generating Dilithium3 keypair...');

    // ml_dsa65.keygen returns an object with { publicKey, secretKey }
    const keyPair = ml_dsa65.keygen(seed);
    console.log('Generated key pair:', typeof keyPair, Object.keys(keyPair || {}));

    // Extract public and secret keys from the keypair object
    const publicKey = keyPair.publicKey;
    const secretKey = keyPair.secretKey;

    console.log('✅ Dilithium3 keypair generated successfully!');
    console.log('Public key length:', publicKey?.length, 'bytes');
    console.log('Secret key length:', secretKey?.length, 'bytes');
    console.log('🎉 Keys are recoverable from MetaMask seed phrase via HKDF derivation');

    return {
      publicKey,
      secretKey,
    };
  } catch (error) {
    console.error('❌ Failed to generate PQ keypair:', error);

    // Re-throw with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new SnapError(
      `Failed to generate post-quantum keypair: ${errorMessage}`,
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
 * Derive wallet address from public key using PQWalletFactory CREATE2
 */
export async function deriveWalletAddress(publicKey: Uint8Array): Promise<string> {
  try {
    // Import ethers dynamically
    const { ethers } = await import('ethers');

    // PQWalletFactory address (deployed on Tenderly)
    const FACTORY_ADDRESS = '0xdFedc33d4Ae2923926b4f679379f0960d62B0182';

    // Create provider (Tenderly RPC)
    const provider = new ethers.JsonRpcProvider(
      'https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d'
    );

    // PQWalletFactory ABI (only the method we need)
    const factoryABI = [
      'function getAddress(bytes calldata publicKey, uint256 salt) view returns (address)',
    ];

    const factory = new ethers.Contract(FACTORY_ADDRESS, factoryABI, provider);

    // Use salt = 0 for default wallet
    const salt = 0;

    // Call getAddress to get CREATE2 address
    const address = await factory.getAddress(publicKey, salt);

    console.log('Derived wallet address from PQWalletFactory:', address);

    return address;
  } catch (error) {
    console.error('Failed to derive wallet address:', error);

    // Fallback: generate deterministic address from public key hash
    const { ethers } = await import('ethers');
    const publicKeyHash = ethers.keccak256(publicKey);
    const fallbackAddress = `0x${publicKeyHash.slice(26)}`; // Last 20 bytes = 40 hex chars

    console.warn('Using fallback address derivation:', fallbackAddress);

    return fallbackAddress;
  }
}

/**
 * Check if wallet is initialized
 */
export async function isWalletInitialized(): Promise<boolean> {
  const state = await getSnapState();
  return state.initialized === true;
}
