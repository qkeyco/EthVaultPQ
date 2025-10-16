import { useState } from 'react';
import { useAccount } from 'wagmi';
import { NETWORK } from '../config/networks';

export const VaultManager = () => {
  const { isConnected } = useAccount();

  const [depositAmount, setDepositAmount] = useState('');
  const [vestingDuration, setVestingDuration] = useState(365); // days
  const [vestingCliff, setVestingCliff] = useState(30); // days
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDeposit = async () => {
    if (!depositAmount) {
      addLog('Error: Please enter deposit amount');
      return;
    }

    addLog('Depositing to vault...');
    addLog('ERROR: Vault contract not deployed yet. Please deploy contracts first.');
    addLog(`Vault address needed: ${NETWORK.contracts.pqVault}`);

    // TODO: Implement actual deposit logic
    /*
    try {
      // 1. Approve vault to spend tokens
      const approvalHash = await walletClient.writeContract({
        address: NETWORK.contracts.mockToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [NETWORK.contracts.pqVault, parseEther(depositAmount)],
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      addLog('Token approval confirmed');

      // 2. Deposit with vesting
      const depositHash = await walletClient.writeContract({
        address: NETWORK.contracts.pqVault as `0x${string}`,
        abi: vaultAbi,
        functionName: 'depositWithVesting',
        args: [
          parseEther(depositAmount),
          address,
          vestingDuration * 24 * 60 * 60,
          vestingCliff * 24 * 60 * 60,
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash: depositHash });
      addLog('Deposit successful!');
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    }
    */
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Vault Manager</h2>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800">
            Deploy contracts first using: <code className="bg-yellow-100 px-2 py-1 rounded">forge script script/DeployTestnet.s.sol</code>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deposit Amount (tokens)
          </label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="100"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vesting Duration (days)
          </label>
          <input
            type="number"
            value={vestingDuration}
            onChange={(e) => setVestingDuration(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliff Period (days)
          </label>
          <input
            type="number"
            value={vestingCliff}
            onChange={(e) => setVestingCliff(Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleDeposit}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Deposit with Vesting
        </button>

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
