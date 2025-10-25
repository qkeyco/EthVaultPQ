# EthVaultPQ Dashboard - Complete Guide
## Understanding Every Tab & End-to-End Flows

---

## 📑 Tab Overview

Your dashboard has **9 tabs**. Here's what each one does:

| Tab | Purpose | Status | Needed For Demo? |
|-----|---------|--------|------------------|
| **Home** | Project overview & welcome | ✅ Working | Optional |
| **Deploy** 🆕 | Deploy contracts to networks | ⚠️ Partially implemented | Yes (for full E2E) |
| **Wallets** | Create PQ wallets via contracts | ✅ Working | Yes (for vesting demo) |
| **Vesting** | Manage vesting schedules | ✅ Working | Yes (for vesting demo) |
| **Snap** 🦊 | MetaMask Snap interaction | ✅ Working | Yes (for signature demo) |
| **Oracles** | Oracle price feeds & QRNG | ✅ Working | Optional |
| **Architecture** | System architecture diagram | ✅ Working | Optional (educational) |
| **Settings** | Configuration & preferences | ✅ Working | Optional |
| **Tools** 🔧 | Developer tools & tests | ✅ Working | Optional (dev only) |

---

## 🎯 Three Main Demo Flows

### Flow 1: Snap Signature Demo (Simplest) ⭐
**Time:** 2-3 minutes
**Requirements:** MetaMask only
**Contracts needed:** None (off-chain only)

**What it shows:**
- Install MetaMask Snap
- Generate PQ keys (Dilithium3)
- Sign messages with quantum-resistant signatures
- Show ZK proof generation via API

**Tabs used:**
1. **Snap** - Everything happens here!

---

### Flow 2: Wallet Creation Demo (Medium)
**Time:** 5 minutes
**Requirements:** MetaMask + Deployed contracts
**Contracts needed:** PQWalletFactory, PQValidator

**What it shows:**
- Create PQ wallet via smart contract
- Deploy wallet with CREATE2
- View wallet address
- Fund wallet

**Tabs used:**
1. **Deploy** - Deploy wallet factory
2. **Wallets** - Create and manage wallets

---

### Flow 3: Complete Vesting Demo (Full E2E) 🎬
**Time:** 10-15 minutes
**Requirements:** MetaMask + All contracts deployed
**Contracts needed:** Everything (PQWalletFactory, PQVault, Oracles)

**What it shows:**
- Create PQ wallet
- Deploy vesting vault
- Set up vesting schedule
- Watch tokens vest over time
- Claim vested tokens

**Tabs used:**
1. **Deploy** - Deploy all contracts
2. **Wallets** - Create wallet
3. **Vesting** - Set up and manage vesting
4. **Oracles** (optional) - Show price feeds

---

## 📋 Detailed Tab Explanations

### 1. 🏠 Home Tab

**Purpose:** Welcome screen and project overview

**What it shows:**
- Project description
- Key features (PQ crypto, ZK-SNARKs, etc.)
- Quick start guide
- Links to documentation

**Functionality:**
- Read-only information
- Navigation to other tabs
- Status indicators

**Needed for demo?** Optional - good for intro/outro

---

### 2. 🚀 Deploy Tab (NEW)

**Purpose:** Deploy smart contracts to Tenderly/Sepolia/Mainnet

**What it does:**
- Shows deployment status of all contracts
- Network selection (Tenderly Ethereum, Sepolia, Mainnet)
- One-click deployment buttons
- Contract address display
- Verification status
- Test transaction capabilities

**Key Features:**
```
┌─────────────────────────────────────┐
│ Network: [Tenderly Ethereum ▼]     │
├─────────────────────────────────────┤
│ PQWalletFactory                     │
│ Status: Not Deployed                │
│ [Deploy] [Test] [Verify]           │
├─────────────────────────────────────┤
│ PQValidator                         │
│ Status: Not Deployed                │
│ [Deploy] [Test] [Verify]           │
├─────────────────────────────────────┤
│ PQVault                             │
│ Status: Not Deployed                │
│ [Deploy] [Test] [Verify]           │
└─────────────────────────────────────┘
```

**Needed for demo?** ✅ YES - Essential for full E2E demo

**Current Status:** ⚠️ Partially implemented (needs completion)

---

### 3. 💼 Wallets Tab

