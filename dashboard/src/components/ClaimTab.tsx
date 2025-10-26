import { useState } from 'react';
import { VestingTokenPrice } from './VestingTokenPrice';

export function ClaimTab() {
  const [vaultAddress] = useState<string>(''); // Will be populated from user's vesting schedules

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Vested Tokens</h2>
        <p className="text-gray-600">
          View your vesting progress and claim tokens that have vested to your PQWallet.
        </p>
      </div>

      {/* Token Price Display */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Token Price</h3>
        <VestingTokenPrice />
      </div>

      {/* Vesting Schedule Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Vesting Schedules</h3>
        
        {!vaultAddress ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800 mb-4">
              No vesting schedules found. Create a vesting schedule first.
            </p>
            <button
              onClick={() => window.location.hash = '#vesting'}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Set up vesting →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Vesting Progress */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Vesting</p>
                  <p className="text-2xl font-bold text-gray-900">100,000 MUSDC</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vested</p>
                  <p className="text-2xl font-bold text-green-600">25,000 MUSDC</p>
                  <p className="text-xs text-gray-500">25% complete</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Claimable</p>
                  <p className="text-2xl font-bold text-indigo-600">25,000 MUSDC</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-indigo-500"
                    style={{ width: '25%' }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">1 year vested, 3 years remaining</p>
              </div>
            </div>

            {/* Claim Button */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Ready to claim</p>
                  <p className="text-sm text-gray-600">Sign with quantum-resistant Dilithium3 signature</p>
                </div>
                <button
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold shadow-lg"
                >
                  Claim 25,000 MUSDC
                </button>
              </div>
            </div>

            {/* Vesting Schedule Details */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Schedule Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cliff Period</p>
                  <p className="font-medium">1 year</p>
                </div>
                <div>
                  <p className="text-gray-600">Vesting Period</p>
                  <p className="font-medium">4 years linear</p>
                </div>
                <div>
                  <p className="text-gray-600">Beneficiary</p>
                  <p className="font-mono text-xs">0x1234...5678</p>
                </div>
                <div>
                  <p className="text-gray-600">Security</p>
                  <p className="font-medium text-green-600">🔐 Dilithium3</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How Claiming Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tokens vest according to your schedule (e.g., monthly over 4 years)</li>
          <li>• Vested tokens become claimable</li>
          <li>• Click "Claim" to sign with your quantum-resistant PQWallet</li>
          <li>• A ZK-SNARK proof is generated (99.5% gas savings)</li>
          <li>• Tokens are transferred to your PQWallet address</li>
        </ul>
      </div>
    </div>
  );
}
