import { useState } from 'react';
import { VestingScheduleBuilder, VestingSchedule } from './VestingScheduleBuilder';
import { VestingTimelineGraph } from './VestingTimelineGraph';
import { ReceivingVaultSetup, ReceivingVault } from './ReceivingVaultSetup';

type Step = 'schedule' | 'recipients' | 'vault' | 'review' | 'deploy';

export function VestingManagerV2() {
  const [currentStep, setCurrentStep] = useState<Step>('schedule');
  const [vestingSchedule, setVestingSchedule] = useState<VestingSchedule | null>(null);
  const [receivingVault, setReceivingVault] = useState<ReceivingVault | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  const handleScheduleChange = (schedule: VestingSchedule) => {
    setVestingSchedule(schedule);
  };

  const handleVaultCreated = (vault: ReceivingVault) => {
    setReceivingVault(vault);
    setCurrentStep('review');
  };

  const handleDeploy = async () => {
    if (!vestingSchedule) return;

    setIsDeploying(true);
    try {
      // TODO: Implement actual deployment logic
      // This would:
      // 1. Deploy receiving vault if needed
      // 2. Create vesting schedule(s) for each recipient
      // 3. Transfer tokens to vault(s)

      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate deployment

      const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
      setDeployedAddress(mockAddress);
      setCurrentStep('deploy');
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep('schedule');
    setVestingSchedule(null);
    setReceivingVault(null);
    setDeployedAddress(null);
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recipients Summary</h3>
              <button
                onClick={() => setCurrentStep('schedule')}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                ← Edit Schedule
              </button>
            </div>

            <div className="space-y-3">
              {vestingSchedule.recipients.map((recipient, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">
                        Recipient {index + 1}
                        {recipient.isVault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            Vault
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-mono mt-1">
                        {recipient.address || 'Not set'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{recipient.percentage}%</div>
                      <div className="text-sm text-gray-600">
                        {(parseFloat(vestingSchedule.totalAmount) * recipient.percentage / 100).toLocaleString()} MUSDC
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
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

            {/* Recipients */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Recipients</h4>
              <div className="space-y-2">
                {vestingSchedule.recipients.map((recipient, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="text-sm">
                      <span className="font-mono text-gray-700">{recipient.address || 'Not set'}</span>
                      {recipient.isVault && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          Vault
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium">{recipient.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

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
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 font-medium"
            >
              {isDeploying ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Deploying...
                </>
              ) : (
                '🚀 Deploy Vesting Schedule'
              )}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'deploy' && deployedAddress && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vesting Schedule Deployed!</h2>
            <p className="text-gray-600 mb-6">
              Your vesting schedule has been successfully deployed to Tenderly Ethereum.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Vesting Contract Address:</div>
              <div className="text-lg font-mono font-semibold text-green-700">{deployedAddress}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">{vestingSchedule?.recipients.length}</div>
                <div className="text-sm text-gray-600">Recipients</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">{vestingSchedule?.totalAmount}</div>
                <div className="text-sm text-gray-600">MUSDC Total</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-900">{vestingSchedule?.vestingMonths}</div>
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
                href={`https://dashboard.tenderly.co/contract/${deployedAddress}`}
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
    </div>
  );
}
