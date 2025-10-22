import { useState } from 'react';
import { SUPPORTED_NETWORKS } from '../config/networks';

export type ContractName =
  | 'groth16Verifier'
  | 'pqValidator'
  | 'pqWalletFactory'
  | 'pqVault4626'
  | 'pqVault4626Demo'
  | 'zkProofOracle'
  | 'qrngOracle'
  | 'mockToken';

export type DeploymentStatus = 'not-deployed' | 'deploying' | 'deployed' | 'verified' | 'error';

export interface ContractStatus {
  address?: string;
  status: DeploymentStatus;
  txHash?: string;
  error?: string;
  gasUsed?: bigint;
  verificationStatus?: 'pending' | 'verified' | 'failed';
}

export interface DeploymentState {
  groth16Verifier: ContractStatus;
  pqValidator: ContractStatus;
  pqWalletFactory: ContractStatus;
  pqVault4626: ContractStatus;
  pqVault4626Demo: ContractStatus;
  zkProofOracle: ContractStatus;
  qrngOracle: ContractStatus;
  mockToken: ContractStatus;
}

const INITIAL_DEPLOYMENT_STATE: DeploymentState = {
  groth16Verifier: {
    status: 'deployed',
    address: '0x1b7754689d5bDf4618aA52dDD319D809a00B0843',
    txHash: '0x796b55fe5d446d0b8d5c12d14695d6b5fddffbe6c9b34fc199e80f12c7e7ce87',
    gasUsed: BigInt(473670),
    verificationStatus: 'verified'
  },
  pqValidator: {
    status: 'deployed',
    address: '0xaa38b98b510781C6c726317FEb12610BEe90aE20',
    gasUsed: BigInt(1119547),
    verificationStatus: 'verified'
  },
  pqWalletFactory: {
    status: 'deployed',
    address: '0xdFedc33d4Ae2923926b4f679379f0960d62B0182',
    gasUsed: BigInt(1912300),
    verificationStatus: 'verified'
  },
  pqVault4626: {
    status: 'deployed',
    address: '0x634b095371e4E45FEeD94c1A45C37798E173eA50',
    gasUsed: BigInt(1200000),
    verificationStatus: 'verified'
  },
  pqVault4626Demo: {
    status: 'deployed',
    address: '0x05060D66d43897Bf93922e8bF8819126dfcc96AF',
    gasUsed: BigInt(1200000),
    verificationStatus: 'verified'
  },
  zkProofOracle: {
    status: 'deployed',
    address: '0x55fa5F3797fB732bEe5a147b9429eAE4B083B75B',
    gasUsed: BigInt(2793833),
    verificationStatus: 'verified'
  },
  qrngOracle: {
    status: 'deployed',
    address: '0xF631eb60D0A403499A8Df8CBd22935e0c0406D72',
    gasUsed: BigInt(2328341),
    verificationStatus: 'verified'
  },
  mockToken: {
    status: 'deployed',
    address: '0x3BB798Ecf5dF703A5F00C6987c42e6Da1Cea3730',
    gasUsed: BigInt(464402),
    verificationStatus: 'verified'
  },
};

