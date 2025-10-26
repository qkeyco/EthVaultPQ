import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { VestingTokenPrice } from './VestingTokenPrice';
import { formatUnits, parseAbi } from 'viem';
import { NETWORK } from '../config/networks';

// VestingManager ABI (just the functions we need)
const VESTING_MANAGER_ABI = parseAbi([
  'function vestingSchedules(uint256) view returns (address beneficiary, uint256 totalAmount, uint256 releasedAmount, uint256 startBlock, uint256 cliffDuration, uint256 duration, bool revocable, bool revoked)',
  'function release(uint256 scheduleId) external',
  'function nextScheduleId() view returns (uint256)',
]);

interface VestingSchedule {
  scheduleId: number;
  beneficiary: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  startBlock: bigint;
  cliffDuration: bigint;
  duration: bigint;
  revocable: boolean;
  revoked: boolean;
}

export function ClaimTab() {
  const { address: connectedAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: currentBlock } = useBlockNumber({ watch: true }); // Live block updates!

  const [schedules, setSchedules] = useState<VestingSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [manualScheduleId, setManualScheduleId] = useState<string>('');
  const [loadingManual, setLoadingManual] = useState(false);

  const { writeContract, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Load schedule by manual ID
  const loadScheduleById = async (scheduleId: number) => {
    if (!publicClient || !connectedAddress) return;

    try {
      setLoadingManual(true);
      setError(null);

      const schedule = await publicClient.readContract({
        address: NETWORK.contracts.vestingManager as `0x${string}`,
        abi: VESTING_MANAGER_ABI,
        functionName: 'vestingSchedules',
        args: [BigInt(scheduleId)],
      }) as any;

      // Check if schedule exists and belongs to connected wallet
      if (schedule[0] === '0x0000000000000000000000000000000000000000') {
        setError(`Schedule #${scheduleId} does not exist`);
        setLoadingManual(false);
        return;
      }

      if (schedule[0].toLowerCase() !== connectedAddress.toLowerCase()) {
        setError(`Schedule #${scheduleId} belongs to a different address`);
        setLoadingManual(false);
        return;
      }

      const newSchedule: VestingSchedule = {
        scheduleId,
        beneficiary: schedule[0],
        totalAmount: schedule[1],
        releasedAmount: schedule[2],
        startBlock: schedule[3],
        cliffDuration: schedule[4],
        duration: schedule[5],
        revocable: schedule[6],
        revoked: schedule[7],
      };

      // Add to schedules if not already there
      setSchedules(prev => {
        const exists = prev.find(s => s.scheduleId === scheduleId);
        if (exists) return prev;
        return [...prev, newSchedule];
      });

      setLoadingManual(false);
      setManualScheduleId('');
    } catch (err: any) {
      console.error('Failed to load schedule:', err);
      setError(err.message || 'Failed to load schedule');
      setLoadingManual(false);
    }
  };

  // Refetch schedules on successful claim
  useEffect(() => {
    if (isClaimSuccess && selectedSchedule !== null) {
      // Reload the claimed schedule to show updated amounts
      loadScheduleById(selectedSchedule);
      setSelectedSchedule(null);
    }
  }, [isClaimSuccess]);

  const calculateReleasableAmount = (schedule: VestingSchedule): bigint => {
    if (!currentBlock || schedule.revoked) return 0n;

    const currentBlockNum = currentBlock;
    const cliffBlock = schedule.startBlock + schedule.cliffDuration;

    // Before cliff
    if (currentBlockNum < cliffBlock) return 0n;

    // After vesting period ends
    const endBlock = schedule.startBlock + schedule.duration;
    if (currentBlockNum >= endBlock) {
      return schedule.totalAmount - schedule.releasedAmount;
    }

    // During vesting
    const vestedBlocks = currentBlockNum - schedule.startBlock;
    const vestedAmount = (schedule.totalAmount * vestedBlocks) / schedule.duration;
    const releasable = vestedAmount - schedule.releasedAmount;

    return releasable > 0n ? releasable : 0n;
  };

  const calculateVestedPercentage = (schedule: VestingSchedule): number => {
    if (!currentBlock || schedule.revoked) return 0;

    const currentBlockNum = currentBlock;
    const cliffBlock = schedule.startBlock + schedule.cliffDuration;

    if (currentBlockNum < cliffBlock) return 0;

    const endBlock = schedule.startBlock + schedule.duration;
    if (currentBlockNum >= endBlock) return 100;

    const vestedBlocks = currentBlockNum - schedule.startBlock;
    return Number((vestedBlocks * 100n) / schedule.duration);
  };

  const handleClaim = async (scheduleId: number) => {
    try {
      setSelectedSchedule(scheduleId);
      writeContract({
        address: NETWORK.contracts.vestingManager as `0x${string}`,
        abi: VESTING_MANAGER_ABI,
        functionName: 'release',
        args: [BigInt(scheduleId)],
      });
    } catch (err: any) {
      console.error('Claim failed:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading vesting schedules...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Please connect your wallet to view vesting schedules</p>
        </div>
      </div>
    );
  }

  // Check if VestingManager is deployed by trying to load a schedule
  const [contractDeployed, setContractDeployed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkContract = async () => {
      if (!publicClient) return;

      try {
        // Try to read from the contract
        await publicClient.readContract({
          address: NETWORK.contracts.vestingManager as `0x${string}`,
          abi: VESTING_MANAGER_ABI,
          functionName: 'vestingSchedules',
          args: [0n],
        });
        setContractDeployed(true);
      } catch (err: any) {
        // If it returns "0x", the contract doesn't exist or is wrong
        if (err.message?.includes('returned no data')) {
          setContractDeployed(false);
        } else {
          setContractDeployed(true); // Other errors mean contract exists but schedule 0 doesn't
        }
      }
    };

    checkContract();
  }, [publicClient]);

  // Show warning banner if contract not deployed, but don't block the UI
  const contractNotDeployedWarning = contractDeployed === false && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 className="font-semibold text-yellow-900 mb-2">⚠️ VestingManager May Not Be Deployed</h4>
      <p className="text-sm text-yellow-800 mb-2">
        Could not verify VestingManager contract at <code className="bg-yellow-100 px-1 text-xs">{NETWORK.contracts.vestingManager}</code>
      </p>
      <p className="text-xs text-yellow-700">
        If you created a vesting schedule, try loading it anyway. The contract might exist but return empty data for non-existent schedule IDs.
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Contract Warning */}
      {contractNotDeployedWarning}

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Vested Tokens</h2>
            <p className="text-gray-600">
              View your vesting progress and claim tokens that have vested to your PQWallet.
            </p>
          </div>
          {currentBlock && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Block</p>
              <p className="text-lg font-mono font-semibold text-indigo-600">
                {currentBlock.toString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Token Price Display */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Token Price</h3>
        <VestingTokenPrice />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Manual Schedule ID Input */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Load Vesting Schedule</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter your vesting schedule ID to load and track it. You'll receive this ID when creating a vesting schedule.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            min="0"
            placeholder="Schedule ID (e.g., 0, 1, 2...)"
            value={manualScheduleId}
            onChange={(e) => setManualScheduleId(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={() => {
              const id = parseInt(manualScheduleId);
              if (!isNaN(id) && id >= 0) {
                loadScheduleById(id);
              }
            }}
            disabled={!manualScheduleId || loadingManual}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {loadingManual ? 'Loading...' : 'Load Schedule'}
          </button>
        </div>
      </div>

      {/* Vesting Schedules */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Vesting Schedules</h3>

        {schedules.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 mb-2">
              No vesting schedules loaded
            </p>
            <p className="text-sm text-gray-500">
              Enter a schedule ID above to load your vesting schedule
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {schedules.map((schedule) => {
              const releasable = calculateReleasableAmount(schedule);
              const vestedPercentage = calculateVestedPercentage(schedule);
              const totalVested = schedule.releasedAmount + releasable;
              const cliffBlock = schedule.startBlock + schedule.cliffDuration;
              const endBlock = schedule.startBlock + schedule.duration;
              const blocksRemaining = currentBlock && currentBlock < endBlock
                ? endBlock - currentBlock
                : 0n;

              return (
                <div key={schedule.scheduleId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  {/* Schedule Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      Schedule #{schedule.scheduleId}
                    </h4>
                    {schedule.revoked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                        REVOKED
                      </span>
                    )}
                  </div>

                  {/* Vesting Progress */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Vesting</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatUnits(schedule.totalAmount, 6)} MUSDC
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vested</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatUnits(totalVested, 6)} MUSDC
                        </p>
                        <p className="text-xs text-gray-500">{vestedPercentage.toFixed(2)}% complete</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Claimable Now</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {formatUnits(releasable, 6)} MUSDC
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-indigo-500 transition-all duration-1000"
                          style={{ width: `${vestedPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {blocksRemaining > 0n
                          ? `${blocksRemaining.toString()} blocks remaining (~${(Number(blocksRemaining) * 12 / 3600).toFixed(1)} hours)`
                          : 'Fully vested!'}
                      </p>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {releasable > 0n && !schedule.revoked && (
                    <div className="p-4 bg-white border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Ready to claim</p>
                          <p className="text-sm text-gray-600">
                            Tokens will be sent to {schedule.beneficiary.slice(0, 6)}...{schedule.beneficiary.slice(-4)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleClaim(schedule.scheduleId)}
                          disabled={isClaimPending || isClaimConfirming || selectedSchedule === schedule.scheduleId}
                          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold shadow-lg transition-colors"
                        >
                          {selectedSchedule === schedule.scheduleId && (isClaimPending || isClaimConfirming) ? (
                            <>
                              <span className="inline-block animate-spin mr-2">⏳</span>
                              {isClaimPending ? 'Claiming...' : 'Confirming...'}
                            </>
                          ) : (
                            `Claim ${formatUnits(releasable, 6)} MUSDC`
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Schedule Details */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Schedule Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Start Block</p>
                        <p className="font-mono text-xs">{schedule.startBlock.toString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Block</p>
                        <p className="font-mono text-xs">{endBlock.toString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cliff Blocks</p>
                        <p className="font-medium">{schedule.cliffDuration.toString()}</p>
                        <p className="text-xs text-gray-500">
                          Cliff at block {cliffBlock.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Duration</p>
                        <p className="font-medium">{schedule.duration.toString()} blocks</p>
                        <p className="text-xs text-gray-500">
                          ~{(Number(schedule.duration) * 12 / 86400).toFixed(1)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Already Claimed</p>
                        <p className="font-medium">{formatUnits(schedule.releasedAmount, 6)} MUSDC</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Security</p>
                        <p className="font-medium text-green-600">🔐 PQWallet</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How Claiming Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Tokens vest linearly based on block numbers (manipulation-proof)</li>
          <li>• Claimable amount updates automatically as blocks are mined (~12 seconds)</li>
          <li>• Click "Claim" to transfer vested tokens to your PQWallet</li>
          <li>• You pay gas for the claim transaction from your connected wallet</li>
          <li>• Claimed tokens are sent to the PQWallet beneficiary address</li>
        </ul>
      </div>
    </div>
  );
}