**Purpose:** Create and manage PQ wallets (ERC-4337)

**What it does:**
- Create new PQ wallet via factory contract
- Uses CREATE2 for deterministic addresses
- Configure wallet parameters:
  - Owner (your address)
  - Dilithium3 public key
  - SPHINCS+ public key (optional)
  - Salt (for CREATE2)
- View created wallets
- Show wallet balance
- Send transactions from wallet

**Key Features:**
```
┌─────────────────────────────────────┐
│ Create PQ Wallet                    │
├─────────────────────────────────────┤
│ Owner Address: 0x...                │
│ Dilithium Public Key: [Generate]   │
│ SPHINCS+ Public Key: [Optional]    │
│ Salt: [Random] [Custom]            │
│                                     │
│ Predicted Address: 0x...           │
│                                     │
│ [Create Wallet]                    │
├─────────────────────────────────────┤
│ Your Wallets:                       │
│ • 0x742d... (Balance: 0.5 ETH)     │
│   [View] [Send] [Delete]           │
└─────────────────────────────────────┘
```

**Needed for demo?** ✅ YES - Required for vesting demo

---

### 4. 📅 Vesting Tab

**Purpose:** Create and manage vesting schedules (ERC-4626)

**What it does:**
- Deploy vesting vault
- Configure vesting parameters:
  - Beneficiary (who receives tokens)
  - Token (ERC-20 to vest)
  - Amount
  - Start block
  - Duration (in blocks)
  - Cliff period
- View vesting progress
- Claim vested tokens
- Show vesting chart/timeline

**Key Features:**
```
┌─────────────────────────────────────┐
│ Create Vesting Schedule             │
├─────────────────────────────────────┤
│ Beneficiary: [Your PQ Wallet]      │
│ Token: [USDC ▼]                    │
│ Amount: [1000] USDC                │
│                                     │
│ Start Block: [Current + 10]        │
│ Duration: [100 blocks] (~20 min)   │
│ Cliff: [20 blocks] (~4 min)        │
│                                     │
│ [Create Vesting Vault]             │
├─────────────────────────────────────┤
│ Active Vesting:                     │
│                                     │
│ Progress: ████████░░░░ 40%         │
│ Vested: 400 USDC                   │
│ Claimable: 400 USDC                │
│ Locked: 600 USDC                   │
│                                     │
│ [Claim Tokens]                     │
└─────────────────────────────────────┘
```

**Needed for demo?** ✅ YES - The main feature!

---

### 5. 🦊 Snap Tab

**Purpose:** Interact with MetaMask Snap for PQ signatures

**What it does:**
- Install/Connect MetaMask Snap
- Generate Dilithium3 keypair
- Sign messages
- Sign transactions (with ZK proof!)
- View signature details
- Export public key

**Key Features:**
```
┌─────────────────────────────────────┐
│ MetaMask Snap Status                │
│ Status: ✅ Connected                │
│ Version: 0.1.1                      │
├─────────────────────────────────────┤
│ [Create PQ Keys]                    │
│                                     │
│ Public Key:                         │
│ 0x1803194ee19a89d9...              │
│ (1952 bytes - ML-DSA-65)           │
├─────────────────────────────────────┤
│ Sign Message:                       │
│ [Hello, Post-Quantum World!]       │
│ [Sign Message]                     │
│                                     │
│ Signature:                          │
│ 0xb30f07ac080d9449...              │
│ (3309 bytes - Dilithium3)          │
│                                     │
│ ZK Proof: [Generate]               │
│ Gas estimate: ~250K                │
└─────────────────────────────────────┘
```

**Needed for demo?** ✅ YES - Shows the PQ crypto in action!

---

### 6. 🔮 Oracles Tab

**Purpose:** Display oracle price feeds and QRNG

**What it does:**
- Show Pyth price feeds (real-time)
- Display token prices (ETH, BTC, USDC, etc.)
- Show QRNG (Quantum Random Number Generator)
- Oracle health status

**Key Features:**
```
┌─────────────────────────────────────┐
│ Pyth Price Oracle                   │
├─────────────────────────────────────┤
│ ETH/USD: $2,345.67  ↑ +2.3%        │
│ BTC/USD: $45,123.45 ↑ +1.8%        │
│ USDC/USD: $1.00     → 0.0%         │
│                                     │
│ Last Update: 2 seconds ago         │
├─────────────────────────────────────┤
│ QRNG Oracle                         │
│ Random Number: 0x7f3a...           │
│ Source: ANU Quantum RNG            │
│ [Generate New]                     │
└─────────────────────────────────────┘
```

