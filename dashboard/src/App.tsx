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
import { ToolsPage } from './components/ToolsPage';
import { PriceGrid } from './components/PriceDisplay';
import { COMMON_TOKENS } from './config/pythPriceIds';

const queryClient = new QueryClient();

type Tab = 'home' | 'wallet' | 'vesting' | 'deploy' | 'oracles' | 'architecture' | 'settings' | 'tools';

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
                    active={activeTab === 'architecture'}
                    onClick={() => setActiveTab('architecture')}
                  >
                    Architecture
                  </TabButton>
                  <TabButton
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </TabButton>
                  <TabButton
                    active={activeTab === 'tools'}
                    onClick={() => setActiveTab('tools')}
                    badge="DEV"
                  >
                    Tools & Tests
                  </TabButton>
                </div>
              </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4">
              {activeTab === 'home' && (
                <div className="space-y-8">
                  {/* Project Overview */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Welcome to EthVaultPQ</h2>
                    <p className="text-lg text-gray-800 mb-4 font-medium">
                      A general-purpose time-based payment system ideal for vesting, unlock schedules, and trading restrictions—all implemented in a quantum-safe manner.
                    </p>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 rounded-lg p-5 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Quantum Security Matters</h3>
                      <p className="text-gray-700 mb-3">
                        Current vesting contracts and token lockups rely on ECDSA cryptography, which will be vulnerable to quantum computing attacks in the future.
                        <strong className="text-indigo-700"> EthVaultPQ protects your long-term token allocations using post-quantum cryptography.</strong>
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span><strong>NIST-Compliant:</strong> Implements ML-DSA (Dilithium) and SLH-DSA (SPHINCS+) signature schemes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span><strong>ERC-4337 Compatible:</strong> Quantum-secure smart contract wallets with account abstraction</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span><strong>ERC-4626 Vesting:</strong> Tokenized vaults with time-based unlock schedules</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-indigo-600 mr-2">•</span>
                          <span><strong>CLARITY Act Ready:</strong> Supports lockup rules for tax optimization (when legislation passes)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Use Cases */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Token Vesting</h4>
                        <p className="text-sm text-blue-800">
                          Protect employee, advisor, and founder token grants with quantum-secure vesting schedules. Supports cliffs, linear vesting, and custom curves.
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Lockup Periods</h4>
                        <p className="text-sm text-green-800">
                          Enforce transfer restrictions for investor lockups, CLARITY Act compliance, and regulatory requirements—all secured against quantum threats.
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Time-Based Payments</h4>
                        <p className="text-sm text-purple-800">
                          Create any time-based token distribution: milestone payments, streaming salaries, or gradual DAO treasury releases.
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <StatCard title="Contracts" value="8" description="Post-quantum secure" />
                      <StatCard title="Network" value="Tenderly" description="Ethereum Virtual TestNet" />
                      <StatCard title="Status" value="Testnet" description="Ready for deployment" />
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                      <h3 className="text-2xl font-bold text-yellow-900 mb-4">
                        ⚠️ Vesting, Unlocking & Tax Considerations - FAQ
                      </h3>

                      {/* Key Distinction */}
                      <div className="bg-white rounded-lg p-5 mb-4 border-l-4 border-yellow-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Vesting vs. Unlocking: What's the Difference?</h4>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded p-4">
                            <h5 className="font-bold text-blue-900 mb-2">📋 VESTING (Legal Ownership)</h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• When you <strong>legally own</strong> tokens</li>
                              <li>• Creates <strong>tax obligations</strong> (U.S.)</li>
                              <li>• Off-chain legal concept</li>
                              <li>• Can claim to your vault</li>
                              <li>• <strong>May NOT be transferable yet</strong></li>
                            </ul>
                          </div>

                          <div className="bg-green-50 rounded p-4">
                            <h5 className="font-bold text-green-900 mb-2">🔓 UNLOCKING (Transfer Capability)</h5>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• When you can <strong>transfer/sell</strong> tokens</li>
                              <li>• No additional tax event</li>
                              <li>• On-chain enforcement</li>
                              <li>• Must be <strong>both vested AND unlocked</strong></li>
                              <li>• Technical restriction lifted</li>
                            </ul>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded">
                          <strong>Example:</strong> You receive 10,000 tokens with 4-year vesting and 2-year lockup.
                          After Year 1: 2,500 tokens <strong>vest</strong> (you own them, pay tax) but are still <strong>locked</strong> (can't transfer).
                          After Year 2: All 5,000 vested tokens <strong>unlock</strong> (now transferable).
                        </p>
                      </div>

                      {/* IRS 83(b) Election */}
                      <div className="bg-white rounded-lg p-5 mb-4 border-l-4 border-red-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">💰 IRS Section 83(b) Election - Could Save $100K+ in Taxes</h4>

                        <div className="bg-red-50 rounded p-4 mb-3">
                          <p className="text-sm font-bold text-red-900 mb-2">⏰ CRITICAL: 30-Day Deadline (If You Have Token Options)</p>
                          <div className="text-sm text-red-800 space-y-2">
                            <p>
                              <strong>How do I tell if I have token options?</strong> Check your grant documents - they should explicitly say "token options."
                            </p>
                            <p>
                              The key difference: <strong>Do you own tokens outright, or are they given step-by-step?</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 pl-2">
                              <li><strong>Token Options:</strong> If there's a chance you don't get the tokens (e.g., you leave early), these are options → 83(b) applies</li>
                              <li><strong>Outright Grant:</strong> If tokens are yours immediately (even if vesting/locked), might not be options</li>
                            </ul>
                            <p className="font-bold mt-2">
                              ⚠️ Must file within <strong>30 days of token grant</strong>. Cannot be revoked. Miss it = lose massive tax savings.
                            </p>
                            <p className="text-xs bg-white rounded p-2 mt-2 border border-red-300">
                              <strong>Check the IRS rules and consult your lawyer/tax advisor immediately.</strong> This is NOT legal advice.
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">❌ Without 83(b) Election:</h5>
                            <div className="text-xs text-gray-700 space-y-1 font-mono bg-gray-50 p-3 rounded">
                              <div>Year 1: 2,500 × $10 = $25,000 tax</div>
                              <div>Year 2: 2,500 × $50 = $125,000 tax</div>
                              <div>Year 3: 2,500 × $100 = $250,000 tax</div>
                              <div>Year 4: 2,500 × $200 = $500,000 tax</div>
                              <div className="font-bold text-red-700 pt-2 border-t">Total: $900,000 ordinary income</div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">✅ With 83(b) Election:</h5>
                            <div className="text-xs text-gray-700 space-y-1 font-mono bg-gray-50 p-3 rounded">
                              <div>Day 1: 10,000 × $1 = $10,000 tax</div>
                              <div>Year 1-4: $0 (no tax events)</div>
                              <div>Year 4 sale: $1,990,000 cap gains</div>
                              <div className="font-bold text-green-700 pt-2 border-t">Savings: ~$360,000 in taxes!</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                          <p className="text-xs text-yellow-900 mb-2">
                            <strong>Resources (NOT legal advice):</strong>
                          </p>
                          <ul className="text-xs text-yellow-800 space-y-1">
                            <li>• IRS Publication 525: <a href="https://www.irs.gov/publications/p525" target="_blank" className="underline">Taxable Income</a></li>
                            <li>• Cooley GO: <a href="https://www.cooleygo.com" target="_blank" className="underline">Startup Legal Resources</a></li>
                            <li>• <strong>Consult tax attorney/CPA before filing!</strong></li>
                          </ul>
                        </div>
                      </div>

                      {/* CLARITY Act */}
                      <div className="bg-white rounded-lg p-5 mb-4 border-l-4 border-purple-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">🏛️ CLARITY Act & Lockup Rules</h4>

                        <p className="text-sm text-gray-700 mb-3">
                          The <strong>CLARITY Act</strong> (proposed U.S. legislation) could allow deferring taxes on <strong>locked tokens</strong> until they unlock.
                          EthVaultPQ's on-chain lockup mechanism is designed to benefit from these provisions if passed.
                        </p>

                        <div className="bg-purple-50 rounded p-4 mb-3">
                          <p className="text-sm font-semibold text-purple-900 mb-2">Potential Tax Treatment (if CLARITY passes):</p>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• <strong>Today:</strong> Receive 10,000 tokens, 4-yr vest, 6-yr lockup</li>
                            <li>• <strong>Without CLARITY:</strong> Pay tax each year as tokens vest</li>
                            <li>• <strong>With CLARITY:</strong> Potentially defer all tax until year 6 unlock</li>
                          </ul>
                        </div>

                        <div className="bg-orange-100 border border-orange-300 rounded p-3">
                          <p className="text-xs font-bold text-orange-900">⚠️ Status: PROPOSED, NOT LAW (as of Oct 2025)</p>
                          <p className="text-xs text-orange-800 mt-1">
                            Do NOT rely on CLARITY Act for current tax planning. Consult professionals and monitor legislation.
                          </p>
                        </div>
                      </div>

                      {/* Common Scenarios */}
                      <div className="bg-white rounded-lg p-5 mb-4 border-l-4 border-indigo-500">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">📚 Common Scenarios</h4>

                        <div className="space-y-3">
                          <details className="bg-indigo-50 rounded p-3">
                            <summary className="font-semibold text-indigo-900 cursor-pointer">💼 Startup Employee Grant</summary>
                            <div className="text-sm text-gray-700 mt-2 pl-4">
                              <p className="mb-2"><strong>Situation:</strong> 100,000 tokens at $0.10, 4-year vest, no lockup</p>
                              <p className="font-semibold text-green-700">✅ Action: File 83(b) within 30 days (pay tax on $10K today, save $360K+ if tokens moon)</p>
                            </div>
                          </details>

                          <details className="bg-green-50 rounded p-3">
                            <summary className="font-semibold text-green-900 cursor-pointer">💵 Investor with Lockup</summary>
                            <div className="text-sm text-gray-700 mt-2 pl-4">
                              <p className="mb-2"><strong>Situation:</strong> Purchased 1M tokens at $0.50, immediate vest, 12-month lockup</p>
                              <p className="font-semibold text-green-700">✅ Action: 83(b) not needed (already vested). Cost basis = $500K. Hold 12 months for long-term cap gains.</p>
                            </div>
                          </details>

                          <details className="bg-purple-50 rounded p-3">
                            <summary className="font-semibold text-purple-900 cursor-pointer">🏗️ DAO Contributor</summary>
                            <div className="text-sm text-gray-700 mt-2 pl-4">
                              <p className="mb-2"><strong>Situation:</strong> Earn 10,000 tokens over 2 years (quarterly vesting), no lockup</p>
                              <p className="font-semibold text-purple-700">✅ Action: 83(b) likely unavailable (no upfront grant). Each vest = ordinary income. Track basis carefully.</p>
                            </div>
                          </details>
                        </div>
                      </div>

                      {/* Legal Disclaimer */}
                      <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                        <h4 className="text-lg font-bold text-red-900 mb-2">⚖️ THIS IS NOT LEGAL OR TAX ADVICE</h4>
                        <div className="text-sm text-red-800 space-y-2">
                          <p>
                            <strong>EthVaultPQ provides software, not professional advice.</strong> Tax laws are complex and change frequently.
                            You MUST consult qualified professionals before making decisions.
                          </p>
                          <div className="grid md:grid-cols-3 gap-2 text-xs mt-3">
                            <div className="bg-white rounded p-2">
                              <p className="font-bold text-gray-900">Tax Attorneys</p>
                              <p className="text-gray-700">Cooley, Fenwick & West, Gunderson Dettmer</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <p className="font-bold text-gray-900">CPAs</p>
                              <p className="text-gray-700">AICPA member firms with crypto experience</p>
                            </div>
                            <div className="bg-white rounded p-2">
                              <p className="font-bold text-gray-900">IRS Resources</p>
                              <p className="text-gray-700">Publications 525, 551, Virtual Currency Guidance</p>
                            </div>
                          </div>
                          <p className="text-xs italic mt-2">
                            Different rules apply outside the U.S. and in different states. Token grants, airdrops, and DAO payments may have different tax treatments.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tenderly Dashboard Link */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-indigo-900">Tenderly Virtual TestNet</h3>
                          <p className="text-xs text-indigo-700 mt-1">Monitor transactions and debug contracts</p>
                        </div>
                        <a
                          href="https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Open Dashboard →
                        </a>
                      </div>
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
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-2">Oracle Services</h2>
                    <p className="text-gray-600 mb-4">
                      Real-time price feeds and post-quantum cryptographic oracles
                    </p>
                  </div>

                  {/* Pyth Network Price Feeds */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Pyth Network Price Feeds</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Real-time, high-fidelity price data for vesting valuations
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                        🏆 Prize Eligible
                      </span>
                    </div>
                    <PriceGrid tokens={COMMON_TOKENS} />
                  </div>

                  {/* Post-Quantum Oracles */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Post-Quantum Oracles</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">ZK Proof Oracle</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Verifies Dilithium signatures using Groth16 ZK-SNARKs
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          0xF8982849A04d7CeD0c36ed9028e293CB4c2277C9
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">QRNG Oracle</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantum random number generation for CREATE2 entropy
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          0x1b7754689d5bDf4618aA52dDD319D809a00B0843
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-3xl font-bold mb-2">Post-Quantum Architecture</h2>
                    <p className="text-gray-600">
                      How EthVaultPQ achieves quantum security through off-chain Dilithium signatures and ZK-SNARK verification
                    </p>
                  </div>

                  {/* The Problem */}
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ The Quantum Threat</h3>
                    <div className="space-y-3 text-gray-800">
                      <p>
                        <strong>Current blockchain wallets use ECDSA signatures</strong> (secp256k1 curve), which will be broken by quantum computers using Shor's algorithm.
                      </p>
                      <div className="bg-white rounded p-4">
                        <p className="font-semibold text-red-800 mb-2">Timeline Risk:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li><strong>Mid-2027:</strong> Quantum risk starts - early cryptographically relevant quantum computers expected</li>
                          <li><strong>2030s:</strong> Large-scale quantum computers likely break ECDSA completely</li>
                          <li><strong>Store now, decrypt later:</strong> Attackers can record blockchain data today and decrypt it with future quantum computers</li>
                          <li><strong>Vesting contracts:</strong> Lock tokens for 4+ years → exposed during quantum transition period</li>
                        </ul>
                      </div>
                      <p className="text-sm italic bg-red-100 p-3 rounded">
                        💡 <strong>Your 4-year vesting schedule is at risk if it relies on ECDSA signatures that will be vulnerable before unlock.</strong>
                      </p>
                    </div>
                  </div>

                  {/* The Challenge */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-3">🚧 Why Not Just Use Dilithium On-Chain?</h3>
                    <div className="space-y-3 text-gray-800">
                      <p>
                        <strong>Dilithium signatures are HUGE</strong> compared to ECDSA, making direct on-chain verification prohibitively expensive.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded p-4 border-l-4 border-blue-500">
                          <h4 className="font-bold text-blue-900 mb-2">ECDSA (Current)</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Signature Size:</strong> ~65 bytes</p>
                            <p><strong>Gas Cost:</strong> ~3,000 gas</p>
                            <p><strong>Status:</strong> ❌ Quantum vulnerable</p>
                          </div>
                        </div>
                        <div className="bg-white rounded p-4 border-l-4 border-red-500">
                          <h4 className="font-bold text-red-900 mb-2">Dilithium3 (Naive)</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Signature Size:</strong> ~3,293 bytes</p>
                            <p><strong>Gas Cost:</strong> ~50M+ gas</p>
                            <p><strong>Status:</strong> ❌ Too expensive</p>
                          </div>
                        </div>
                        <div className="bg-white rounded p-4 border-l-4 border-green-500">
                          <h4 className="font-bold text-green-900 mb-2">EthVaultPQ (ZK)</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Proof Size:</strong> ~256 bytes</p>
                            <p><strong>Gas Cost:</strong> ~300K gas</p>
                            <p><strong>Status:</strong> ✅ Quantum secure + affordable</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm bg-yellow-100 p-3 rounded">
                        <strong>The problem:</strong> Verifying Dilithium directly on-chain would cost ~$1,000+ per transaction at current gas prices!
                      </p>
                    </div>
                  </div>

                  {/* The Solution - Architecture Diagram */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-4">✅ Our Solution: Off-Chain Dilithium + ZK-SNARK Proof</h3>

                    {/* Visual Diagram */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
                      <div className="space-y-6">
                        {/* Step 1: User Signs */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            1
                          </div>
                          <div className="flex-1 bg-white rounded-lg p-4 shadow">
                            <h4 className="font-bold text-gray-900 mb-1">User Signs Transaction</h4>
                            <p className="text-sm text-gray-700">
                              <strong>Off-chain:</strong> User's PQ wallet generates a <span className="font-mono bg-blue-100 px-1 rounded">Dilithium3</span> signature (~3.3KB)
                            </p>
                            <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border">
                              signature = Dilithium3.sign(privateKey, txData)
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="text-2xl text-gray-400">↓</div>
                        </div>

                        {/* Step 2: Generate ZK Proof */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            2
                          </div>
                          <div className="flex-1 bg-white rounded-lg p-4 shadow">
                            <h4 className="font-bold text-gray-900 mb-1">Generate ZK-SNARK Proof</h4>
                            <p className="text-sm text-gray-700">
                              <strong>Off-chain:</strong> Prover generates a <span className="font-mono bg-purple-100 px-1 rounded">Groth16</span> proof that "I verified the Dilithium signature correctly"
                            </p>
                            <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border">
                              proof = Groth16.prove(circuit, {'{signature, publicKey, message}'})
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="text-2xl text-gray-400">↓</div>
                        </div>

                        {/* Step 3: Submit to Oracle */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            3
                          </div>
                          <div className="flex-1 bg-white rounded-lg p-4 shadow">
                            <h4 className="font-bold text-gray-900 mb-1">Submit to ZK Proof Oracle</h4>
                            <p className="text-sm text-gray-700">
                              <strong>On-chain:</strong> Smart contract verifies the ~256-byte ZK proof (NOT the 3.3KB signature!)
                            </p>
                            <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border">
                              ZKProofOracle.verifyProof(proof, publicInputs) → returns true/false
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="text-2xl text-gray-400">↓</div>
                        </div>

                        {/* Step 4: Execute Transaction */}
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            4
                          </div>
                          <div className="flex-1 bg-white rounded-lg p-4 shadow">
                            <h4 className="font-bold text-gray-900 mb-1">Execute Quantum-Safe Transaction</h4>
                            <p className="text-sm text-gray-700">
                              <strong>On-chain:</strong> If proof is valid, the PQWallet executes the user operation (ERC-4337)
                            </p>
                            <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border">
                              PQWallet.validateUserOp() → calls oracle → executes transaction ✅
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benefits Breakdown */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500">
                        <h4 className="font-bold text-green-900 mb-3 text-lg">✅ Benefits of This Approach</h4>
                        <ul className="space-y-2 text-sm text-gray-800">
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">🔐</span>
                            <span><strong>Quantum Security:</strong> Dilithium3 is NIST-approved post-quantum signature scheme</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">💰</span>
                            <span><strong>Gas Efficiency:</strong> ZK proof verification costs ~300K gas vs. 50M+ for native Dilithium</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">🔒</span>
                            <span><strong>Trustless:</strong> Zero-knowledge proof cryptographically guarantees signature validity</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">⚡</span>
                            <span><strong>ERC-4337 Native:</strong> Works seamlessly with account abstraction infrastructure</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-600 mr-2 mt-0.5">🛡️</span>
                            <span><strong>Future-Proof:</strong> Protects long-term vesting contracts (4+ years) from quantum attacks</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-900 mb-3 text-lg">🔬 Technical Deep Dive</h4>
                        <ul className="space-y-2 text-sm text-gray-800">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">📐</span>
                            <span><strong>ZK Circuit:</strong> Circom circuit that verifies Dilithium3 signature verification algorithm</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">🔢</span>
                            <span><strong>Groth16:</strong> Succinct proof system with constant-size proofs (~256 bytes)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">⛓️</span>
                            <span><strong>Oracle Contract:</strong> On-chain verifier using pairing-friendly elliptic curves (BN254)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">🎯</span>
                            <span><strong>Public Inputs:</strong> Message hash, public key hash, validity flag</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">🔐</span>
                            <span><strong>Security Model:</strong> Computational soundness + post-quantum signature security</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Why SNARKs Are Safe Despite Not Being Quantum-Resistant */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">🔐 Wait... Aren't SNARKs Vulnerable to Quantum Attacks?</h3>

                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-5 border-l-4 border-red-500">
                        <h4 className="font-bold text-red-900 mb-2">⚠️ Yes, ZK-SNARKs ARE Quantum-Vulnerable</h4>
                        <p className="text-sm text-gray-800">
                          Groth16 SNARKs rely on elliptic curve pairings (BN254) which <strong>CAN be broken by quantum computers</strong> using Shor's algorithm.
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-5 border-l-4 border-green-500">
                        <h4 className="font-bold text-green-900 mb-2">✅ But Our System IS Still Quantum-Safe!</h4>
                        <p className="text-sm text-gray-800 mb-3">
                          <strong>Key Insight:</strong> SNARKs are used as a <em>compression layer</em>, not the <em>security layer</em>.
                        </p>

                        <div className="bg-green-50 rounded p-4 space-y-3">
                          <div>
                            <div className="font-semibold text-green-900 text-sm mb-1">🔒 Security Layer: Dilithium3</div>
                            <ul className="text-xs text-gray-700 space-y-1 ml-4">
                              <li>• Real signature verification happens off-chain using @noble/post-quantum</li>
                              <li>• NIST-approved ML-DSA-65 (FIPS-204) - quantum-resistant</li>
                              <li>• This is where actual security comes from</li>
                            </ul>
                          </div>

                          <div>
                            <div className="font-semibold text-green-900 text-sm mb-1">📦 Compression Layer: Groth16 SNARK</div>
                            <ul className="text-xs text-gray-700 space-y-1 ml-4">
                              <li>• Only proves "I verified the signature correctly"</li>
                              <li>• One-time use per transaction (see replay protection below)</li>
                              <li>• Breaking the SNARK doesn't let you forge Dilithium signatures</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-5 border-l-4 border-purple-500">
                        <h4 className="font-bold text-purple-900 mb-2">🎫 One-Time Use: The Key to Security</h4>
                        <p className="text-sm text-gray-800 mb-3">
                          Each SNARK proof is used exactly ONCE and then permanently blacklisted with three layers of protection:
                        </p>

                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="bg-purple-50 rounded p-3">
                            <div className="font-semibold text-sm text-purple-900 mb-1">1. Replay Protection</div>
                            <code className="text-xs bg-gray-100 p-2 block rounded">usedRequestIds[id] = true</code>
                            <p className="text-xs text-gray-700 mt-1">Blacklisted forever after first use</p>
                          </div>

                          <div className="bg-purple-50 rounded p-3">
                            <div className="font-semibold text-sm text-purple-900 mb-1">2. Status Tracking</div>
                            <code className="text-xs bg-gray-100 p-2 block rounded">Pending → Fulfilled</code>
                            <p className="text-xs text-gray-700 mt-1">Can't fulfill same request twice</p>
                          </div>

                          <div className="bg-purple-50 rounded p-3">
                            <div className="font-semibold text-sm text-purple-900 mb-1">3. Time Expiration</div>
                            <code className="text-xs bg-gray-100 p-2 block rounded">expires after 1 hour</code>
                            <p className="text-xs text-gray-700 mt-1">Old proofs can't be reused</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500">
                        <h4 className="font-bold text-blue-900 mb-2">🛡️ Attack Scenarios That FAIL</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <span className="text-red-600 font-bold">❌</span>
                            <div>
                              <strong>Break SNARK proof:</strong> Even if quantum computer breaks the proof, it doesn't help forge Dilithium signatures
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-red-600 font-bold">❌</span>
                            <div>
                              <strong>Replay attack:</strong> usedRequestIds prevents reusing same proof
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-red-600 font-bold">❌</span>
                            <div>
                              <strong>Forge Dilithium signature:</strong> Impossible - Dilithium IS quantum-resistant
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg p-4 border-2 border-emerald-500">
                        <p className="text-sm font-bold text-emerald-900 mb-2">🎯 Bottom Line:</p>
                        <p className="text-sm text-gray-800">
                          Your wallet funds are protected by <strong>quantum-resistant Dilithium keys</strong>.
                          The SNARK is just a <strong>gas optimization</strong> that proves "I did the verification correctly."
                          Even if quantum computers break SNARKs in the future, they still can't steal your tokens because
                          they can't forge your Dilithium signatures!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contract Architecture */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-4">🏗️ Smart Contract Architecture</h3>
                    <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
                      <div className="space-y-4">
                        <div className="border-l-4 border-indigo-500 pl-4">
                          <div className="font-bold text-indigo-900">PQWallet.sol (ERC-4337)</div>
                          <div className="text-gray-600 text-xs mt-1">User's quantum-secure smart contract wallet</div>
                          <div className="mt-2 text-xs text-gray-700">
                            • validateUserOp() → calls ZKProofOracle<br/>
                            • Stores Dilithium public key<br/>
                            • Executes transactions if proof valid
                          </div>
                        </div>

                        <div className="flex justify-center text-gray-400">↓ calls</div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <div className="font-bold text-purple-900">ZKProofOracle.sol</div>
                          <div className="text-gray-600 text-xs mt-1">Verifies Groth16 proofs on-chain</div>
                          <div className="mt-2 text-xs text-gray-700">
                            • verifyProof(proof, publicInputs) → bool<br/>
                            • Uses pairing check on BN254 curve<br/>
                            • ~300K gas per verification
                          </div>
                        </div>

                        <div className="flex justify-center text-gray-400">↓ proves validity of</div>

                        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded p-3">
                          <div className="font-bold text-blue-900">Off-Chain: Dilithium3 Signature</div>
                          <div className="text-gray-600 text-xs mt-1">Generated by user's private key</div>
                          <div className="mt-2 text-xs text-gray-700">
                            • NIST ML-DSA (Module Lattice Digital Signature Algorithm)<br/>
                            • ~3,293 bytes signature size<br/>
                            • Security level: NIST Level 3 (192-bit quantum security)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why This Matters for Vesting */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-green-900 mb-4">💎 Why This Matters for Your Vesting Contract</h3>
                    <div className="space-y-4 text-gray-800">
                      <p className="text-lg">
                        <strong>Vesting schedules lock tokens for 4+ years.</strong> By the time your tokens unlock, quantum computers may be breaking ECDSA signatures.
                      </p>

                      <div className="bg-white rounded-lg p-5 border-l-4 border-green-600">
                        <h4 className="font-bold text-green-900 mb-2">Example Scenario:</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• <strong>2025:</strong> You receive 100,000 token grant, 4-year vesting</li>
                          <li>• <strong>2029:</strong> Tokens fully vested, worth $1M</li>
                          <li>• <strong>2030:</strong> Quantum computers break ECDSA</li>
                          <li className="text-red-700 font-bold">• ❌ Traditional wallet: Your $1M is now vulnerable to theft</li>
                          <li className="text-green-700 font-bold">• ✅ EthVaultPQ: Your tokens remain secure with post-quantum signatures</li>
                        </ul>
                      </div>

                      <div className="bg-emerald-100 rounded p-4">
                        <p className="font-bold text-emerald-900 mb-2">🛡️ Protection Timeline:</p>
                        <p className="text-sm text-emerald-800">
                          EthVaultPQ ensures your vested tokens remain secure throughout the entire lifecycle—from grant to unlock to transfer—even as quantum computing advances.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Resources */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3">📚 Learn More</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <a href="https://csrc.nist.gov/pubs/fips/204/final" target="_blank" className="bg-white p-4 rounded border hover:border-blue-500 transition">
                        <div className="font-bold text-blue-900">NIST FIPS 204</div>
                        <div className="text-gray-600 text-xs mt-1">ML-DSA (Dilithium) Standard</div>
                      </a>
                      <a href="https://eips.ethereum.org/EIPS/eip-4337" target="_blank" className="bg-white p-4 rounded border hover:border-blue-500 transition">
                        <div className="font-bold text-blue-900">EIP-4337</div>
                        <div className="text-gray-600 text-xs mt-1">Account Abstraction Standard</div>
                      </a>
                      <a href="https://docs.circom.io" target="_blank" className="bg-white p-4 rounded border hover:border-blue-500 transition">
                        <div className="font-bold text-blue-900">Circom/SnarkJS</div>
                        <div className="text-gray-600 text-xs mt-1">ZK-SNARK Development Tools</div>
                      </a>
                    </div>
                  </div>
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

              {activeTab === 'tools' && <ToolsPage />}
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
