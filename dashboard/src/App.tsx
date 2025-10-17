import '@rainbow-me/rainbowkit/styles.css';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';
import { WalletCreator } from './components/WalletCreator';
import { VestingManagerV2 } from './components/VestingManagerV2';
import { VerificationModeSelector } from './components/VerificationModeSelector';
import { DeployTab } from './components/DeployTab';

const queryClient = new QueryClient();

type Tab = 'home' | 'wallet' | 'vesting' | 'deploy' | 'oracles' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('deploy'); // Default to deploy tab as it's high priority

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  EthVaultPQ - Post-Quantum Ethereum Protocol
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  ERC-4337 Wallets • ERC-4626 Vesting • ZK-SNARK Oracles • NIST ML-DSA/SLH-DSA
                </p>
              </div>
            </header>

            {/* Tab Navigation */}
            <nav className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex space-x-8">
                  <TabButton
                    active={activeTab === 'home'}
                    onClick={() => setActiveTab('home')}
                  >
                    Home
                  </TabButton>
                  <TabButton
                    active={activeTab === 'deploy'}
                    onClick={() => setActiveTab('deploy')}
                    badge="NEW"
                  >
                    Deploy
                  </TabButton>
                  <TabButton
                    active={activeTab === 'wallet'}
                    onClick={() => setActiveTab('wallet')}
                  >
                    Wallets
                  </TabButton>
                  <TabButton
                    active={activeTab === 'vesting'}
                    onClick={() => setActiveTab('vesting')}
                  >
                    Vesting
                  </TabButton>
                  <TabButton
                    active={activeTab === 'oracles'}
                    onClick={() => setActiveTab('oracles')}
                  >
                    Oracles
                  </TabButton>
                  <TabButton
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </TabButton>
                </div>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4">
              {activeTab === 'home' && (
                <div className="space-y-8">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Welcome to EthVaultPQ</h2>
                    <p className="text-gray-600 mb-4">
                      The first post-quantum secure smart contract protocol on Ethereum.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <StatCard title="Contracts" value="8" description="Post-quantum secure" />
                      <StatCard title="Network" value="Tenderly" description="Ethereum Virtual TestNet" />
                      <StatCard title="Status" value="Testnet" description="Ready for deployment" />
                    </div>
                  </div>
                  <VerificationModeSelector />
                </div>
              )}

              {activeTab === 'deploy' && <DeployTab />}

              {activeTab === 'wallet' && (
                <div className="space-y-8">
                  <VerificationModeSelector />
                  <WalletCreator />
                </div>
              )}

              {activeTab === 'vesting' && <VestingManagerV2 />}

              {activeTab === 'oracles' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Oracle Services</h2>
                  <p className="text-gray-600">
                    ZK Proof and QRNG oracles will be available after deployment.
                  </p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-gray-600">
                    Network configuration and wallet settings.
                  </p>
                </div>
              )}
            </main>

            <footer className="bg-white mt-12 border-t">
              <div className="max-w-7xl mx-auto py-6 px-4 text-center text-gray-500">
                <p>Built with ERC-4337, ERC-4626, and Post-Quantum Cryptography (NIST ML-DSA/SLH-DSA)</p>
                <p className="text-sm mt-2">
                  WARNING: Testnet version. Requires professional audit before mainnet deployment.
                </p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: string;
}

function TabButton({ active, onClick, children, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-4 px-1 font-medium text-sm transition-colors
        ${active
          ? 'text-indigo-600 border-b-2 border-indigo-600'
          : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
        }
      `}
    >
      {children}
      {badge && (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}

export default App;
