/**
 * ZK Circuit Loader
 * Loads Dilithium verification circuit files for ZK proof generation
 */

import { SnapError, ErrorCode } from '../types';

// Circuit file URLs - can be hosted on IPFS, CDN, or bundled
const CIRCUIT_FILES = {
  wasm: 'https://api.ethvault.qkey.co/circuits/dilithium_real.wasm',
  zkey: 'https://api.ethvault.qkey.co/circuits/dilithium_real_final.zkey',
};

// Local development paths (for testing)
const LOCAL_CIRCUIT_PATHS = {
  wasm: '../../../api/zk-proof/build/dilithium_real_js/dilithium_real.wasm',
  zkey: '../../../api/zk-proof/build/dilithium_real_final.zkey',
};

/**
 * Fetch circuit file from URL or local path
 */
export async function fetchCircuitFile(
  type: 'wasm' | 'zkey',
  useLocal: boolean = false
): Promise<ArrayBuffer> {
  try {
    const url = useLocal ? LOCAL_CIRCUIT_PATHS[type] : CIRCUIT_FILES[type];

    console.log(`Fetching ${type} circuit file from:`, url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`Loaded ${type} circuit: ${buffer.byteLength} bytes`);

    return buffer;
  } catch (error) {
    console.error(`Failed to load ${type} circuit:`, error);
    throw new SnapError(
      `Failed to load ZK circuit files: ${(error as Error).message}`,
      ErrorCode.PROOF_GENERATION_FAILED
    );
  }
}

/**
 * Preload circuit files (call once on Snap initialization)
 */
let cachedCircuits: {
  wasm?: ArrayBuffer;
  zkey?: ArrayBuffer;
} = {};

export async function preloadCircuits(useLocal: boolean = false): Promise<void> {
  try {
    console.log('Preloading ZK circuits...');

    const [wasm, zkey] = await Promise.all([
      fetchCircuitFile('wasm', useLocal),
      fetchCircuitFile('zkey', useLocal),
    ]);

    cachedCircuits = { wasm, zkey };

    console.log('✅ Circuits preloaded successfully');
  } catch (error) {
    console.error('Failed to preload circuits:', error);
    // Don't throw - allow fallback to on-demand loading
  }
}

/**
 * Get cached circuit files or fetch if not cached
 */
export async function getCircuitFiles(useLocal: boolean = false): Promise<{
  wasm: ArrayBuffer;
  zkey: ArrayBuffer;
}> {
  // Return cached if available
  if (cachedCircuits.wasm && cachedCircuits.zkey) {
    return {
      wasm: cachedCircuits.wasm,
      zkey: cachedCircuits.zkey,
    };
  }

  // Otherwise fetch
  await preloadCircuits(useLocal);

  if (!cachedCircuits.wasm || !cachedCircuits.zkey) {
    throw new SnapError(
      'Failed to load circuit files',
      ErrorCode.PROOF_GENERATION_FAILED
    );
  }

  return {
    wasm: cachedCircuits.wasm,
    zkey: cachedCircuits.zkey,
  };
}

/**
 * Clear cached circuits
 */
export function clearCircuitCache(): void {
  cachedCircuits = {};
  console.log('Circuit cache cleared');
}

/**
 * Check if circuits are available
 */
export function areCircuitsLoaded(): boolean {
  return !!(cachedCircuits.wasm && cachedCircuits.zkey);
}

/**
 * Get circuit file sizes
 */
export function getCircuitSizes(): {
  wasm: number;
  zkey: number;
  total: number;
} | null {
  if (!areCircuitsLoaded()) {
    return null;
  }

  return {
    wasm: cachedCircuits.wasm!.byteLength,
    zkey: cachedCircuits.zkey!.byteLength,
    total: cachedCircuits.wasm!.byteLength + cachedCircuits.zkey!.byteLength,
  };
}