const CONTRACT_INFO: Record<ContractName, {
  displayName: string;
  description: string;
  dependencies?: ContractName[];
  deploymentOrder: number;
}> = {
  groth16Verifier: {
    displayName: 'Groth16 Verifier',
    description: 'ZK-SNARK proof verifier for Dilithium signatures',
    deploymentOrder: 1,
  },
  pqValidator: {
    displayName: 'PQ Validator',
    description: 'Post-quantum signature validator (ERC-4337)',
    dependencies: ['groth16Verifier'],
    deploymentOrder: 2,
  },
  pqWalletFactory: {
    displayName: 'PQ Wallet Factory',
    description: 'Factory for creating post-quantum wallets',
    dependencies: ['pqValidator'],
    deploymentOrder: 3,
  },
  mockToken: {
    displayName: 'Mock Token',
    description: 'ERC-20 token for testing vesting',
    deploymentOrder: 4,
  },
  pqVault4626: {
    displayName: 'PQ Vault (ERC-4626)',
    description: 'Vesting vault with quantum-resistant features',
    dependencies: ['mockToken'],
    deploymentOrder: 5,
  },
  pqVault4626Demo: {
    displayName: 'PQ Vault Demo',
    description: 'Fast-forward vesting (1 month per minute)',
    dependencies: ['mockToken'],
    deploymentOrder: 6,
  },
  zkProofOracle: {
    displayName: 'ZK Proof Oracle',
    description: 'Oracle for off-chain ZK proof verification',
    dependencies: ['groth16Verifier'],
    deploymentOrder: 7,
  },
  qrngOracle: {
    displayName: 'QRNG Oracle',
    description: 'Quantum random number generator oracle',
    deploymentOrder: 8,
  },
};

