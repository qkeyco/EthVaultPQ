import { useState } from 'react';

export interface ReceivingVault {
  name: string;
  symbol: string;
  underlyingAsset: string;
  address?: string;
  isExisting: boolean;
}

interface ReceivingVaultSetupProps {
  onVaultCreated: (vault: ReceivingVault) => void;
}

export function ReceivingVaultSetup({ onVaultCreated }: ReceivingVaultSetupProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [existingAddress, setExistingAddress] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [vaultSymbol, setVaultSymbol] = useState('');
  const [underlyingAsset, setUnderlyingAsset] = useState('0xc351De5746211E2B7688D7650A8bF7D91C809c0D'); // MockToken default
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCreateVault = async () => {
    if (mode === 'existing') {
      if (!existingAddress) {
        alert('Please enter a vault address');
        return;
      }

      onVaultCreated({
        name: 'Existing Vault',
        symbol: 'EV',
        underlyingAsset,
        address: existingAddress,
        isExisting: true,
      });
    } else {
      if (!vaultName || !vaultSymbol || !underlyingAsset) {
        alert('Please fill in all fields');
        return;
      }

      setIsDeploying(true);
      try {
        // TODO: Implement actual vault deployment
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deployment

        const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);

        onVaultCreated({
          name: vaultName,
          symbol: vaultSymbol,
          underlyingAsset,
          address: mockAddress,
          isExisting: false,
        });

        // Reset form
        setVaultName('');
        setVaultSymbol('');
      } catch (error) {
        console.error('Failed to deploy vault:', error);
        alert('Failed to deploy vault');
      } finally {
        setIsDeploying(false);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Receiving Vault Setup</h3>

      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setMode('new')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            mode === 'new'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <h4 className="font-semibold text-gray-900">Create New Vault</h4>
          <p className="text-xs text-gray-600 mt-1">Deploy a new PQVault4626 to receive vested tokens</p>
        </button>

        <button
          onClick={() => setMode('existing')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            mode === 'existing'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <h4 className="font-semibold text-gray-900">Use Existing Vault</h4>
          <p className="text-xs text-gray-600 mt-1">Connect to an already deployed vault</p>
        </button>
      </div>

      {/* New Vault Form */}
      {mode === 'new' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault Name
            </label>
            <input
              type="text"
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="e.g., Team Vesting Vault"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault Symbol
            </label>
            <input
              type="text"
              value={vaultSymbol}
              onChange={(e) => setVaultSymbol(e.target.value)}
              placeholder="e.g., vTEAM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Underlying Asset
            </label>
            <select
              value={underlyingAsset}
              onChange={(e) => setUnderlyingAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="0xc351De5746211E2B7688D7650A8bF7D91C809c0D">MockToken (MUSDC)</option>
              <option value="custom">Custom Token...</option>
            </select>
          </div>

          {underlyingAsset === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Token Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What is a Receiving Vault?</h4>
            <p className="text-sm text-blue-800">
              A receiving vault is a separate PQVault4626 contract that holds vested tokens. Recipients can:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Withdraw their vested tokens on their own schedule</li>
              <li>Earn yield on unvested tokens</li>
              <li>Transfer or delegate their vault shares</li>
              <li>Create sub-vesting schedules for their team</li>
            </ul>
          </div>
        </div>
      )}

      {/* Existing Vault Form */}
      {mode === 'existing' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault Address
            </label>
            <input
              type="text"
              value={existingAddress}
              onChange={(e) => setExistingAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Using Existing Vault</h4>
            <p className="text-sm text-yellow-800">
              Make sure the vault:
            </p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
              <li>Is a PQVault4626 contract</li>
              <li>Uses the same underlying asset as your vesting schedule</li>
              <li>Has appropriate access controls set up</li>
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button
          onClick={handleCreateVault}
          disabled={isDeploying}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              {mode === 'new' ? 'Deploying Vault...' : 'Connecting...'}
            </>
          ) : (
            mode === 'new' ? 'Deploy Vault' : 'Use This Vault'
          )}
        </button>
      </div>

      {/* Deployed Vaults List */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Vaults</h4>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">PQVault4626</div>
                <div className="text-xs text-gray-600 font-mono">0x8e04...4C21</div>
              </div>
              <button
                onClick={() => setExistingAddress('0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21')}
                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
              >
                Select
              </button>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900">PQVault4626Demo (60x faster)</div>
                <div className="text-xs text-gray-600 font-mono">0xE6D4...AE9C</div>
              </div>
              <button
                onClick={() => setExistingAddress('0xE6D42d7B673852fDd755E870A3bDD85a4852AE9C')}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
