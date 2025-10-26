/**
 * PQWallet Setup Component
 * Guides users through creating a Post-Quantum wallet using MetaMask Snap
 */

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import {
  isMetaMaskAvailable,
  isSnapInstalled,
  installSnap,
  createPQWallet,
  getPQWalletInfo,
  PQWalletInfo,
} from '../lib/snapApi';
import PQWalletFactoryABI from '../abi/PQWalletFactory.json';
import { NETWORK } from '../config/networks';

export interface PQWalletCreated {
  address: string;
  publicKey: string;
  isDeployed: boolean;
}

interface PQWalletSetupProps {
  onWalletCreated: (wallet: PQWalletCreated) => void;
}

export function PQWalletSetup({ onWalletCreated }: PQWalletSetupProps) {
  const [step, setStep] = useState<'check' | 'install-metamask' | 'install-snap' | 'create-wallet' | 'deploy-wallet' | 'done'>('check');
  const [snapInstalled, setSnapInstalled] = useState(false);
  const [walletInfo, setWalletInfo] = useState<PQWalletInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📝';
    setLogs(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    addLog('Checking PQWallet status...');

    // Check MetaMask
    if (!isMetaMaskAvailable()) {
      setStep('install-metamask');
      addLog('MetaMask not detected', 'error');
      return;
    }
    addLog('MetaMask detected', 'success');

    // Check Snap
    const installed = await isSnapInstalled();
    setSnapInstalled(installed);

    if (!installed) {
      setStep('install-snap');
      addLog('Snap not installed', 'info');
      return;
    }
    addLog('Snap installed', 'success');

    // Check if wallet exists
    const info = await getPQWalletInfo();
    if (!info) {
      setStep('create-wallet');
      addLog('No PQWallet found - create one', 'info');
      return;
    }

    setWalletInfo(info);
    addLog(`PQWallet found: ${info.address}`, 'success');

    // Check if deployed on-chain
    const code = await publicClient?.getBytecode({ address: info.address as `0x${string}` });
    const deployed = code && code !== '0x';

    if (!deployed) {
      setStep('deploy-wallet');
      addLog('PQWallet not deployed on-chain yet', 'info');
      return;
    }

    addLog('PQWallet fully deployed!', 'success');
    setStep('done');
    onWalletCreated({
      address: info.address,
      publicKey: info.publicKey,
      isDeployed: true,
    });
  };

  const handleInstallSnap = async () => {
    try {
      addLog('Installing Snap...');
      await installSnap();
      setSnapInstalled(true);
      addLog('Snap installed successfully!', 'success');
      setStep('create-wallet');
    } catch (err: any) {
      addLog(`Failed to install Snap: ${err.message}`, 'error');
    }
  };

  const handleCreateWallet = async () => {
    try {
      addLog('Creating PQWallet in Snap...');
      addLog('Generating Dilithium3 keypair...');
      const info = await createPQWallet();
      setWalletInfo(info);
      addLog(`Wallet created! Address: ${info.address}`, 'success');
      addLog(`Public Key: ${info.publicKey.substring(0, 32)}...`, 'info');
      setStep('deploy-wallet');
    } catch (err: any) {
      addLog(`Failed to create wallet: ${err.message}`, 'error');
    }
  };

  const handleDeployWallet = async () => {
    if (!walletInfo) {
      addLog('No wallet info available', 'error');
      return;
    }

    try {
      addLog('Deploying PQWallet to blockchain...');

      // Generate random salt
      const salt = BigInt(Math.floor(Math.random() * 1000000000));

      writeContract({
        address: NETWORK.contracts.pqWalletFactory as `0x${string}`,
        abi: PQWalletFactoryABI,
        functionName: 'createWallet',
        args: [walletInfo.publicKey as `0x${string}`, salt],
      });

      addLog('Transaction sent...', 'info');
    } catch (err: any) {
      addLog(`Deployment failed: ${err.message}`, 'error');
    }
  };

  useEffect(() => {
    if (isSuccess && walletInfo) {
      addLog('PQWallet deployed successfully!', 'success');
      setStep('done');
      onWalletCreated({
        address: walletInfo.address,
        publicKey: walletInfo.publicKey,
        isDeployed: true,
      });
    }
  }, [isSuccess, walletInfo]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🔐 Post-Quantum Wallet Setup
        <span className="text-sm text-gray-500 font-normal">(Required for Vesting)</span>
      </h3>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Why PQWallet?</strong> Your vested tokens will be secured with quantum-resistant Dilithium3 signatures,
          protecting them from future quantum computer attacks.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center justify-between text-sm">
        <div className={`flex-1 text-center ${step !== 'install-metamask' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          {step !== 'install-metamask' ? '✓' : '1'} MetaMask
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full ${snapInstalled ? 'bg-green-600' : 'bg-gray-200'}`} />
        </div>
        <div className={`flex-1 text-center ${snapInstalled ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          {snapInstalled ? '✓' : '2'} Snap
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full ${walletInfo ? 'bg-green-600' : 'bg-gray-200'}`} />
        </div>
        <div className={`flex-1 text-center ${walletInfo ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          {walletInfo ? '✓' : '3'} Create
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2">
          <div className={`h-full ${step === 'done' ? 'bg-green-600' : 'bg-gray-200'}`} />
        </div>
        <div className={`flex-1 text-center ${step === 'done' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
          {step === 'done' ? '✓' : '4'} Deploy
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {step === 'install-metamask' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded">
            <h4 className="font-semibold text-amber-900 mb-2">Install MetaMask</h4>
            <p className="text-sm text-amber-800 mb-3">
              MetaMask extension is required to use the PQWallet Snap.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Install MetaMask →
            </a>
          </div>
        )}

        {step === 'install-snap' && (
          <div>
            <h4 className="font-semibold mb-2">Install EthVaultPQ Snap</h4>
            <p className="text-sm text-gray-600 mb-3">
              The Snap runs securely inside MetaMask and handles all cryptographic operations.
            </p>
            <button
              onClick={handleInstallSnap}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Install Snap
            </button>
          </div>
        )}

        {step === 'create-wallet' && (
          <div>
            <h4 className="font-semibold mb-2">Use Existing Wallet</h4>
            <p className="text-sm text-gray-600 mb-3">
              Use the quantum-resistant wallet from your Snap. If you haven't created one yet, this will generate your Dilithium3 keypair.
            </p>
            <button
              onClick={handleCreateWallet}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Get Wallet from Snap
            </button>
          </div>
        )}

        {step === 'deploy-wallet' && walletInfo && (
          <div>
            <h4 className="font-semibold mb-2">Deploy PQWallet</h4>
            <p className="text-sm text-gray-600 mb-3">
              Deploy your PQWallet smart contract on-chain. This is a one-time transaction.
            </p>
            <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Wallet Address (counterfactual):</div>
              <div className="font-mono text-sm break-all">{walletInfo.address}</div>
            </div>
            <button
              onClick={handleDeployWallet}
              disabled={isPending || isConfirming}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  {isPending ? 'Deploying...' : 'Confirming...'}
                </>
              ) : (
                'Deploy to Blockchain'
              )}
            </button>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                Error: {error.message}
              </div>
            )}
          </div>
        )}

        {step === 'done' && walletInfo && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              ✅ PQWallet Ready!
            </h4>
            <div className="text-sm text-green-800 space-y-1">
              <div><strong>Address:</strong> <span className="font-mono text-xs">{walletInfo.address}</span></div>
              <div><strong>Protection:</strong> Dilithium3 (ML-DSA-65) quantum-resistant signatures</div>
              <div><strong>Status:</strong> Deployed and ready to receive vested tokens</div>
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
              View Logs ({logs.length})
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-700">{log}</div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
