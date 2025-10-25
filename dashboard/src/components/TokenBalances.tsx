/**
 * Token Balances Component
 *
 * Displays ERC-20/ERC-721/ERC-1155 token balances from Blockscout
 * Prize Eligibility: Blockscout Integration
 */

import { useState, useEffect } from 'react';
import { blockscoutAPI, BlockscoutTokenBalance } from '../services/blockscout';
import { NETWORK } from '../config/networks';

interface TokenBalancesProps {
  address: string;
  title?: string;
}

export function TokenBalances({ address, title = 'Token Balances' }: TokenBalancesProps) {
  const [tokens, setTokens] = useState<BlockscoutTokenBalance[]>([]);
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalances();
  }, [address]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ETH balance
      const eth = await blockscoutAPI.getEthBalance(address);
      setEthBalance(eth);

      // Fetch token balances
      const response = await blockscoutAPI.getTokenBalances(address);
      setTokens(response.items || []);
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setError('Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  const formatTokenBalance = (value: string, decimals: string): string => {
    try {
      const decimalPlaces = parseInt(decimals);
      const balance = BigInt(value);
      const divisor = BigInt(10 ** decimalPlaces);

      const wholePart = balance / divisor;
      const fractionalPart = balance % divisor;

      if (fractionalPart === BigInt(0)) {
        return wholePart.toString();
      }

      const fractionalStr = fractionalPart.toString().padStart(decimalPlaces, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '').substring(0, 6);

      return trimmedFractional
        ? `${wholePart}.${trimmedFractional}`
        : wholePart.toString();
    } catch (error) {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading balances...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">⚠️ {error}</p>
          <button
            onClick={fetchBalances}
            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            Blockscout
          </span>
          <button
            onClick={fetchBalances}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ETH Balance */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              Ξ
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ethereum</p>
              <p className="text-xs text-gray-500">ETH</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{ethBalance}</p>
            <p className="text-xs text-gray-500">ETH</p>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      {tokens.length === 0 ? (
        <div className="bg-gray-50 rounded p-4 text-center">
          <p className="text-gray-600 text-sm">No ERC-20 tokens found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map((tokenBalance, index) => (
            <div
              key={`${tokenBalance.token.address}-${index}`}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tokenBalance.token.name || 'Unknown Token'}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                      {tokenBalance.token.symbol}
                    </span>
                  </div>
                  <a
                    href={`${(NETWORK as any).blockscoutUrl}/token/${tokenBalance.token.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-indigo-600 font-mono"
                  >
                    {tokenBalance.token.address.slice(0, 10)}...
                  </a>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-gray-900">
                    {tokenBalance.token_id
                      ? `#${tokenBalance.token_id}`
                      : formatTokenBalance(tokenBalance.value, tokenBalance.token.decimals)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tokenBalance.token.type.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <a
          href={`${(NETWORK as any).blockscoutUrl}/address/${address}/tokens`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
        >
          View all tokens on Blockscout →
        </a>
      </div>
    </div>
  );
}

/**
 * Compact balance display (for cards/sidebars)
 */
export function CompactBalanceDisplay({ address }: { address: string }) {
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [address]);

  const fetchBalance = async () => {
    try {
      const balance = await blockscoutAPI.getEthBalance(address);
      setEthBalance(balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl font-bold text-gray-900">{ethBalance}</span>
      <span className="text-sm text-gray-500">ETH</span>
    </div>
  );
}
