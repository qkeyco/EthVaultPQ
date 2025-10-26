/**
 * MetaMask Snap API for PQWallet operations
 * Provides typed interface for interacting with the EthVaultPQ Snap
 */

// Snap ID configuration
const SNAP_ID = import.meta.env.VITE_SNAP_ID ||
  (import.meta.env.DEV ? 'local:http://localhost:8080' : 'npm:@qkey/ethvaultpq-snap');

export interface PQWalletInfo {
  address: string;
  publicKey: string;
  deployed: boolean;
}

export interface SnapStatus {
  hasWallet: boolean;
  address?: string;
  publicKey?: string;
}

/**
 * Check if MetaMask is available
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Check if the Snap is installed
 */
export async function isSnapInstalled(): Promise<boolean> {
  if (!isMetaMaskAvailable()) {
    return false;
  }

  try {
    const snaps = await (window as any).ethereum.request({
      method: 'wallet_getSnaps',
    });
    return !!snaps[SNAP_ID];
  } catch (error) {
    console.error('Error checking snap installation:', error);
    return false;
  }
}

/**
 * Install the Snap
 */
export async function installSnap(): Promise<void> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask not available');
  }

  await (window as any).ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [SNAP_ID]: {},
    },
  });
}

/**
 * Invoke a Snap RPC method
 */
async function invokeSnap(method: string, params?: any): Promise<any> {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask not available');
  }

  console.log(`📞 Calling Snap method: ${method}`, params);

  const result = await (window as any).ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: SNAP_ID,
      request: { method, params },
    },
  });

  console.log(`📥 Snap response for ${method}:`, result);

  // Check if the Snap returned an error object
  if (result && typeof result === 'object' && 'error' in result) {
    const errorMsg = typeof result.error === 'string'
      ? result.error
      : result.error?.message || JSON.stringify(result.error);
    console.error(`❌ Snap returned error:`, errorMsg);
    throw new Error(errorMsg);
  }

  return result;
}

/**
 * Get Snap status (wallet info)
 */
export async function getSnapStatus(): Promise<SnapStatus> {
  return await invokeSnap('pqwallet_getStatus');
}

/**
 * Create a new PQ wallet in the Snap
 * This generates a Dilithium keypair and stores it securely
 */
export async function createPQWallet(): Promise<PQWalletInfo> {
  const result = await invokeSnap('pqwallet_createWallet');
  return {
    address: result.address,
    publicKey: result.publicKey,
    deployed: result.deployed || false,
  };
}

/**
 * Get the current PQ wallet info from Snap
 */
export async function getPQWalletInfo(): Promise<PQWalletInfo | null> {
  const status = await getSnapStatus();
  if (!status.hasWallet || !status.address || !status.publicKey) {
    return null;
  }
  return {
    address: status.address,
    publicKey: status.publicKey,
    deployed: false, // Will be checked separately
  };
}

/**
 * Sign a transaction with Dilithium + ZK proof
 */
export async function signTransaction(transaction: {
  to: string;
  data: string;
  value: string;
  chainId: number;
}): Promise<{
  signature: string;
  messageHash: string;
  zkProof?: any;
}> {
  return await invokeSnap('pqwallet_signTransaction', { transaction });
}
