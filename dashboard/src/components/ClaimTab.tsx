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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);

  const { writeContract, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Fetch vesting schedules for connected wallet
  useEffect(() => {
    if (!isConnected || !connectedAddress || !publicClient) {
      setLoading(false);
      return;
    }

    fetchSchedules();
  }, [isConnected, connectedAddress, publicClient]);

  // Refetch on successful claim
  useEffect(() => {
    if (isClaimSuccess) {
      fetchSchedules();
      setSelectedSchedule(null);
    }
  }, [isClaimSuccess]);

  const fetchSchedules = async () => {
    if (!publicClient || !connectedAddress) return;

    try {
      setLoading(true);
      setError(null);

      // Get total number of schedules (nextScheduleId is the count)
      const totalSchedules = await publicClient.readContract({
        address: NETWORK.contracts.vestingManager as `0x${string}`,
        abi: VESTING_MANAGER_ABI,
        functionName: 'nextScheduleId',
      }) as bigint;

      if (totalSchedules === 0n) {
        setSchedules([]);
        setLoading(false);
        return;
      }

      // Fetch all schedules and filter for this beneficiary
      const allScheduleDetails: VestingSchedule[] = [];

      for (let i = 0; i < Number(totalSchedules); i++) {
        try {
          const schedule = await publicClient.readContract({
            address: NETWORK.contracts.vestingManager as `0x${string}`,
            abi: VESTING_MANAGER_ABI,
            functionName: 'vestingSchedules',
            args: [BigInt(i)],
          }) as any;

          // Only include schedules for the connected wallet
          if (schedule[0].toLowerCase() === connectedAddress.toLowerCase()) {
            allScheduleDetails.push({
              scheduleId: i,
              beneficiary: schedule[0],
              totalAmount: schedule[1],
              releasedAmount: schedule[2],
              startBlock: schedule[3],
              cliffDuration: schedule[4],
              duration: schedule[5],
              revocable: schedule[6],
              revoked: schedule[7],
            });
          }
        } catch (err) {
          // Skip invalid schedules
          console.warn(`Schedule ${i} not found or invalid`);
        }
      }

      setSchedules(allScheduleDetails);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch vesting schedules:', err);
      setError(err.message || 'Failed to load vesting schedules');
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

      {/* Vesting Schedules */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Vesting Schedules</h3>

        {schedules.length === 0 ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 mb-2">
              No vesting schedules found
            </p>
            <p className="text-sm text-gray-500">
              Vesting schedules will appear here once tokens are vesting to your PQWallet
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
