import { useState } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { getGasComparison } from '../lib/zkProofApi';

type VerificationMode = 'ON_CHAIN' | 'ZK_PROOF' | 'HYBRID';

export const VerificationModeSelector = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [currentMode, setCurrentMode] = useState<VerificationMode>('ZK_PROOF');
  const [isChanging, setIsChanging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const gasComparison = getGasComparison();

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const changeVerificationMode = async (mode: VerificationMode) => {
    if (!walletClient) {
      addLog('Error: Wallet not connected');
      return;
    }

    setIsChanging(true);
    try {
      addLog(`Changing verification mode to ${mode}...`);

      // Map string to enum value
      const modeValue = mode === 'ON_CHAIN' ? 0 : mode === 'ZK_PROOF' ? 1 : 2;

      // TODO: Call contract to change mode
      // const hash = await walletClient.writeContract({
      //   address: CONTRACTS.pqValidator as `0x${string}`,
      //   abi: pqValidatorAbi,
      //   functionName: 'setVerificationMode',
      //   args: [modeValue],
      // });

      addLog(`Transaction would be sent to: ${CONTRACTS.pqValidator}`);
      addLog(`Mode: ${mode} (value: ${modeValue})`);
      addLog('TODO: Implement actual contract call');

      setCurrentMode(mode);
      addLog(`Verification mode changed to ${mode}`);

    } catch (error: any) {
      addLog(`Error: ${error.message || error}`);
    } finally {
      setIsChanging(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Verification Mode Configuration</h2>

      <div className="space-y-6">
        {/* Current Mode */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <div className="font-semibold text-blue-900">Current Mode:</div>
          <div className="text-2xl font-bold text-blue-700">{currentMode}</div>
        </div>

        {/* Mode Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* On-Chain Mode */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              currentMode === 'ON_CHAIN'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onClick={() => changeVerificationMode('ON_CHAIN')}
          >
            <div className="font-bold text-lg mb-2">On-Chain</div>
            <div className="text-sm text-gray-600 mb-3">
              Full Dilithium verification on-chain
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gas:</span>
                <span className="font-bold text-red-600">{gasComparison.onChain.gas.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">{gasComparison.onChain.cost}</div>
              <div className="mt-3 space-y-1">
                <div className="text-green-700">✓ Fully decentralized</div>
                <div className="text-green-700">✓ No dependencies</div>
                <div className="text-red-700">✗ Very expensive</div>
              </div>
            </div>
          </div>

          {/* ZK Proof Mode */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              currentMode === 'ZK_PROOF'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onClick={() => changeVerificationMode('ZK_PROOF')}
          >
            <div className="font-bold text-lg mb-2">ZK-SNARK Proof</div>
            <div className="text-sm text-gray-600 mb-3">
              Off-chain proof generation, on-chain verification
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gas:</span>
                <span className="font-bold text-green-600">{gasComparison.zkProof.gas.toLocaleString()}</span>
              </div>
              <div className="text-xs text-gray-500">{gasComparison.zkProof.cost}</div>
              <div className="mt-3 space-y-1">
                <div className="text-green-700">✓ 97.5% cheaper</div>
                <div className="text-green-700">✓ Fixed gas cost</div>
                <div className="text-yellow-700">⚠ Requires API</div>
              </div>
            </div>
          </div>

          {/* Hybrid Mode */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              currentMode === 'HYBRID'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400'
            }`}
            onClick={() => changeVerificationMode('HYBRID')}
          >
            <div className="font-bold text-lg mb-2">Hybrid</div>
            <div className="text-sm text-gray-600 mb-3">
              ZK proof with on-chain fallback
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Gas:</span>
                <span className="font-bold text-blue-600">250k - 10M</span>
              </div>
              <div className="text-xs text-gray-500">Varies based on proof availability</div>
              <div className="mt-3 space-y-1">
                <div className="text-green-700">✓ Best of both</div>
                <div className="text-green-700">✓ Fallback safety</div>
                <div className="text-yellow-700">⚠ Variable cost</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gas Savings Comparison */}
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <div className="font-semibold text-green-900 mb-2">Gas Savings with ZK Proofs</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Gas Reduction</div>
              <div className="text-2xl font-bold text-green-700">{gasComparison.savings.gasReduction}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Cost Multiplier</div>
              <div className="text-2xl font-bold text-green-700">{gasComparison.savings.multiplier}</div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <details className="cursor-pointer">
            <summary className="font-semibold text-gray-900">Technical Details</summary>
            <div className="mt-3 space-y-3 text-sm text-gray-700">
              <div>
                <div className="font-semibold">On-Chain Verification:</div>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Implements full Dilithium3 NIST-standardized algorithm</li>
                  <li>~10M gas for signature verification</li>
                  <li>May approach block gas limit on some networks</li>
                  <li>100% decentralized, no external dependencies</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">ZK-SNARK Proof Verification:</div>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Off-chain Dilithium verification + proof generation</li>
                  <li>On-chain Groth16 proof verification (~250k gas)</li>
                  <li>Requires Vercel API for proof generation</li>
                  <li>Proof proves: "I know a valid signature without revealing it"</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold">Hybrid Mode:</div>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Attempts ZK proof verification first</li>
                  <li>Falls back to on-chain if ZK proof unavailable</li>
                  <li>Best for production with high availability requirements</li>
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
