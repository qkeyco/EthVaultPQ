/**
 * Transaction History Component
 *
 * Displays transaction history from Blockscout API
 * Prize Eligibility: Blockscout Integration
 */

import { useState, useEffect } from 'react';
import {
  blockscoutAPI,
  BlockscoutTransaction,
  formatTransactionValue,
  formatTimestamp,
  getStatusColor,
  truncateAddress,
} from '../services/blockscout';
import { NETWORK } from '../config/networks';

interface TransactionHistoryProps {
  address: string;
  title?: string;
  limit?: number;
}

export function TransactionHistory({
  address,
  title = 'Transaction History',
  limit = 10,
}: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<BlockscoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const txs = await blockscoutAPI.getRecentTransactions(address, limit);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getBlockscoutTxUrl = (txHash: string) => {
    return `${(NETWORK as any).blockscoutUrl}/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading transactions...</span>
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
            onClick={fetchTransactions}
            className="mt-2 text-sm text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="bg-gray-50 rounded p-8 text-center">
          <p className="text-gray-600">No transactions found for this address</p>
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
            onClick={fetchTransactions}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tx Hash
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Block
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                From
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Value
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.hash} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <a
                    href={getBlockscoutTxUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-mono"
                  >
                    {truncateAddress(tx.hash, 6)}
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {tx.block_number.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                  {truncateAddress(tx.from.hash, 4)}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">
                  {truncateAddress(tx.to.hash, 4)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatTransactionValue(tx.value)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      tx.status === 'ok'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tx.status === 'ok' ? '✓ Success' : '✗ Failed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length >= limit && (
        <div className="mt-4 text-center">
          <a
            href={`${(NETWORK as any).blockscoutUrl}/address/${address}/transactions`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            View all transactions on Blockscout →
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Transaction List (for sidebars/cards)
 */
export function CompactTransactionList({
  address,
  limit = 5,
}: {
  address: string;
  limit?: number;
}) {
  const [transactions, setTransactions] = useState<BlockscoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [address]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const txs = await blockscoutAPI.getRecentTransactions(address, limit);
      setTransactions(txs);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500">No recent transactions</p>;
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
        >
          <div className="flex-1 min-w-0">
            <a
              href={`${(NETWORK as any).blockscoutUrl}/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-indigo-600 hover:text-indigo-800 truncate block"
            >
              {truncateAddress(tx.hash, 8)}
            </a>
            <p className="text-xs text-gray-500">
              {new Date(tx.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right ml-2">
            <p className="text-xs font-medium text-gray-900">
              {formatTransactionValue(tx.value)}
            </p>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                tx.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
          </div>
        </div>
      ))}
    </div>
  );
}
