/**
 * Contract Verification Badge Component
 *
 * Shows contract verification status from Blockscout
 * Prize Eligibility: Blockscout Integration
 */

import { useState, useEffect } from 'react';
import { blockscoutAPI, BlockscoutContractInfo } from '../services/blockscout';
import { NETWORK } from '../config/networks';

interface ContractVerificationBadgeProps {
  address: string;
  showDetails?: boolean;
}

export function ContractVerificationBadge({
  address,
  showDetails = false,
}: ContractVerificationBadgeProps) {
  const [contractInfo, setContractInfo] = useState<BlockscoutContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [address]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(false);
      const info = await blockscoutAPI.getContractInfo(address);
      setContractInfo(info);
    } catch (err) {
      console.error('Failed to fetch contract verification:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 animate-pulse">
        Checking...
      </span>
    );
  }

  if (error || !contractInfo) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Unknown
      </span>
    );
  }

  const isVerified = contractInfo.is_fully_verified || contractInfo.verified;
  const isPartiallyVerified = contractInfo.is_partially_verified;

  if (!showDetails) {
    // Simple badge
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          isVerified
            ? 'bg-green-100 text-green-800'
            : isPartiallyVerified
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}
        title={
          isVerified
            ? 'Contract is verified on Blockscout'
            : isPartiallyVerified
            ? 'Contract is partially verified'
            : 'Contract is not verified'
        }
      >
        {isVerified ? '✓ Verified' : isPartiallyVerified ? '~ Partial' : '✗ Not Verified'}
      </span>
    );
  }

  // Detailed view
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">Contract Verification</h4>
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            isVerified
              ? 'bg-green-100 text-green-800'
              : isPartiallyVerified
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isVerified ? '✓ Verified' : isPartiallyVerified ? '~ Partial' : '✗ Not Verified'}
        </span>
      </div>

      {isVerified && (
        <div className="space-y-2 text-sm">
          {contractInfo.name && (
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{contractInfo.name}</span>
            </div>
          )}

          {contractInfo.compiler_version && (
            <div className="flex justify-between">
              <span className="text-gray-600">Compiler:</span>
              <span className="font-mono text-xs text-gray-900">
                {contractInfo.compiler_version}
              </span>
            </div>
          )}

          {contractInfo.optimization_enabled !== null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Optimization:</span>
              <span className="text-gray-900">
                {contractInfo.optimization_enabled ? 'Enabled' : 'Disabled'}
                {contractInfo.optimization_runs && ` (${contractInfo.optimization_runs} runs)`}
              </span>
            </div>
          )}

          {contractInfo.evm_version && (
            <div className="flex justify-between">
              <span className="text-gray-600">EVM Version:</span>
              <span className="text-gray-900">{contractInfo.evm_version}</span>
            </div>
          )}

          {contractInfo.verified_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Verified:</span>
              <span className="text-gray-900">
                {new Date(contractInfo.verified_at).toLocaleDateString()}
              </span>
            </div>
          )}

          {contractInfo.is_verified_via_sourcify && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Verified via Sourcify
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <a
          href={`${(NETWORK as any).blockscoutUrl}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 underline"
        >
          View on Blockscout →
        </a>
      </div>
    </div>
  );
}

/**
 * Simple verification status indicator
 */
export function VerificationDot({ address }: { address: string }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    checkVerification();
  }, [address]);

  const checkVerification = async () => {
    try {
      const verified = await blockscoutAPI.isContractVerified(address);
      setIsVerified(verified);
    } catch (err) {
      setIsVerified(null);
    }
  };

  if (isVerified === null) {
    return <span className="inline-block w-2 h-2 rounded-full bg-gray-400" title="Unknown"></span>;
  }

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        isVerified ? 'bg-green-500' : 'bg-red-500'
      }`}
      title={isVerified ? 'Verified' : 'Not verified'}
    ></span>
  );
}
