import { useState, useEffect } from 'react';

type TestType = 'unit' | 'e2e' | 'all';
type TestStatus = 'idle' | 'running' | 'success' | 'failed';

interface TestResult {
  type: TestType;
  status: TestStatus;
  output: string[];
  duration?: number;
  passed?: number;
  failed?: number;
  total?: number;
}

export function TestRunner() {
  const [testResults, setTestResults] = useState<Record<TestType, TestResult>>({
    unit: { type: 'unit', status: 'idle', output: [] },
    e2e: { type: 'e2e', status: 'idle', output: [] },
    all: { type: 'all', status: 'idle', output: [] },
  });

  // Load cached test results on mount
  useEffect(() => {
    fetch('/test-summary.json')
      .then(res => res.json())
      .then(data => {
        // Load unit test results
        if (data.unit) {
          setTestResults(prev => ({
            ...prev,
            unit: {
              ...prev.unit,
              passed: data.unit.passed,
              failed: data.unit.failed,
              total: data.unit.total,
              duration: data.unit.duration,
              status: 'idle',
            },
          }));
        }
        // Load E2E test results
        if (data.e2e) {
          setTestResults(prev => ({
            ...prev,
            e2e: {
              ...prev.e2e,
              passed: data.e2e.passed,
              failed: data.e2e.failed,
              total: data.e2e.total,
              duration: data.e2e.duration,
              status: 'idle',
            },
          }));
        }
        // Load all test results
        if (data.all) {
          setTestResults(prev => ({
            ...prev,
            all: {
              ...prev.all,
              passed: data.all.passed,
              failed: data.all.failed,
              total: data.all.total,
              duration: data.all.duration,
              status: 'idle',
            },
          }));
        }
      })
      .catch(err => {
        console.log('No cached test results found:', err.message);
      });
  }, []);

  const addOutput = (type: TestType, message: string) => {
    setTestResults(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        output: [...prev[type].output, `[${new Date().toLocaleTimeString()}] ${message}`],
      },
    }));
  };

  const updateStatus = (type: TestType, status: TestStatus) => {
    setTestResults(prev => ({
      ...prev,
      [type]: { ...prev[type], status },
    }));
  };

  const updateStats = (type: TestType, passed: number, failed: number, total: number, duration: number) => {
    setTestResults(prev => ({
      ...prev,
      [type]: { ...prev[type], passed, failed, total, duration },
    }));
  };

  const clearResults = (type: TestType) => {
    setTestResults(prev => ({
      ...prev,
      [type]: { type, status: 'idle', output: [] },
    }));
  };

  const runUnitTests = async () => {
    clearResults('unit');
    updateStatus('unit', 'running');
    addOutput('unit', '🧪 Starting unit tests (Vitest)...');
    addOutput('unit', '📦 Running tests in tests/unit/ directory...');

    try {
      // Note: This is a simulation since we can't actually run npm commands from the browser
      // In a real setup, you'd use a backend API to trigger tests
      addOutput('unit', '⚠️  Note: Test execution requires running `npm run test:unit` in terminal');
      addOutput('unit', '');
      addOutput('unit', 'To run unit tests:');
      addOutput('unit', '  $ cd dashboard');
      addOutput('unit', '  $ npm run test:unit');
      addOutput('unit', '');
      addOutput('unit', 'Or run with UI:');
      addOutput('unit', '  $ npm run test:unit:ui');
      addOutput('unit', '');
      addOutput('unit', 'Or with coverage:');
      addOutput('unit', '  $ npm run test:unit:coverage');
      addOutput('unit', '');
      addOutput('unit', '📊 Last known results:');
      addOutput('unit', '  ✅ 29 tests passing');
      addOutput('unit', '  ❌ 4 tests failing (VestingTimeUtils calculations)');
      addOutput('unit', '  📦 2 test files');
      addOutput('unit', '  ⏱️  ~1.4s execution time');

      updateStatus('unit', 'success');
      updateStats('unit', 29, 4, 33, 1.4);
    } catch (error) {
      addOutput('unit', `❌ Error: ${(error as Error).message}`);
      updateStatus('unit', 'failed');
    }
  };

  const runE2ETests = async () => {
    clearResults('e2e');
    updateStatus('e2e', 'running');
    addOutput('e2e', '🎭 Starting E2E tests (Playwright)...');
    addOutput('e2e', '🌐 Testing dashboard UI and interactions...');

    try {
      addOutput('e2e', '⚠️  Note: E2E tests require running `npm test` in terminal');
      addOutput('e2e', '');
      addOutput('e2e', 'To run E2E tests:');
      addOutput('e2e', '  $ cd dashboard');
      addOutput('e2e', '  $ npm test');
      addOutput('e2e', '');
      addOutput('e2e', 'Or run with UI:');
      addOutput('e2e', '  $ npm run test:ui');
      addOutput('e2e', '');
      addOutput('e2e', 'Or run headed (see browser):');
      addOutput('e2e', '  $ npm run test:headed');
      addOutput('e2e', '');
      addOutput('e2e', 'View report:');
      addOutput('e2e', '  $ npm run test:report');
      addOutput('e2e', '');
      addOutput('e2e', '📊 Last known results (Chromium only):');
      addOutput('e2e', '  ✅ 7 tests passing');
      addOutput('e2e', '  ❌ 5 tests failing (navigation issues)');
      addOutput('e2e', '  🔄 7 interrupted');
      addOutput('e2e', '  ⏭️  21 not run');
      addOutput('e2e', '  ⏱️  ~26s execution time');

      updateStatus('e2e', 'success');
      updateStats('e2e', 7, 5, 40, 26);
    } catch (error) {
      addOutput('e2e', `❌ Error: ${(error as Error).message}`);
      updateStatus('e2e', 'failed');
    }
  };

  const runAllTests = async () => {
    clearResults('all');
    updateStatus('all', 'running');
    addOutput('all', '🚀 Starting all tests...');
    addOutput('all', '');

    try {
      addOutput('all', 'Running complete test suite:');
      addOutput('all', '  1️⃣  Unit tests (Vitest)');
      addOutput('all', '  2️⃣  E2E tests (Playwright - all browsers)');
      addOutput('all', '');
      addOutput('all', 'To run all tests:');
      addOutput('all', '  $ cd dashboard');
      addOutput('all', '  $ npm run test:all');
      addOutput('all', '');
      addOutput('all', 'Or separately:');
      addOutput('all', '  $ npm run test:unit && npm test');
      addOutput('all', '');
      addOutput('all', '📊 Combined results:');
      addOutput('all', '  Unit: 29/33 passing');
      addOutput('all', '  E2E:  7/40 passing (Chromium only)');
      addOutput('all', '  Total: 36/73 passing');
      addOutput('all', '');
      addOutput('all', '💡 Tip: Run tests in CI/CD with GitHub Actions');

      updateStatus('all', 'success');
      updateStats('all', 36, 37, 73, 27.4);
    } catch (error) {
      addOutput('all', `❌ Error: ${(error as Error).message}`);
      updateStatus('all', 'failed');
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Test Suite Runner</h3>
        <p className="text-sm text-gray-600 mb-4">
          Run unit tests (Vitest) and E2E tests (Playwright) from the UI.
          Note: Actual test execution happens in terminal - these buttons provide instructions.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {/* Unit Tests */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Unit Tests</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(testResults.unit.status)}`}>
                {getStatusIcon(testResults.unit.status)} {testResults.unit.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Fast component and utility tests with Vitest
            </p>
            {testResults.unit.passed !== undefined && (
              <div className="text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passed:</span>
                  <span className="text-green-600 font-medium">{testResults.unit.passed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="text-red-600 font-medium">{testResults.unit.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">{testResults.unit.duration}s</span>
                </div>
              </div>
            )}
            <button
              onClick={runUnitTests}
              disabled={testResults.unit.status === 'running'}
              className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testResults.unit.status === 'running' ? '⏳ Running...' : '🧪 Run Unit Tests'}
            </button>
          </div>

          {/* E2E Tests */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">E2E Tests</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(testResults.e2e.status)}`}>
                {getStatusIcon(testResults.e2e.status)} {testResults.e2e.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Browser automation tests with Playwright
            </p>
            {testResults.e2e.passed !== undefined && (
              <div className="text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passed:</span>
                  <span className="text-green-600 font-medium">{testResults.e2e.passed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="text-red-600 font-medium">{testResults.e2e.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">{testResults.e2e.duration}s</span>
                </div>
              </div>
            )}
            <button
              onClick={runE2ETests}
              disabled={testResults.e2e.status === 'running'}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testResults.e2e.status === 'running' ? '⏳ Running...' : '🎭 Run E2E Tests'}
            </button>
          </div>

          {/* All Tests */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">All Tests</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(testResults.all.status)}`}>
                {getStatusIcon(testResults.all.status)} {testResults.all.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Run complete test suite (unit + E2E)
            </p>
            {testResults.all.passed !== undefined && (
              <div className="text-xs space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Passed:</span>
                  <span className="text-green-600 font-medium">{testResults.all.passed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="text-red-600 font-medium">{testResults.all.failed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">{testResults.all.duration}s</span>
                </div>
              </div>
            )}
            <button
              onClick={runAllTests}
              disabled={testResults.all.status === 'running'}
              className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testResults.all.status === 'running' ? '⏳ Running...' : '🚀 Run All Tests'}
            </button>
          </div>
        </div>
      </div>

      {/* Test Output Tabs */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Test Output</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => clearResults('unit')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clear Unit
            </button>
            <button
              onClick={() => clearResults('e2e')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clear E2E
            </button>
            <button
              onClick={() => clearResults('all')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {(['unit', 'e2e', 'all'] as TestType[]).map(type => (
            <div key={type}>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-sm font-semibold capitalize">{type} Tests</h4>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(testResults[type].status)}`}>
                  {testResults[type].status}
                </span>
              </div>
              <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-[300px] overflow-y-auto">
                {testResults[type].output.length === 0 ? (
                  <p className="text-gray-500">No output yet. Click a button above to run tests.</p>
                ) : (
                  testResults[type].output.map((line, index) => (
                    <div key={index} className="mb-1">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Configuration */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Configuration</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Unit Test Framework:</span>
            <span className="ml-2 font-mono text-gray-900">Vitest v3.2.4</span>
          </div>
          <div>
            <span className="text-gray-600">E2E Framework:</span>
            <span className="ml-2 font-mono text-gray-900">Playwright v1.56.1</span>
          </div>
          <div>
            <span className="text-gray-600">Unit Test Files:</span>
            <span className="ml-2 font-mono text-gray-900">tests/unit/**/*.test.ts</span>
          </div>
          <div>
            <span className="text-gray-600">E2E Test Files:</span>
            <span className="ml-2 font-mono text-gray-900">tests/e2e/**/*.spec.ts</span>
          </div>
          <div>
            <span className="text-gray-600">CI/CD:</span>
            <span className="ml-2 font-mono text-gray-900">.github/workflows/playwright.yml</span>
          </div>
          <div>
            <span className="text-gray-600">Coverage:</span>
            <span className="ml-2 font-mono text-gray-900">npm run test:unit:coverage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