**Needed for demo?** Optional - Nice to show real price feeds

---

### 7. 🏗️ Architecture Tab

**Purpose:** Visual system architecture diagram

**What it shows:**
- System components
- Data flow
- Contract interactions
- Oracle integrations
- ZK proof flow

**Needed for demo?** Optional - Good for educational content

---

### 8. ⚙️ Settings Tab

**Purpose:** Configuration and preferences

**What it does:**
- Network selection
- RPC endpoint configuration
- Gas settings
- Theme (light/dark)
- Debug mode

**Needed for demo?** Optional - Only if you need to change settings

---

### 9. 🔧 Tools & Tests Tab

**Purpose:** Developer tools and testing utilities

**What it does:**
- Test Dilithium signatures
- Test ZK proof generation
- Contract interaction sandbox
- Debug logging
- Performance metrics

**Needed for demo?** Optional - Developer/debugging only

---

## 🎬 Complete End-to-End Demo Script

### Recommended: "Create Wallet → Set Up Vesting → Watch & Claim"

**Duration:** 10-15 minutes
**Difficulty:** Medium
**Impact:** High (shows everything!)

---

### 📋 Prerequisites

Before starting:
- [ ] Dashboard running on localhost:5175
- [ ] MetaMask installed and unlocked
- [ ] Snap server running (localhost:8080)
- [ ] Connected to Tenderly Ethereum Virtual TestNet
- [ ] Have some test ETH in your MetaMask wallet

---

### 🎯 Step-by-Step Flow

#### Phase 1: Deploy Contracts (5 min)

**Tab:** Deploy

1. **Select Network**
   - Click network dropdown
   - Select "Tenderly Ethereum Virtual TestNet"

2. **Deploy PQWalletFactory**
   - Click "Deploy" button
   - Confirm in MetaMask
   - Wait for deployment
   - Copy contract address

3. **Deploy PQValidator**
   - Click "Deploy" button
   - Confirm in MetaMask
   - Copy contract address

4. **Deploy PQVault (Implementation)**
   - Click "Deploy" button
   - Confirm in MetaMask
   - Copy contract address

5. **Verify All Contracts**
   - Click "Verify" for each
   - Check Tenderly dashboard

**Narration:**
"First, we need to deploy our smart contracts to the Tenderly test network. We're deploying the wallet factory, the validator for post-quantum signatures, and the vesting vault implementation."

---

#### Phase 2: Create PQ Wallet (3 min)

**Tab:** Wallets

1. **Generate PQ Keys** (via Snap)
   - Click "Connect Snap" if not connected
   - Click "Generate Keys"
   - Approve in MetaMask
   - Copy public key

2. **Create Wallet**
   - Enter your address as owner
   - Paste Dilithium public key
   - Click "Create Wallet"
   - Confirm in MetaMask
   - Wait for wallet creation
   - Note the wallet address

3. **Fund Wallet** (optional)
   - Send 0.1 test ETH to wallet
   - Confirm transaction

**Narration:**
"Now let's create a post-quantum wallet. First, I'll generate a Dilithium3 keypair using the MetaMask Snap. Then I'll deploy the wallet contract using CREATE2 for a deterministic address. This wallet can only be controlled with post-quantum signatures."

---

#### Phase 3: Set Up Vesting (3 min)

**Tab:** Vesting

1. **Create Vesting Schedule**
   - Beneficiary: [Your PQ Wallet address]
   - Token: Select test token (or deploy one)
   - Amount: 1000 tokens
   - Start Block: Current block + 10
   - Duration: 100 blocks (~20 minutes)
   - Cliff: 20 blocks (~4 minutes)

2. **Deploy Vesting Vault**
   - Click "Create Vesting Vault"
   - Confirm in MetaMask
   - Wait for deployment
   - Note vault address

3. **Fund Vesting Vault**
   - Approve token spending
   - Transfer tokens to vault
   - Confirm in MetaMask

**Narration:**
"Let's set up a vesting schedule. I'm creating a vault that will vest 1000 tokens over 100 blocks - about 20 minutes on Ethereum. There's a 4-minute cliff, meaning no tokens can be claimed until then."

