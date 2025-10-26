# EthVaultPQ Architecture Diagram
## For 3-Minute Demo Video

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QUANTUM-SAFE VESTING FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   👤 USER        │
│  MetaMask Flask  │
└────────┬─────────┘
         │
         │ 1. Generate Dilithium3 Keys
         ↓
┌────────────────────────────────────────────────────────────────────┐
│  🔐 MetaMask Snap (@qkey/ethvaultpq-snap)                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ Generates Dilithium3 keypair (ML-DSA-65)                        │
│  ✓ Stores private key securely in MetaMask                         │
│  ✓ Returns public key + wallet address                             │
│  ✓ Signs transactions with quantum-resistant signatures            │
└────────┬───────────────────────────────────────────────────────────┘
         │
         │ 2. Deploy PQWallet
         ↓
┌────────────────────────────────────────────────────────────────────┐
│  🏭 PQWalletFactory (0x5895...C47F)                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  function createWallet(bytes pqPublicKey, uint256 salt)            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ Validates NIST-compliant key size                               │
│  ✓ Deploys ERC-4337 smart contract wallet                          │
│  ✓ Links to PQValidator for signature verification                 │
└────────┬───────────────────────────────────────────────────────────┘
         │
         │ Creates →
         ↓
┌────────────────────────────────────────────────────────────────────┐
│  💼 PQWallet (ERC-4337 Smart Contract)                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Owner: User's Dilithium3 Public Key                               │
│  Validator: PQValidator (0xf527...CadF)                            │
│  Security: Quantum-Resistant Signatures                            │
└────────┬───────────────────────────────────────────────────────────┘
         │
         │ 3. Create Vesting Schedule
         ↓
┌────────────────────────────────────────────────────────────────────┐
│  ⏰ VestingManager (0x290d...5dd5)                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  function createVestingSchedule(                                   │
│    address beneficiary,  ← PQWallet Address                        │
│    uint256 amount,       ← 100,000 MUSDC                           │
│    uint256 cliff,        ← 0 months                                │
│    uint256 duration      ← 60 months                               │
│  )                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ Locks tokens in time-based schedule                             │
│  ✓ Beneficiary MUST be PQWallet (quantum-safe)                     │
│  ✓ Linear vesting over 60 months                                   │
│  ✓ Test Mode: 1 minute = 1 month (for demo)                        │
└────────┬───────────────────────────────────────────────────────────┘
         │
         │ Vesting completes → User claims
         ↓
┌────────────────────────────────────────────────────────────────────┐
│  🔓 CLAIM PROCESS (Quantum-Safe)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                     │
│  Step 1: Sign with Dilithium3                                      │
│  ┌──────────────────────────────────────────────┐                 │
│  │ MetaMask Snap                                │                 │
│  │ → Signs claim with Dilithium3 (4,595 bytes)  │                 │
│  └──────────────────────────────────────────────┘                 │
│                      ↓                                              │
│  Step 2: Generate ZK Proof                                         │
│  ┌──────────────────────────────────────────────┐                 │
│  │ ZK Proof API (api.ethvault.qkey.co)          │                 │
│  │ → Verifies Dilithium signature off-chain     │                 │
│  │ → Generates Groth16 ZK proof                 │                 │
│  │ → Returns proof (250 bytes)                  │                 │
│  └──────────────────────────────────────────────┘                 │
│                      ↓                                              │
│  Step 3: On-Chain Verification                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │ Smart Contract                               │                 │
│  │ → Verifies ZK proof (250k gas)               │                 │
│  │ → Releases vested tokens                     │                 │
│  │ → Transfers to PQWallet                      │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
│  🎯 Result: 99.5% gas savings (50M → 250K gas)                     │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  💰 Optional: Quantum-Safe PYUSD Vault                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  PQVault4626QuantumSafe (0x4E94...164d)                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓ Only accepts PQWallet deposits/withdrawals                      │
│  ✓ PYUSD storage for tax withholding (IRS 83b)                     │
│  ✓ Quantum-safe custody for long-term storage                      │
│  ✓ Integrates with Pyth Network for USD pricing                    │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                        KEY DIFFERENTIATORS
═══════════════════════════════════════════════════════════════════════

🔐 QUANTUM-RESISTANT
   • Dilithium3 (NIST ML-DSA-65 standard)
   • SPHINCS+ (NIST SLH-DSA standard)
   • Future-proof against Shor's algorithm

⚡ GAS EFFICIENT
   • ZK-SNARK verification (Groth16)
   • 99.5% gas reduction
   • 50M → 250K gas per transaction

🏦 PRODUCTION READY
   • ERC-4337 Account Abstraction
   • ERC-4626 Vault Standard
   • MetaMask Snap (no separate app)
   • Deployed on Tenderly Ethereum

💵 REAL ASSETS
   • PYUSD (PayPal USD) integration
   • Pyth Network price feeds
   • IRS 83(b) election compliance
   • Corporate tax withholding

═══════════════════════════════════════════════════════════════════════
```

## Quick Reference for Video

**Show this diagram at 0:30-1:00 (30 seconds)**

**Point out while explaining:**
1. **Top**: User → Snap → Generate Dilithium keys
2. **Middle**: Deploy PQWallet → Create Vesting
3. **Bottom**: Claim flow (when you mention ZK proofs)
4. **Optional**: PYUSD Vault (if time permits)

**Key Stats to Mention:**
- 99.5% gas savings
- NIST standard (ML-DSA-65)
- 100,000 MUSDC vesting
- 60 months (Test Mode: 60 minutes)
