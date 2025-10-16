import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { VestingTimeline } from './VestingTimeline';
import { PaymentScheduleBuilder } from './PaymentScheduleBuilder';

export const VaultManager = () => {
  const { isConnected } = useAccount();

  const [depositAmount, setDepositAmount] = useState('');
  const [vestingDuration, setVestingDuration] = useState(365); // days
  const [vestingCliff, setVestingCliff] = useState(30); // days
  const [logs, setLogs] = useState<string[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDeposit = async () => {
    if (!depositAmount) {
      addLog('Error: Please enter deposit amount');
      return;
    }

    addLog('Depositing to vault...');
    addLog(`Using vault at: ${CONTRACTS.pqVault}`);

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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Vault Manager</h2>

        <div className="space-y-4">
          {/* Schedule type toggle */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setUseCustomSchedule(false)}
              className={`px-4 py-2 rounded transition ${
                !useCustomSchedule
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Linear Vesting
            </button>
            <button
              onClick={() => setUseCustomSchedule(true)}
              className={`px-4 py-2 rounded transition ${
                useCustomSchedule
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Custom Schedule
            </button>
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

          {!useCustomSchedule ? (
            <>
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
            </>
          ) : null}

          {depositAmount && !useCustomSchedule && (
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              {showTimeline ? 'Hide Timeline' : 'Preview Timeline & Schedule'}
            </button>
          )}

          <button
            onClick={handleDeposit}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            {useCustomSchedule ? 'Deploy Custom Schedule' : 'Deposit with Linear Vesting'}
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

      {/* Timeline visualization for linear vesting */}
      {showTimeline && depositAmount && !useCustomSchedule && (
        <VestingTimeline
          totalAmount={parseFloat(depositAmount)}
          vestingDuration={vestingDuration}
          cliffDuration={vestingCliff}
        />
      )}

      {/* Custom payment schedule builder */}
      {useCustomSchedule && depositAmount && (
        <PaymentScheduleBuilder
          totalAmount={parseFloat(depositAmount)}
          onScheduleChange={(milestones) => {
            addLog(`Custom schedule created with ${milestones.length} milestones`);
          }}
        />
      )}
    </div>
  );
};
