import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NETWORK } from '../config/networks';

export const WalletCreator = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [pqPublicKey, setPqPublicKey] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const generatePQKeyPair = async () => {
    addLog('Generating PQ key pair...');

    // TODO: Implement actual SPHINCS+ key generation
    // For now, generate a random 32-byte key for testing
    const randomKey = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    const key = `0x${randomKey}`;
    setPqPublicKey(key);
    addLog(`PQ Public Key generated: ${key.slice(0, 20)}...`);
    addLog('CRITICAL: Save your PQ private key securely! This is a placeholder.');
  };

  const createWallet = async () => {
    if (!pqPublicKey || !walletClient || !publicClient) {
      addLog('Error: Missing required data');
      return;
    }

    setIsCreating(true);
    try {
      addLog('Creating PQ Wallet...');

      const salt = BigInt(Math.floor(Math.random() * 1000000));

      // TODO: Replace with actual contract ABI and address
      addLog('ERROR: Contract not deployed yet. Please deploy contracts first.');
      addLog(`Factory address needed: ${NETWORK.contracts.pqWalletFactory}`);

      // Example of what the actual call would look like:
      /*
      const hash = await walletClient.writeContract({
        address: NETWORK.contracts.pqWalletFactory as `0x${string}`,
        abi: pqWalletFactoryAbi,
        functionName: 'createWallet',
        args: [pqPublicKey as `0x${string}`, salt],
      });

      addLog(`Transaction sent: ${hash}`);
      addLog('Waiting for confirmation...');

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Extract wallet address from logs
      addLog('Wallet created successfully!');
      setWalletAddress('0x...');
      */

    } catch (error: any) {
      addLog(`Error: ${error.message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Post-Quantum Wallet</h2>

      {!isConnected ? (
        <div className="mb-4">
          <p className="mb-4 text-gray-600">
            Connect your MetaMask wallet to get started
          </p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          {!pqPublicKey && (
            <button
              onClick={generatePQKeyPair}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Generate PQ Key Pair
            </button>
          )}

          {pqPublicKey && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm font-mono break-all">
                  PQ Public Key: {pqPublicKey}
                </p>
              </div>

              {!walletAddress && (
                <button
                  onClick={createWallet}
                  disabled={isCreating}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {isCreating ? 'Creating Wallet...' : 'Create PQ Wallet'}
                </button>
              )}

              {walletAddress && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-green-800 font-semibold">
                    Wallet Created Successfully!
                  </p>
                  <p className="text-sm font-mono mt-2">
                    Address: {walletAddress}
                  </p>
                </div>
              )}
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
