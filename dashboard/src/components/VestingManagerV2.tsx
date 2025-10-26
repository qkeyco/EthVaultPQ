import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { VestingScheduleBuilder, VestingSchedule } from './VestingScheduleBuilder';
import { VestingTimelineGraph } from './VestingTimelineGraph';
import { ReceivingVaultSetup, ReceivingVault } from './ReceivingVaultSetup';
import { PQWalletSetup, PQWalletCreated } from './PQWalletSetup';
import VestingManagerABI from '../abi/VestingManager.json';
import MockTokenABI from '../abi/MockToken.json';

type Step = 'schedule' | 'recipients' | 'vault' | 'review' | 'deploy';

// Deployed contract addresses on EthPQtest2 (Tenderly)
const VESTING_MANAGER_ADDRESS = '0x290d5b2F55866d2357cbf0a31724850091dF5dd5' as `0x${string}`;
const MOCK_TOKEN_ADDRESS = '0x4E94A1765779fe999638d26afC71b8A049a5164d' as `0x${string}`;

export function VestingManagerV2() {
  const { address: userAddress, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [currentStep, setCurrentStep] = useState<Step>('schedule');
  const [vestingSchedule, setVestingSchedule] = useState<VestingSchedule | null>(null);
  const [pqWallet, setPqWallet] = useState<PQWalletCreated | null>(null);
  const [receivingVault, setReceivingVault] = useState<ReceivingVault | null>(null);
  const [deploymentStep, setDeploymentStep] = useState<'approval' | 'creating' | 'done'>('approval');
  const [deployedScheduleId, setDeployedScheduleId] = useState<string | null>(null);

  // Handle approval confirmation - move to creating step
  useEffect(() => {
    if (isSuccess && deploymentStep === 'approval') {
      // Wait a moment to show the success message, then enable the create button
      const timer = setTimeout(() => {
        // User will manually click "Create Vesting" button
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, deploymentStep]);

  // Handle vesting creation confirmation - extract schedule ID and mark done
  useEffect(() => {
    if (isSuccess && deploymentStep === 'creating' && hash) {
      // In production, we would parse the transaction receipt to get the schedule ID
      // For now, we'll use a placeholder until we can read the event logs
      const scheduleId = `0x${hash.slice(2, 10)}`; // First 4 bytes of tx hash as placeholder
      setDeployedScheduleId(scheduleId);
      setDeploymentStep('done');
    }
  }, [isSuccess, deploymentStep, hash]);

  const handleScheduleChange = (schedule: VestingSchedule) => {
    setVestingSchedule(schedule);
  };

  const handlePQWalletCreated = (wallet: PQWalletCreated) => {
    setPqWallet(wallet);
    // Auto-fill the recipient with PQWallet address
    if (vestingSchedule) {
      const updatedSchedule = {
        ...vestingSchedule,
        recipients: [
          {
            address: wallet.address,
            percentage: 100,
            isVault: false,
          }
        ]
      };
      setVestingSchedule(updatedSchedule);
    }
  };

  const handleVaultCreated = (vault: ReceivingVault) => {
    setReceivingVault(vault);
    setCurrentStep('review');
  };

  const handleApproveTokens = async () => {
    if (!vestingSchedule || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // For single recipient deployment
    const recipient = vestingSchedule.recipients[0];
    if (!recipient || !recipient.address) {
      alert('Please enter a recipient address');
      return;
    }

    const amount = parseUnits(vestingSchedule.totalAmount, 6); // MUSDC is 6 decimals

    try {
      writeContract({
        address: MOCK_TOKEN_ADDRESS,
        abi: MockTokenABI,
        functionName: 'approve',
        args: [VESTING_MANAGER_ADDRESS, amount],
      });
      setDeploymentStep('approval');
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Token approval failed: ' + (err as Error).message);
    }
  };

  const handleCreateVesting = async () => {
    if (!vestingSchedule || !isConnected || !pqWallet) {
      alert('Please complete PQWallet setup first');
      return;
    }

    const amount = parseUnits(vestingSchedule.totalAmount, 6); // MUSDC is 6 decimals

    // Convert months to seconds (for duration)
    const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;
    const cliffDuration = vestingSchedule.cliffMonths * SECONDS_PER_MONTH;
    const vestingDuration = vestingSchedule.vestingMonths * SECONDS_PER_MONTH;

    try {
      writeContract({
        address: VESTING_MANAGER_ADDRESS,
        abi: VestingManagerABI,
        functionName: 'createVestingSchedule',
        args: [
          pqWallet.address as `0x${string}`, // Use PQWallet address as beneficiary
          amount,
          BigInt(cliffDuration),
          BigInt(vestingDuration),
          false // not revocable
        ],
      });
      setDeploymentStep('creating');
    } catch (err) {
      console.error('Vesting creation failed:', err);
      alert('Vesting creation failed: ' + (err as Error).message);
    }
  };

  const resetWizard = () => {
    setCurrentStep('schedule');
    setVestingSchedule(null);
    setReceivingVault(null);
    setDeployedScheduleId(null);
    setDeploymentStep('approval');
  };

  const steps = [
    { id: 'schedule', name: 'Schedule', icon: '📅' },
    { id: 'recipients', name: 'Recipients', icon: '👥' },
    { id: 'vault', name: 'Vault Setup', icon: '🏦' },
    { id: 'review', name: 'Review', icon: '✓' },
    { id: 'deploy', name: 'Deploy', icon: '🚀' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 2: Set up a time based payment such as vesting</h2>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    index <= currentStepIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <div className={`mt-2 text-sm font-medium ${
                  index <= currentStepIndex ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'schedule' && (
        <div className="space-y-6">
          <VestingScheduleBuilder onScheduleChange={handleScheduleChange} />

          {vestingSchedule && (
            <>
              <VestingTimelineGraph schedule={vestingSchedule} />

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('recipients')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                  Continue to Recipients →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {currentStep === 'recipients' && vestingSchedule && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold mb-2">Beneficiary Setup</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your vested tokens will be sent to a quantum-resistant PQWallet. This protects your assets from future quantum computer attacks.
            </p>

            {pqWallet ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      ✅ PQWallet Ready
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      <div><strong>Address:</strong> <span className="font-mono text-xs break-all">{pqWallet.address}</span></div>
                      <div><strong>Amount:</strong> {vestingSchedule.totalAmount} MUSDC will vest to this wallet</div>
                      <div><strong>Security:</strong> Dilithium3 quantum-resistant signatures</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPqWallet(null)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <PQWalletSetup onWalletCreated={handlePQWalletCreated} />
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('schedule')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep('vault')}
              disabled={!pqWallet}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              Continue to Vault Setup →
            </button>
          </div>
        </div>
      )}

      {currentStep === 'vault' && (
        <div className="space-y-6">
          <ReceivingVaultSetup onVaultCreated={handleVaultCreated} />

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('recipients')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep('review')}
              className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed font-medium"
              disabled
            >
              Skip Vault Setup →
            </button>
          </div>
        </div>
      )}

      {currentStep === 'review' && vestingSchedule && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-6">Review Vesting Setup</h3>

            {/* Schedule Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Vesting Schedule</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Preset:</span>
                  <span className="ml-2 font-medium">{vestingSchedule.preset}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <span className="ml-2 font-medium">
                    {vestingSchedule.mode === 'test' ? '⚡ Test Mode' : '🕐 Production'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-medium">{vestingSchedule.totalAmount} MUSDC</span>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <span className="ml-2 font-medium">
                    {vestingSchedule.startDate.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Cliff:</span>
                  <span className="ml-2 font-medium">{vestingSchedule.cliffMonths} months</span>
                </div>
                <div>
                  <span className="text-gray-600">Vesting Period:</span>
                  <span className="ml-2 font-medium">{vestingSchedule.vestingMonths} months</span>
                </div>
              </div>
            </div>

            {/* PQWallet Beneficiary */}
            {pqWallet && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Beneficiary (PQWallet)</h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔐</div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 mb-1">Quantum-Resistant Wallet</div>
                      <div className="text-sm text-green-800 space-y-1">
                        <div className="font-mono text-xs break-all">{pqWallet.address}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-green-200 text-green-900 rounded">Dilithium3</span>
                          <span className="px-2 py-0.5 bg-green-200 text-green-900 rounded">ML-DSA-65</span>
                          <span className="text-green-700">100% allocation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receiving Vault */}
            {receivingVault && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Receiving Vault</h4>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">{receivingVault.name}</div>
                    <div className="text-blue-700 font-mono text-xs mt-1">{receivingVault.address}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Preview */}
            <VestingTimelineGraph schedule={vestingSchedule} />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep('vault')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
            >
              ← Back
            </button>
            <button
              onClick={() => setCurrentStep('deploy')}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Continue to Deploy →
            </button>
          </div>
        </div>
      )}

      {currentStep === 'deploy' && vestingSchedule && (
        <div className="space-y-6">
          {/* Deployment Success */}
          {deploymentStep === 'done' && deployedScheduleId && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vesting Schedule Deployed!</h2>
                <p className="text-gray-600 mb-6">
                  Your vesting schedule has been successfully deployed to Tenderly Ethereum.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="text-sm text-gray-600 mb-1">Schedule ID:</div>
                  <div className="text-lg font-mono font-semibold text-green-700">{deployedScheduleId}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-900">{vestingSchedule.recipients.length}</div>
                    <div className="text-sm text-gray-600">Recipients</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-900">{vestingSchedule.totalAmount}</div>
                    <div className="text-sm text-gray-600">MUSDC Total</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-2xl font-bold text-gray-900">{vestingSchedule.vestingMonths}</div>
                    <div className="text-sm text-gray-600">Months</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetWizard}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                  >
                    Create Another Schedule
                  </button>
                  <a
                    href={`https://dashboard.tenderly.co/jt-ventures/project/ethpqtest2/contract/${VESTING_MANAGER_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                  >
                    View on Tenderly →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 2-Step Deployment Process */}
          {deploymentStep !== 'done' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Deploy Vesting Schedule</h3>

              {/* Step 1: Approve Tokens */}
              <div className={`p-6 rounded-lg border-2 mb-4 ${
                deploymentStep === 'approval' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold mb-2 flex items-center">
                      <span className="mr-3 text-2xl">1️⃣</span>
                      Approve Token Spending
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Allow VestingManager to spend {vestingSchedule.totalAmount} MUSDC from your wallet.
                    </p>

                    {!isConnected && (
                      <div className="text-sm text-amber-600 mb-3">
                        ⚠️ Please connect your wallet first
                      </div>
                    )}

                    <button
                      onClick={handleApproveTokens}
                      disabled={!isConnected || isPending || isConfirming || deploymentStep !== 'approval'}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          {isPending ? 'Waiting for approval...' : 'Confirming...'}
                        </>
                      ) : (
                        '✓ Approve Tokens'
                      )}
                    </button>

                    {isSuccess && deploymentStep === 'approval' && (
                      <div className="mt-3 text-sm text-green-600 font-medium">
                        ✓ Approval confirmed! You can now create the vesting schedule.
                      </div>
                    )}

                    {error && (
                      <div className="mt-3 text-sm text-red-600">
                        ❌ Error: {error.message}
                      </div>
                    )}
                  </div>

                  {isSuccess && deploymentStep === 'approval' && (
                    <div className="ml-4 text-3xl text-green-500">✓</div>
                  )}
                </div>
              </div>

              {/* Step 2: Create Vesting */}
              <div className={`p-6 rounded-lg border-2 ${
                deploymentStep === 'creating' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold mb-2 flex items-center">
                      <span className="mr-3 text-2xl">2️⃣</span>
                      Create Vesting Schedule
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Deploy the vesting schedule on-chain with the configured parameters.
                    </p>

                    <button
                      onClick={handleCreateVesting}
                      disabled={deploymentStep !== 'approval' || !isSuccess || isPending || isConfirming}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                    >
                      {deploymentStep === 'creating' && (isPending || isConfirming) ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          {isPending ? 'Creating...' : 'Confirming...'}
                        </>
                      ) : (
                        '🚀 Create Vesting'
                      )}
                    </button>

                    {deploymentStep === 'creating' && isSuccess && (
                      <div className="mt-3 text-sm text-green-600 font-medium">
                        ✓ Vesting schedule created successfully!
                      </div>
                    )}
                  </div>

                  {deploymentStep === 'creating' && isSuccess && (
                    <div className="ml-4 text-3xl text-green-500">✓</div>
                  )}
                </div>
              </div>

              {hash && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Transaction Hash:</div>
                  <div className="text-xs font-mono text-blue-700 break-all">{hash}</div>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep('review')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  ← Back to Review
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
