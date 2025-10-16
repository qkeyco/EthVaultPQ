import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';
import { WalletCreator } from './components/WalletCreator';
import { VaultManager } from './components/VaultManager';
import { VerificationModeSelector } from './components/VerificationModeSelector';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="max-w-7xl mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  PQ Wallet - Post-Quantum Secure Ethereum Wallet
                </h1>
              </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4">
              <div className="space-y-8">
                <VerificationModeSelector />
                <WalletCreator />
                <VaultManager />
              </div>
            </main>

            <footer className="bg-white mt-12 border-t">
              <div className="max-w-7xl mx-auto py-6 px-4 text-center text-gray-500">
                <p>Built with ERC-4337, ERC-4626, and Post-Quantum Cryptography</p>
                <p className="text-sm mt-2">
                  WARNING: Experimental software. Not audited. Use at your own risk.
                </p>
              </div>
            </footer>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