---

#### Phase 4: Watch Vesting Progress (2-4 min)

**Tab:** Vesting

1. **View Progress Bar**
   - Watch it update as blocks are mined
   - Show percentage vested
   - Show claimable amount

2. **Explain Block-Based Vesting**
   - Point out block numbers
   - Explain why blocks (not timestamps)
   - Mention manipulation resistance

**Narration:**
"Watch the progress bar update in real-time. Notice we're using block numbers, not timestamps. This prevents manipulation by miners or validators. Every block, more tokens become available to claim."

---

#### Phase 5: Claim Vested Tokens (2 min)

**Tab:** Vesting → Snap

1. **Wait for Cliff**
   - Show "locked" status before cliff
   - Wait for cliff block
   - Show "claimable" status after

2. **Sign Claim Transaction**
   - Switch to Snap tab
   - Generate claim transaction
   - Sign with Dilithium3
   - Generate ZK proof (via API)
   - Submit to contract

3. **Confirm Receipt**
   - Switch back to Vesting tab
   - Show updated balances
   - Show remaining vesting

**Narration:**
"After the 4-minute cliff, tokens are claimable. I'll sign the claim transaction with my post-quantum signature. The Snap generates a Dilithium3 signature, then calls our API to create a ZK-SNARK proof. This proof costs only 250K gas to verify on-chain, instead of the 50 million gas a direct Dilithium verification would cost!"

---

### 📊 What This Demo Shows

✅ **Post-Quantum Security**
- Real Dilithium3 signatures (NIST ML-DSA-65)
- Quantum-resistant wallets

✅ **ZK-SNARK Optimization**
- 99.5% gas savings (50M → 250K)
- Off-chain proof generation
- On-chain verification

✅ **Smart Contract Innovation**
- ERC-4337 account abstraction
- ERC-4626 vesting vaults
- Block-based vesting (manipulation-proof)
- CREATE2 deterministic addresses

✅ **Real Oracle Integration**
- Pyth price feeds
- QRNG random numbers

✅ **Production Ready**
- Full Ethereum compatibility
- Tenderly testing environment
- Ready for mainnet (after audit)

---

## 🎥 Alternative: Quick Snap-Only Demo (2 min)

If you want something faster for social media:

### "Sign a Message with Post-Quantum Crypto"

**Tabs used:** Snap only

1. Open Snap tab
2. Install Snap
3. Generate keys
4. Sign "Hello, Quantum World!"
5. Show 3309-byte signature
6. Mention ZK proofs

**Perfect for:**
- Twitter/X videos (< 2:20)
- TikTok/Reels (< 60 sec with cuts)
- Quick demos at conferences

---

## 🎯 Recommended Demo Order (Pick One)

### For Technical Audience:
**Full E2E** (10-15 min) - Shows everything

### For General Audience:
**Snap Demo** (2-3 min) - Quick and impressive

### For Investors/Partners:
**Wallet + Vesting** (5-7 min) - Shows business value

---

## 💡 Tips for Each Demo Type

### Snap Demo Tips:
- Focus on "quantum-resistant" messaging
- Emphasize NIST approval
- Show signature size visually
- Explain ZK proof gas savings

### Vesting Demo Tips:
- Use short durations for demo (100 blocks = ~20 min)
- Explain block-based vs timestamp advantages
- Show real-time progress
- Highlight manipulation-proof design

### Full E2E Tips:
- Test deployment beforehand on Tenderly
- Have contract addresses ready
- Use pre-funded test wallets
- Practice the flow 2-3 times

---

## 📝 Quick Reference

### Minimum Viable Demo:
**Tabs:** Snap
**Time:** 2 minutes
**Contracts:** None
**Shows:** PQ signatures

### Recommended Demo:
**Tabs:** Deploy → Wallets → Vesting → Snap
**Time:** 10 minutes
**Contracts:** All
**Shows:** Complete system

### Maximum Demo:
**Tabs:** All 9 tabs
**Time:** 20 minutes
**Contracts:** All + Oracles
**Shows:** Everything + architecture

---

**Choose the demo that best fits your audience and time constraints!** 🎬

For your OBS recording, I recommend the **Snap Demo (2-3 min)** for social media or the **Full E2E (10 min)** for a comprehensive showcase.
