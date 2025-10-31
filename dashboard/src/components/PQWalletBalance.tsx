import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits, parseAbi } from 'viem';
import { NETWORK } from '../config/networks';

const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
]);

interface PQWalletBalanceProps {
  pqWalletAddress?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  showImportButton?: boolean;
}

export function PQWalletBalance({
  pqWalletAddress,
  tokenAddress = NETWORK.contracts.mockToken,
  tokenSymbol = 'MQKEY',
  showImportButton = true,
}: PQWalletBalanceProps) {
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance
  useEffect(() => {
    if (!pqWalletAddress || !publicClient) return;

    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);

        const bal = await publicClient.readContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [pqWalletAddress as `0x${string}`],
        });

        setBalance(bal as bigint);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch balance:', err);
        // If balanceOf fails, the token might not be deployed yet
        setError('Token not found. The MQKEY token may not be deployed at this address. Check your vesting schedule for token details.');
        setBalance(0n); // Show 0 instead of error
        setLoading(false);
      }
    };

    fetchBalance();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [pqWalletAddress, tokenAddress, publicClient]);

  // Add token to MetaMask
  const handleAddToken = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: 6, // MUSDC decimals
            image: '', // Optional: token image URL
          },
        },
      });
    } catch (error: any) {
      console.error('Failed to add token:', error);
      alert(`Failed to add token: ${error.message}`);
    }
  };

  if (!pqWalletAddress) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">
          No PQWallet address found. Create a wallet first in the Snap tab.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">PQWallet Balance</h3>
          <p className="text-xs text-gray-600 font-mono break-all">{pqWalletAddress}</p>
        </div>
        {showImportButton && (
          <button
            onClick={handleAddToken}
            className="ml-4 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            title="Add token to MetaMask"
          >
            + Add to MetaMask
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg p-4 border border-blue-100">
        {loading && balance === null ? (
          <div className="text-center text-gray-500">
            <span className="inline-block animate-spin mr-2">⏳</span>
            Loading balance...
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            ❌ {error}
          </div>
        ) : balance !== null ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatUnits(balance, 6)}
              </span>
              <span className="text-lg text-gray-600 ml-2">{tokenSymbol}</span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="mr-2">🔄</span>
              Updates every 10 seconds
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">No balance data</div>
        )}
      </div>

      {showImportButton && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded text-xs text-blue-900">
          <strong>💡 Tip:</strong> Click "Add to MetaMask" to see this token in your MetaMask wallet.
          Your PQWallet balance will appear under "Tokens" → "{tokenSymbol}".
        </div>
      )}
    </div>
  );
}