export function DeployTab() {
  const [selectedNetwork, setSelectedNetwork] = useState(0); // Default to Tenderly
  const [deploymentState, setDeploymentState] = useState<DeploymentState>(INITIAL_DEPLOYMENT_STATE);

  const network = SUPPORTED_NETWORKS[selectedNetwork];
  const isMainnet = network.name === 'Ethereum Mainnet';
  const isDisabled = (network as any).disabled;

  // Calculate deployment progress
  const totalContracts = Object.keys(deploymentState).length;
  const deployedContracts = Object.values(deploymentState).filter(
    contract => contract.status === 'deployed' || contract.status === 'verified'
  ).length;
  const progressPercentage = (deployedContracts / totalContracts) * 100;

  const handleDeploy = async (contractName: ContractName) => {
    // Update status to deploying
    setDeploymentState(prev => ({
      ...prev,
      [contractName]: { ...prev[contractName], status: 'deploying' },
    }));

    try {
      // TODO: Implement actual deployment logic
      console.log(`Deploying ${contractName} to ${network.name}...`);

      // Simulate deployment (replace with actual logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update with deployed status
      setDeploymentState(prev => ({
        ...prev,
        [contractName]: {
          status: 'deployed',
          address: '0x' + Math.random().toString(16).slice(2, 42),
          txHash: '0x' + Math.random().toString(16).slice(2, 66),
        },
      }));
    } catch (error) {
      setDeploymentState(prev => ({
        ...prev,
        [contractName]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  };

  const handleVerify = async (contractName: ContractName) => {
    const contract = deploymentState[contractName];
    if (!contract.address) return;

    try {
      // TODO: Implement actual verification logic
      console.log(`Verifying ${contractName} at ${contract.address}...`);

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      setDeploymentState(prev => ({
        ...prev,
        [contractName]: {
          ...prev[contractName],
          status: 'verified',
          verificationStatus: 'verified',
        },
      }));
    } catch (error) {
      console.error(`Verification failed for ${contractName}:`, error);
    }
  };

  const canDeploy = (contractName: ContractName): boolean => {
    const info = CONTRACT_INFO[contractName];
    if (!info.dependencies) return true;

    return info.dependencies.every(
      dep => deploymentState[dep].status === 'deployed' || deploymentState[dep].status === 'verified'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contract Deployment</h2>
            <p className="text-gray-600 mt-1">
              Deploy EthVaultPQ contracts to {network.name}
            </p>
          </div>

          {/* Network Selector */}
          <div className="flex items-center space-x-4">
            <label htmlFor="network" className="text-sm font-medium text-gray-700">
              Network:
            </label>
            <select
              id="network"
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(Number(e.target.value))}
              className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isDisabled}
            >
              {SUPPORTED_NETWORKS.map((net, idx) => (
                <option key={net.chainId} value={idx}>
                  {net.name} {(net as any).disabled ? '(Requires Audit)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Chain ID:</span>
            <span className="ml-2 font-medium">{network.chainId}</span>
          </div>
          <div>
            <span className="text-gray-500">RPC:</span>
            <span className="ml-2 font-mono text-xs">{network.rpcUrl.slice(0, 40)}...</span>
          </div>
          <div>
            <span className="text-gray-500">Explorer:</span>
            <a
              href={network.blockExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              View
            </a>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Deployment Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {deployedContracts} / {totalContracts} Deployed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-indigo-600 h-4 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Warning for Mainnet */}
      {isMainnet && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Mainnet Deployment Disabled
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Mainnet deployment requires a professional security audit. Please complete testing on Tenderly and Sepolia first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Deployment Cards */}
      <div className="space-y-4">
        {(Object.entries(CONTRACT_INFO) as [ContractName, typeof CONTRACT_INFO[ContractName]][])
          .sort(([, a], [, b]) => a.deploymentOrder - b.deploymentOrder)
          .map(([contractName, info]) => {
            const contract = deploymentState[contractName];
            const canDeployContract = canDeploy(contractName);

            return (
              <ContractCard
                key={contractName}
                contractName={contractName}
                info={info}
                contract={contract}
                canDeploy={canDeployContract && !isDisabled}
                network={network}
                onDeploy={() => handleDeploy(contractName)}
                onVerify={() => handleVerify(contractName)}
              />
            );
          })}
      </div>

      {/* Action Buttons */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-4">
          <button
            disabled={isDisabled || deployedContracts === totalContracts}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Deploy All
          </button>
          <button
            disabled={deployedContracts === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Verify All
          </button>
          <button
            disabled={deployedContracts === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export Addresses
          </button>
        </div>
      </div>
    </div>
  );
}

interface ContractCardProps {
  contractName: ContractName;
  info: typeof CONTRACT_INFO[ContractName];
  contract: ContractStatus;
  canDeploy: boolean;
  network: typeof SUPPORTED_NETWORKS[number];
  onDeploy: () => void;
  onVerify: () => void;
}

function ContractCard({ info, contract, canDeploy, network, onDeploy, onVerify }: ContractCardProps) {
  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'not-deployed': return 'bg-gray-100 text-gray-800';
      case 'deploying': return 'bg-yellow-100 text-yellow-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: DeploymentStatus) => {
    switch (status) {
      case 'not-deployed': return '⚪';
      case 'deploying': return '⏳';
      case 'deployed': return '✅';
      case 'verified': return '✅';
      case 'error': return '❌';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{info.displayName}</h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
              {getStatusIcon(contract.status)} {contract.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{info.description}</p>

          {info.dependencies && (
            <p className="text-xs text-gray-500 mt-2">
              Requires: {info.dependencies.map(dep => CONTRACT_INFO[dep].displayName).join(', ')}
            </p>
          )}

          {contract.address && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Address:</span>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {contract.address}
                </code>
                <a
                  href={`${network.blockExplorer}/address/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View
                </a>
              </div>
              {contract.txHash && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Tx Hash:</span>
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {contract.txHash.slice(0, 10)}...{contract.txHash.slice(-8)}
                  </code>
                </div>
              )}
            </div>
          )}

          {contract.error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
              Error: {contract.error}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {contract.status === 'not-deployed' && (
            <button
              onClick={onDeploy}
              disabled={!canDeploy}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Deploy
            </button>
          )}

          {contract.status === 'deploying' && (
            <button
              disabled
              className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-md cursor-wait"
            >
              Deploying...
            </button>
          )}

          {(contract.status === 'deployed' || contract.status === 'verified') && (
            <>
              <button
                onClick={onVerify}
                disabled={contract.status === 'verified'}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {contract.status === 'verified' ? 'Verified' : 'Verify'}
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                Test
              </button>
            </>
          )}

          {contract.status === 'error' && (
            <button
              onClick={onDeploy}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
