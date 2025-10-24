/**
 * MetaMask Snap Integration Tab
 * Allows users to interact with the EthVaultPQ Snap directly from the dashboard
 */

import { useState, useEffect } from 'react';

// Snap ID configuration based on environment
const SNAP_ID = import.meta.env.VITE_SNAP_ID ||
  (import.meta.env.DEV ? 'local:http://localhost:8080' : 'npm:@qkey/ethvaultpq-snap');

export function SnapTab() {
  const [snapInstalled, setSnapInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>(['Initializing Snap integration...']);

  useEffect(() => {
    // Wait for MetaMask to inject
    const checkWithRetry = async () => {
      // Try immediately
      await checkSnapStatus();

      // If still not found and no ethereum, retry after delay
      if (!snapInstalled && typeof window !== 'undefined') {
        setTimeout(() => {
          checkSnapStatus();
        }, 1000);
      }
    };

    checkWithRetry();
  }, []);

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📝';
    setOutput(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  const checkSnapStatus = async () => {
    try {
      log('Checking Snap status...', 'info');

      if (typeof window === 'undefined') {
        log('Window is undefined (SSR)', 'error');
        setLoading(false);
        return;
      }

      if (typeof window.ethereum === 'undefined') {
        log('MetaMask not detected - Please install MetaMask Flask', 'error');
        setLoading(false);
        return;
      }

      log('Calling wallet_getSnaps...', 'info');
      const snaps = await (window as any).ethereum.request({
        method: 'wallet_getSnaps',
      });

      log(`Got snaps: ${JSON.stringify(Object.keys(snaps))}`, 'info');

      if (snaps[SNAP_ID]) {
        setSnapInstalled(true);
        log(`✅ Snap installed: ${SNAP_ID}`, 'success');

        // Try to get wallet address
        try {
          const address = await invokeSnap('pqwallet_getWalletAddress');
          setWalletAddress(address);
          log(`Wallet address: ${address}`, 'success');
        } catch (err) {
          log('Wallet not created yet', 'info');
        }
      } else {
        setSnapInstalled(false);
        log(`❌ Snap not installed. Looking for: ${SNAP_ID}`, 'error');
      }
    } catch (error: any) {
      log(`Error checking snap: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const invokeSnap = async (method: string, params?: any) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }
    const result = await (window as any).ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: SNAP_ID,
        request: { method, params },
      },
    });

    // Check if the Snap returned an error object
    if (result && typeof result === 'object' && 'error' in result) {
      const errorMsg = typeof result.error === 'string'
        ? result.error
        : result.error?.message || JSON.stringify(result.error);
      throw new Error(errorMsg);
    }

    return result;
  };

  const installSnap = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        log('MetaMask not available', 'error');
        return;
      }
      log('Installing Snap...');
      await (window as any).ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
          [SNAP_ID]: {},
        },
      });
      log('Snap installed successfully!', 'success');

      // Re-check status after installation
      await checkSnapStatus();
    } catch (error: any) {
      log(`Installation failed: ${error.message}`, 'error');
    }
  };

  const createWallet = async () => {
    try {
      log('Creating PQ wallet...', 'info');
      log('Calling pqwallet_createWallet RPC method...', 'info');

      const result = await invokeSnap('pqwallet_createWallet');

      log('RPC call completed, processing result...', 'info');
      log(`Wallet created!`, 'success');
      log(`Address: ${result.address}`);
      log(`Public Key: ${result.publicKey.substring(0, 64)}...`);
      setWalletAddress(result.address);
    } catch (error: any) {
      log(`Error creating wallet: ${error.message}`, 'error');
      console.error('Full error:', error);
    }
  };

  const signTransaction = async () => {
    try {
      log('Signing transaction...');
      const result = await invokeSnap('pqwallet_signTransaction', {
        transaction: {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          data: '0x',
          value: '0',
          chainId: 1,
        },
      });
      log('Transaction signed!', 'success');
      log(`Signature: ${result.signature.substring(0, 64)}...`);
      log(`ZK Proof generated`);
    } catch (error: any) {
      log(`Error: ${error.message}`, 'error');
    }
  };

  const addVault = async () => {
    try {
      log('Adding vault...');
      await invokeSnap('pqwallet_addVault', {
        vaultAddress: '0x634b095371e4E45FEeD94c1A45C37798E173eA50',
        tokenAddress: '0x3BB798Ecf5dF703A5F00C6987c42e6Da1Cea3730',
        tokenSymbol: 'MOCK',
      });
      log('Vault added successfully!', 'success');
    } catch (error: any) {
      log(`Error: ${error.message}`, 'error');
    }
  };

  const getVestingSchedule = async () => {
    try {
      log('Fetching vesting schedule...');
      const schedule = await invokeSnap('pqwallet_getVestingSchedule', {
        vaultAddress: '0x634b095371e4E45FEeD94c1A45C37798E173eA50',
      });
      log('Vesting schedule:', 'success');
      log(`Progress: ${schedule.vestingProgress.toFixed(1)}%`);
      log(`Claimable: ${schedule.claimableAmount}`);
    } catch (error: any) {
      log(`Error: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🦊 MetaMask Snap</h2>
            <p className="text-gray-600 mt-1">
              Post-quantum wallet management directly in MetaMask
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={checkSnapStatus}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
            >
              🔄 Refresh
            </button>
            {snapInstalled ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Installed
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Not Installed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Installation */}
      {!snapInstalled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started</h3>
          <p className="text-blue-800 mb-4">
            Install the EthVaultPQ Snap to enable post-quantum signatures, vault tracking, and more.
          </p>
          <button
            onClick={installSnap}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Install Snap
          </button>
        </div>
      )}

      {/* Actions */}
      {snapInstalled && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Management */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Management</h3>
              {walletAddress ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Address:</p>
                  <p className="font-mono text-sm break-all">{walletAddress}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">No wallet created yet</p>
              )}
              <div className="space-y-2">
                <button
                  onClick={createWallet}
                  disabled={!!walletAddress}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {walletAddress ? 'Wallet Created ✓' : 'Create PQ Wallet'}
                </button>
              </div>
            </div>

            {/* Transaction Signing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Transaction Signing</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign transactions with Dilithium3 + ZK-SNARK proofs
              </p>
              <button
                onClick={signTransaction}
                disabled={!walletAddress}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Sign Test Transaction
              </button>
            </div>

            {/* Vault Tracking */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Vault Tracking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track vesting schedules and claimable amounts
              </p>
              <div className="space-y-2">
                <button
                  onClick={addVault}
                  disabled={!walletAddress}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Demo Vault
                </button>
                <button
                  onClick={getVestingSchedule}
                  disabled={!walletAddress}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Get Vesting Schedule
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Dilithium3 (ML-DSA-65) signatures</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>ZK-SNARK proof generation (~250K gas)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Real-time vesting insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>BIP-44 key derivation (no extra backup)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>CREATE2 wallet addresses</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Output Console */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Console</h3>
              <button
                onClick={() => setOutput(['Console cleared'])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-80 overflow-y-auto">
              {output.map((line, i) => (
                <div key={i} className="mb-1">{line}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">Requirements</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• MetaMask Flask (developer version) installed</li>
          <li>• Snap server running at http://localhost:8080</li>
          <li>• Compatible with Chromium-based browsers</li>
        </ul>
      </div>
    </div>
  );
}
