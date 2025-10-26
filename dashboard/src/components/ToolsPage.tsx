import { useState } from 'react';
import { useAccount, useBlockNumber, useBalance, usePublicClient } from 'wagmi';
import { TestRunner } from './TestRunner';
import { NETWORK } from '../config/networks';

export function ToolsPage() {
  const [activeSection, setActiveSection] = useState<'tests' | 'diagnostics'>('tests');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runNetworkDiagnostics = async () => {
    setTestRunning(true);
    clearResults();

    addTestResult('🔍 Running network diagnostics...');

    try {
      // Test 1: Block number
      addTestResult(`✅ Current block: ${blockNumber || 'Loading...'}`);

      // Test 2: Network check
      if (publicClient) {
        const chainId = await publicClient.getChainId();
        addTestResult(`✅ Chain ID: ${chainId}`);

        // Test 3: Block time estimation
        if (blockNumber && blockNumber > 1n) {
          const currentBlock = await publicClient.getBlock({ blockNumber });
          const previousBlock = await publicClient.getBlock({ blockNumber: blockNumber - 1n });

          const blockTime = Number(currentBlock.timestamp - previousBlock.timestamp);
          addTestResult(`✅ Last block time: ${blockTime} seconds`);
        }

        // Test 4: Gas price
        const gasPrice = await publicClient.getGasPrice();
        addTestResult(`✅ Gas price: ${gasPrice} wei`);
      }

      // Test 5: Wallet connection
      if (isConnected && address) {
        addTestResult(`✅ Wallet connected: ${address.slice(0, 10)}...${address.slice(-8)}`);
        if (balance) {
          addTestResult(`✅ Balance: ${balance.formatted} ${balance.symbol}`);
        }
      } else {
        addTestResult('⚠️  No wallet connected');
      }

      addTestResult('✅ Network diagnostics complete!');
    } catch (error) {
      addTestResult(`❌ Error: ${(error as Error).message}`);
    } finally {
      setTestRunning(false);
    }
  };

  const runBlockTimeTest = async () => {
    setTestRunning(true);
    clearResults();

    addTestResult('⏱️  Starting 60-second block time accuracy test...');
    addTestResult('📊 Measuring block times...');

    try {
      if (!publicClient || !blockNumber) {
        throw new Error('Network not available');
      }

      const startBlock = blockNumber;
      const measurements: number[] = [];

      // Measure 5 block times
      for (let i = 0; i < 5; i++) {
        const currentBlockNum = await publicClient.getBlockNumber();
        if (currentBlockNum > startBlock + BigInt(i)) {
          const block = await publicClient.getBlock({ blockNumber: currentBlockNum });
          const prevBlock = await publicClient.getBlock({ blockNumber: currentBlockNum - 1n });
          const blockTime = Number(block.timestamp - prevBlock.timestamp);
          measurements.push(blockTime);
          addTestResult(`  Block ${currentBlockNum}: ${blockTime}s`);
        }

        // Wait 15 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 15000));
      }

      if (measurements.length > 0) {
        const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const variance = measurements.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / measurements.length;
        const stdDev = Math.sqrt(variance);

        addTestResult(`\n📈 Statistics:`);
        addTestResult(`  Average: ${avg.toFixed(2)}s`);
        addTestResult(`  Std Dev: ±${stdDev.toFixed(2)}s`);
        addTestResult(`  Expected: 12s (Ethereum PoS)`);
        addTestResult(`  Accuracy: ${((12 / avg) * 100).toFixed(1)}%`);
      }

      addTestResult('✅ Block time test complete!');
    } catch (error) {
      addTestResult(`❌ Error: ${(error as Error).message}`);
    } finally {
      setTestRunning(false);
    }
  };

  const testContractAddresses = () => {
    clearResults();
    addTestResult('🔍 Testing deployed contract addresses...');

    const contracts = {
      'ZK Verifier': '0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288',
      'PQ Validator': '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF',
      'PQ Wallet Factory': '0x5895dAbE895b0243B345CF30df9d7070F478C47F',
      'Mock Token': '0xc351De5746211E2B7688D7650A8bF7D91C809c0D',
      'PQ Vault 4626': '0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21',
      'PQ Vault Demo': '0xE6D42d7B673852fDd755E870A3bDD85a4852AE9C',
      'ZK Proof Oracle': '0xF8982849A04d7CeD0c36ed9028e293CB4c2277C9',
      'QRNG Oracle': '0x1b7754689d5bDf4618aA52dDD319D809a00B0843',
    };

    Object.entries(contracts).forEach(([name, address]) => {
      const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      if (isValid) {
        addTestResult(`✅ ${name}: ${address}`);
      } else {
        addTestResult(`❌ ${name}: Invalid address`);
      }
    });

    addTestResult('✅ Contract address validation complete!');
  };

  const calculateVestingBlocks = () => {
    clearResults();
    addTestResult('🧮 Calculating vesting block numbers...');

    const BLOCK_TIME = 12; // seconds
    const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;

    const vestingSchedules = [
      { name: '60-Month Linear', months: 60, cliff: 0 },
      { name: '4-Year Cliff', months: 48, cliff: 12 },
      { name: '2-Year Advisor', months: 24, cliff: 6 },
      { name: 'Test 5-Min', months: 5, cliff: 0, testMode: true },
    ];

    vestingSchedules.forEach(schedule => {
      const blockTime = schedule.testMode ? 0.2 : BLOCK_TIME;
      const totalBlocks = (schedule.months * SECONDS_PER_MONTH) / blockTime;
      const cliffBlocks = (schedule.cliff * SECONDS_PER_MONTH) / blockTime;

      addTestResult(`\n📋 ${schedule.name}:`);
      addTestResult(`  Total: ${schedule.months} months = ${totalBlocks.toLocaleString()} blocks`);
      if (schedule.cliff > 0) {
        addTestResult(`  Cliff: ${schedule.cliff} months = ${cliffBlocks.toLocaleString()} blocks`);
      }
      if (schedule.testMode) {
        addTestResult(`  ⚡ Test mode: ${schedule.months} minutes real-time`);
      } else {
        addTestResult(`  🕐 Production: ~${(totalBlocks * BLOCK_TIME / (60 * 60 * 24)).toFixed(1)} days`);
      }
    });

    addTestResult('\n✅ Vesting calculations complete!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Developer Tools & Tests</h2>
        <p className="text-gray-600">
          Test runner, network diagnostics, and development utilities
        </p>

        {/* Section Tabs */}
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveSection('tests')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeSection === 'tests'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🧪 Test Runner
          </button>
          <button
            onClick={() => setActiveSection('diagnostics')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeSection === 'diagnostics'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Diagnostics
          </button>
        </div>
      </div>

      {/* Test Runner Section */}
      {activeSection === 'tests' && <TestRunner />}

      {/* Diagnostics Section */}
      {activeSection === 'diagnostics' && (
        <>
          {/* Network Status */}
          <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Network Status</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Current Block</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {blockNumber?.toString() || '...'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Wallet Status</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500">Balance</h4>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Tests</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={runNetworkDiagnostics}
            disabled={testRunning}
            className="px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🔍 Network Diagnostics
          </button>
          <button
            onClick={runBlockTimeTest}
            disabled={testRunning}
            className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ⏱️ Block Time Test (60s)
          </button>
          <button
            onClick={testContractAddresses}
            disabled={testRunning}
            className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            📝 Validate Contracts
          </button>
          <button
            onClick={calculateVestingBlocks}
            disabled={testRunning}
            className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            🧮 Vesting Calculator
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Test Output</h3>
          <button
            onClick={clearResults}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm min-h-[300px] max-h-[500px] overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">Run a test to see output...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
          {testRunning && (
            <div className="mt-2 text-yellow-400 animate-pulse">
              Running test...
            </div>
          )}
        </div>
      </div>

      {/* Useful Links */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={NETWORK.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors text-center"
          >
            📊 Tenderly Dashboard
          </a>
          <a
            href="http://localhost:5175/test"
            className="px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors text-center"
          >
            🧪 Playwright Test Report
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
          >
            🔄 Reload Dashboard
          </button>
          <button
            onClick={() => {
              clearResults();
              addTestResult('💾 Local storage cleared');
              localStorage.clear();
            }}
            className="px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            🗑️ Clear Storage
          </button>
        </div>
      </div>

      {/* Developer Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Developer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Node Environment:</span>
            <span className="ml-2 font-mono text-gray-900">
              {import.meta.env.MODE}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Base URL:</span>
            <span className="ml-2 font-mono text-gray-900">
              {window.location.origin}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Connected Address:</span>
            <span className="ml-2 font-mono text-gray-900">
              {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Network:</span>
            <span className="ml-2 font-mono text-gray-900">
              Tenderly Ethereum Virtual TestNet
            </span>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
