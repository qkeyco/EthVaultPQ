import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt, useBlockNumber } from 'wagmi';
import { VestingTokenPrice } from './VestingTokenPrice';
import { PQWalletBalance } from './PQWalletBalance';
import { formatUnits, parseAbi } from 'viem';
import { NETWORK } from '../config/networks';

// VestingManager ABI (just the functions we need)
const VESTING_MANAGER_ABI = parseAbi([
  'function vestingSchedules(uint256) view returns (address beneficiary, uint256 totalAmount, uint256 releasedAmount, uint64 startTimestamp, uint64 cliffDuration, uint64 vestingDuration, bool revocable, bool revoked)',
  'function release(uint256 scheduleId) external',
  'function nextScheduleId() view returns (uint256)',
]);

interface VestingSchedule {
  scheduleId: number;
  beneficiary: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  startTimestamp: bigint;
  cliffDuration: bigint;
  vestingDuration: bigint;
  revocable: boolean;
  revoked: boolean;
}

export function ClaimTab() {
  const { address: connectedAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000)); // Blockchain timestamp in seconds
  const { data: blockNumber } = useBlockNumber({ watch: true }); // Watch for new blocks

  const [schedules, setSchedules] = useState<VestingSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [manualScheduleId, setManualScheduleId] = useState<string>('');
  const [loadingManual, setLoadingManual] = useState(false);
  const [pqWalletAddress, setPqWalletAddress] = useState<string | null>(null);

  const { writeContract, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // Fetch blockchain timestamp from latest block (not local time!)
  useEffect(() => {
    const updateBlockchainTime = async () => {
      if (!publicClient) return;

      try {
        const block = await publicClient.getBlock();
        const blockTime = Number(block.timestamp);
        setCurrentTime(blockTime);
        console.log('⏰ Blockchain time:', new Date(blockTime * 1000).toLocaleString(),
                    '| Local time:', new Date().toLocaleString(),
                    '| Diff:', Math.floor((Date.now() / 1000) - blockTime), 'seconds');
      } catch (err) {
        console.error('Failed to fetch block time:', err);
      }
    };

    updateBlockchainTime();
    // Update every 1 second for live demo
    const interval = setInterval(updateBlockchainTime, 1000);
    return () => clearInterval(interval);
  }, [publicClient, blockNumber]); // Re-fetch when new block arrives

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

      // Check if schedule exists
      if (schedule[0] === '0x0000000000000000000000000000000000000000') {
        setError(`Schedule #${scheduleId} does not exist`);
        setLoadingManual(false);
        return;
      }

      // Check if schedule belongs to connected wallet OR PQWallet
      const beneficiary = schedule[0].toLowerCase();
      const isOwnSchedule = beneficiary === connectedAddress.toLowerCase() ||
                           (pqWalletAddress && beneficiary === pqWalletAddress.toLowerCase());

      if (!isOwnSchedule) {
        console.log('⚠️ Schedule beneficiary:', schedule[0]);
        console.log('⚠️ Connected wallet:', connectedAddress);
        console.log('⚠️ PQWallet address:', pqWalletAddress);
        setError(`Schedule #${scheduleId} belongs to ${schedule[0]}`);
        setLoadingManual(false);
        return;
      }

      const newSchedule: VestingSchedule = {
        scheduleId,
        beneficiary: schedule[0],
        totalAmount: schedule[1],
        releasedAmount: schedule[2],
        startTimestamp: schedule[3],
        cliffDuration: schedule[4],
        vestingDuration: schedule[5],
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

  // Fetch PQWallet address from Snap
  useEffect(() => {
    const fetchPQWalletAddress = async () => {
      try {
        const NPM_SNAP_ID = 'npm:@qkey/ethvaultpq-snap';
        const LOCAL_SNAP_ID = 'local:http://localhost:8080';

        const snaps = await (window as any).ethereum?.request({
          method: 'wallet_getSnaps',
        });

        const snapId = snaps?.[NPM_SNAP_ID] ? NPM_SNAP_ID :
                       snaps?.[LOCAL_SNAP_ID] ? LOCAL_SNAP_ID : null;

        if (snapId) {
          const status = await (window as any).ethereum.request({
            method: 'wallet_invokeSnap',
            params: {
              snapId,
              request: { method: 'pqwallet_getStatus' },
            },
          });

          if (status && (status.address || status.walletAddress)) {
            setPqWalletAddress(status.address || status.walletAddress);
          }
        }
      } catch (err) {
        console.log('Could not fetch PQWallet address:', err);
      }
    };

    fetchPQWalletAddress();
  }, []);

  // Refetch schedules on successful claim
  useEffect(() => {
    if (isClaimSuccess && selectedSchedule !== null) {
      // Reload the claimed schedule to show updated amounts
      loadScheduleById(selectedSchedule);
      setSelectedSchedule(null);
    }
  }, [isClaimSuccess]);

  const calculateReleasableAmount = (schedule: VestingSchedule): bigint => {
    if (schedule.revoked) return 0n;

    const cliffEnd = Number(schedule.startTimestamp) + Number(schedule.cliffDuration);
    const vestingEnd = Number(schedule.startTimestamp) + Number(schedule.vestingDuration);

    // Before cliff
    if (currentTime < cliffEnd) return 0n;

    // After vesting period ends
    if (currentTime >= vestingEnd) {
      return schedule.totalAmount - schedule.releasedAmount;
    }

    // During vesting (linear between cliff and end)
    const vestingPeriod = vestingEnd - cliffEnd;
    const timeVested = currentTime - cliffEnd;
    const vestedAmount = (schedule.totalAmount * BigInt(timeVested)) / BigInt(vestingPeriod);
    const releasable = vestedAmount - schedule.releasedAmount;

    return releasable > 0n ? releasable : 0n;
  };

  const calculateVestedPercentage = (schedule: VestingSchedule): number => {
    if (schedule.revoked) return 0;

    const cliffEnd = Number(schedule.startTimestamp) + Number(schedule.cliffDuration);
    const vestingEnd = Number(schedule.startTimestamp) + Number(schedule.vestingDuration);

    if (currentTime < cliffEnd) return 0;

    if (currentTime >= vestingEnd) return 100;

    const vestedTime = currentTime - Number(schedule.startTimestamp);
    const totalTime = Number(schedule.vestingDuration);
    return (vestedTime * 100) / totalTime;
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

      {/* PQWallet Balance */}
      <PQWalletBalance pqWalletAddress={pqWalletAddress || undefined} />

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Vested Tokens</h2>
            <p className="text-gray-600">
              View your vesting progress and claim tokens that have vested to your PQWallet.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-mono font-semibold text-indigo-600">
              {new Date(currentTime * 1000).toLocaleTimeString()}
            </p>
          </div>
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-medium"
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
              const cliffTimestamp = Number(schedule.startTimestamp) + Number(schedule.cliffDuration);
              const endTimestamp = Number(schedule.startTimestamp) + Number(schedule.vestingDuration);
              const secondsRemaining = currentTime < endTimestamp
                ? endTimestamp - currentTime
                : 0;

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
                          {formatUnits(schedule.totalAmount, 6)} MQKEY
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Vested</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatUnits(totalVested, 6)} MQKEY
                        </p>
                        <p className="text-xs text-gray-500">{vestedPercentage.toFixed(2)}% complete</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Claimable Now</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {formatUnits(releasable, 6)} MQKEY
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 transition-all duration-500 ease-linear"
                          style={{ width: `${vestedPercentage}%` }}
                        >
                          <div className="h-full w-full animate-pulse opacity-30 bg-white"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {vestedPercentage.toFixed(2)}% vested
                        </p>
                        <p className="text-sm text-gray-600">
                          {secondsRemaining > 0
                            ? `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, '0')} remaining`
                            : 'Fully vested! 🎉'}
                        </p>
                      </div>
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
                            `Claim ${formatUnits(releasable, 6)} MQKEY`
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
                        <p className="text-gray-600">Start Time</p>
                        <p className="font-mono text-xs">{new Date(Number(schedule.startTimestamp) * 1000).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Time</p>
                        <p className="font-mono text-xs">{new Date(endTimestamp * 1000).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cliff Duration</p>
                        <p className="font-medium">{Math.floor(Number(schedule.cliffDuration) / 60)} minutes</p>
                        <p className="text-xs text-gray-500">
                          Cliff at {new Date(cliffTimestamp * 1000).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Duration</p>
                        <p className="font-medium">{Math.floor(Number(schedule.vestingDuration) / 60)} minutes</p>
                        <p className="text-xs text-gray-500">
                          ~{(Number(schedule.vestingDuration) / 86400).toFixed(1)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Already Claimed</p>
                        <p className="font-medium">{formatUnits(schedule.releasedAmount, 6)} MQKEY</p>
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
          <li>• Tokens vest linearly based on timestamps (manipulation-proof)</li>
          <li>• Claimable amount updates automatically every second</li>
          <li>• Click "Claim" to transfer vested tokens to your PQWallet</li>
          <li>• You pay gas for the claim transaction from your connected wallet</li>
          <li>• Claimed tokens are sent to the PQWallet beneficiary address</li>
        </ul>
      </div>
    </div>
  );
}
