# Dashboard TODO - EthVaultPQ UI Updates

## Status: ⚠️ NEEDS UPDATE

**Last Updated:** October 17, 2025
**Priority:** HIGH - Required for Tenderly testing

---

## Overview

The dashboard UI has not been updated recently and needs the following additions to support Tenderly Ethereum deployment and testing.

---

## 1. NEW: Deploy Tab (HIGH PRIORITY)

### Requirements

Create a new "Deploy" tab in the dashboard that shows deployment status and allows contract deployment to Tenderly Ethereum.

### Features Needed

#### Network Selection
- [ ] Dropdown to select network:
  - Tenderly Ethereum Virtual TestNet ✨ (PRIMARY)
  - Sepolia Testnet
  - Ethereum Mainnet (disabled until audit)
- [ ] Display current network
- [ ] Show connection status
- [ ] Gas price indicator

#### Contract Deployment Section
- [ ] **Groth16Verifier**
  - Deploy button
  - Address display
  - Status indicator (Not Deployed / Deploying / Deployed / Verified)
  - Etherscan/Tenderly link

- [ ] **PQValidator**
  - Deploy button (requires Groth16Verifier address)
  - Address display
  - Status indicator
  - Link to verifier

- [ ] **PQWalletFactory**
  - Deploy button (requires PQValidator + EntryPoint)
  - Address display
  - Status indicator
  - Configuration panel (EntryPoint address)

- [ ] **PQVault4626**
  - Deploy button
  - Asset token address input
  - Vault name/symbol inputs
  - Address display
  - Status indicator

- [ ] **ZKProofOracle**
  - Deploy button (requires Groth16Verifier)
  - Address display
  - Status indicator
  - Configuration (fee, operators)

- [ ] **QRNGOracle**
  - Deploy button
  - Address display
  - Status indicator
  - Configuration (fee, operators)

#### Deployment Progress
- [ ] Overall progress bar (X of 6 contracts deployed)
- [ ] Step-by-step deployment wizard
- [ ] Transaction hash display
- [ ] Gas cost tracking
- [ ] Error handling and retry

#### Contract Verification
- [ ] Auto-verify on Tenderly
- [ ] Manual verify button
- [ ] Verification status
- [ ] Constructor arguments display

#### Testing Panel
- [ ] Quick test buttons:
  - Create test wallet
  - Deposit with vesting
  - Request ZK proof
  - Request random number
- [ ] Transaction history
- [ ] Event log viewer

---

## 2. Vesting Demo: Fast-Forward Test (NEW IDEA)

### Concept
Create a special vesting test that vests **1 month per minute** to demonstrate time-based vesting without waiting real-time.

### Implementation Options

#### Option A: Demo Contract (Recommended)
Create a special demo version of PQVault4626 with accelerated time:

```solidity
contract PQVault4626Demo is PQVault4626 {
    // Override BLOCK_TIME to make blocks = minutes instead of seconds
    uint256 public constant DEMO_ACCELERATION = 60; // 1 minute = 1 hour

    function _calculateVestedShares(address user) internal view override returns (uint256) {
        // Use accelerated time calculation
        // Each block represents DEMO_ACCELERATION seconds
        // So a 30-day vest = 30 * 24 * 60 seconds = 43,200 minutes
        // On a 12-second block time = 3,600 blocks
        // With acceleration: 3,600 / 60 = 60 blocks = ~12 minutes real-time!
    }
}
```

**Benefits:**
- Safe (separate contract)
- Clear it's a demo
- Realistic behavior, just faster

**Demo Timing:**
- 1 month vesting = ~1 minute real-time
- 1 year vesting = ~12 minutes real-time
- Perfect for live demonstrations

#### Option B: Tenderly Time Manipulation
Use Tenderly's time/block manipulation features:

```typescript
// In dashboard code
async function fastForwardVesting(months: number) {
  // Tenderly allows block manipulation
  // Fast-forward blocks to simulate time passing
  const blocksPerMonth = (30 * 24 * 60 * 60) / 12; // ~216,000 blocks
  await tenderly.fastForwardBlocks(blocksPerMonth * months);
}
```

**Benefits:**
- Uses real contracts
- Tenderly native feature
- Easy to implement in UI

**Dashboard Features:**
- [ ] Time travel controls
- [ ] "Fast forward X months" button
- [ ] Current vesting progress
- [ ] Visual timeline

#### Option C: Hybrid Approach (BEST)
Deploy both:
1. Real PQVault4626 for actual testing
2. PQVault4626Demo for demonstrations

**UI Features:**
- [ ] Toggle between "Real" and "Demo" mode
- [ ] Demo mode shows accelerated vesting
- [ ] Real mode uses Tenderly time manipulation
- [ ] Clear indicators which mode you're in

---

## 3. Dashboard Structure Update

### Proposed New Layout

```
Dashboard/
├── Home
│   ├── Overview
│   ├── Quick Stats
│   └── Recent Activity
│
├── Wallet
│   ├── Create Wallet
│   ├── My Wallets
│   └── Transactions
│
├── Vesting
│   ├── Create Vesting Schedule
│   ├── My Vesting Positions
│   ├── Withdraw Vested
│   └── Demo Mode Toggle ✨ (NEW)
│
├── Oracles
│   ├── Request ZK Proof
│   ├── Request Random Number
│   ├── My Requests
│   └── Oracle Status
│
├── Deploy ✨ (NEW TAB)
│   ├── Network Selection
│   ├── Contract Deployment
│   ├── Verification Status
│   ├── Test Transactions
│   └── Demo Contracts
│
└── Settings
    ├── Network Config
    ├── Wallet Connection
    └── Gas Settings
```

---

## 4. Technical Implementation

### Deploy Tab Component

```typescript
// dashboard/src/components/DeployTab.tsx

interface DeploymentStatus {
  groth16Verifier: ContractStatus;
  pqValidator: ContractStatus;
  pqWalletFactory: ContractStatus;
  pqVault4626: ContractStatus;
  zkProofOracle: ContractStatus;
  qrngOracle: ContractStatus;
}

interface ContractStatus {
  address?: string;
  status: 'not-deployed' | 'deploying' | 'deployed' | 'verified' | 'error';
  txHash?: string;
  error?: string;
  gasUsed?: bigint;
}

export function DeployTab() {
  const [network, setNetwork] = useState<'tenderly' | 'sepolia' | 'mainnet'>('tenderly');
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({...});

  const deployContract = async (contractName: string) => {
    // Deploy logic
  };

  return (
    <div className="deploy-tab">
      <NetworkSelector value={network} onChange={setNetwork} />
      <DeploymentProgress status={deploymentStatus} />
      <ContractDeploymentPanel
        contracts={deploymentStatus}
        onDeploy={deployContract}
      />
      <TestingPanel deploymentStatus={deploymentStatus} />
    </div>
  );
}
```

### Vesting Demo Component

```typescript
// dashboard/src/components/VestingDemo.tsx

export function VestingDemo() {
  const [demoMode, setDemoMode] = useState(false);
  const [vestingProgress, setVestingProgress] = useState(0);

  const fastForward = async (months: number) => {
    if (demoMode) {
      // Use demo contract (1 month per minute)
      await waitMinutes(months);
    } else {
      // Use Tenderly time manipulation
      await tenderly.fastForwardTime(months * 30 * 24 * 60 * 60);
    }
  };

  return (
    <div className="vesting-demo">
      <Toggle
        label="Demo Mode (1 month per minute)"
        value={demoMode}
        onChange={setDemoMode}
      />

      {demoMode && (
        <div className="fast-forward-controls">
          <button onClick={() => fastForward(1)}>+1 Month (1 min)</button>
          <button onClick={() => fastForward(3)}>+3 Months (3 min)</button>
          <button onClick={() => fastForward(6)}>+6 Months (6 min)</button>
          <button onClick={() => fastForward(12)}>+1 Year (12 min)</button>
        </div>
      )}

      <VestingTimeline progress={vestingProgress} />
    </div>
  );
}
```

---

## 5. Tenderly Integration

### Configuration

```typescript
// dashboard/src/config/tenderly.ts

export const TENDERLY_CONFIG = {
  network: 'ethereum', // NOT base!
  virtualTestnet: true,
  rpcUrl: process.env.VITE_TENDERLY_RPC_URL,
  features: {
    simulation: true,
    debugging: true,
    monitoring: true,
    timeTravel: true, // For fast-forward vesting
  }
};

export const NETWORK_CONFIG = {
  tenderly: {
    name: 'Tenderly Ethereum Virtual TestNet',
    chainId: 1, // Ethereum mainnet fork
    rpcUrl: TENDERLY_CONFIG.rpcUrl,
    explorer: 'https://dashboard.tenderly.co',
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: process.env.VITE_SEPOLIA_RPC_URL,
    explorer: 'https://sepolia.etherscan.io',
  },
};
```

---

## 6. Environment Variables Needed

### Add to `.env.example`:

```bash
# Tenderly Configuration (PRIMARY TEST NETWORK)
VITE_TENDERLY_RPC_URL=https://rpc.tenderly.co/fork/YOUR_FORK_ID
VITE_TENDERLY_PROJECT=your-project
VITE_TENDERLY_USERNAME=your-username
VITE_TENDERLY_ACCESS_KEY=your-access-key

# Deployment Configuration
VITE_ENTRYPOINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
VITE_DEMO_MODE_ENABLED=true

# Network Selection
VITE_DEFAULT_NETWORK=tenderly # tenderly | sepolia | mainnet
```

---

## 7. Implementation Timeline

### Phase 1: Deploy Tab (Week 1)
- [ ] Create Deploy tab component
- [ ] Network selection dropdown
- [ ] Contract deployment UI
- [ ] Status tracking
- [ ] Basic testing panel

### Phase 2: Vesting Demo (Week 1-2)
- [ ] Deploy PQVault4626Demo contract
- [ ] Demo mode toggle
- [ ] Fast-forward controls
- [ ] Visual timeline
- [ ] Progress indicators

### Phase 3: Integration (Week 2)
- [ ] Connect to Tenderly
- [ ] Deploy contracts to Tenderly
- [ ] Test all features
- [ ] Documentation
- [ ] User guide

---

## 8. Testing Checklist

### Deploy Tab Testing
- [ ] Deploy all 6 contracts on Tenderly
- [ ] Verify each contract
- [ ] Test wallet creation
- [ ] Test vesting deposit
- [ ] Test oracle requests
- [ ] Test emergency pause
- [ ] Test access controls

### Vesting Demo Testing
- [ ] Deploy demo contract
- [ ] Test 1-month fast-forward
- [ ] Test 1-year fast-forward
- [ ] Verify vesting calculations correct
- [ ] Test withdrawal after fast-forward
- [ ] Compare demo vs real timing

---

## 9. Design Mockup

### Deploy Tab Layout

```
╔═══════════════════════════════════════════════════════════╗
║ Deploy                                          [Tenderly ▼]║
╠═══════════════════════════════════════════════════════════╣
║                                                             ║
║  Progress: ████████░░░░░░░░░░░░  4/6 Deployed             ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ Groth16Verifier                     ✅ Deployed     │  ║
║  │ 0x1234...5678                       [View] [Test]   │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ PQValidator                         ✅ Deployed     │  ║
║  │ 0xabcd...ef01                       [View] [Test]   │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ PQWalletFactory                     ✅ Deployed     │  ║
║  │ 0x2345...6789                       [View] [Test]   │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ PQVault4626                         ✅ Deployed     │  ║
║  │ 0x3456...789a                       [View] [Test]   │  ║
║  │ Demo: 0x4567...89ab                 [View] [Test]   │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ ZKProofOracle                       ⏳ Deploying... │  ║
║  │ Tx: 0xabcd...                       [Cancel]        │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  ┌────────────────────────────────────────────────────┐  ║
║  │ QRNGOracle                          ⚪ Not Deployed │  ║
║  │                                     [Deploy Now]    │  ║
║  └────────────────────────────────────────────────────┘  ║
║                                                             ║
║  [Deploy All]  [Verify All]  [Export Addresses]           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 10. Priority Actions

### Immediate (This Week):
1. **Create Deploy Tab UI** (2-3 days)
2. **Add Tenderly network config** (1 day)
3. **Implement deployment scripts** (2 days)
4. **Test on Tenderly** (1 day)

### Next Week:
1. **Deploy demo contract** (1 day)
2. **Add fast-forward UI** (2 days)
3. **Test vesting demo** (1 day)
4. **User documentation** (1 day)

---

## Success Criteria

- [ ] Can deploy all 6 contracts to Tenderly Ethereum
- [ ] Deploy tab shows status of all contracts
- [ ] Can verify contracts on Tenderly
- [ ] Can test basic functionality from dashboard
- [ ] Demo vesting works (1 month per minute)
- [ ] Can switch between real and demo vesting
- [ ] All transactions tracked and displayed
- [ ] Error handling works
- [ ] User guide complete

---

**Next Steps:**
1. Review this TODO with team
2. Assign developers to Deploy Tab
3. Create Tenderly fork
4. Begin UI implementation
5. Test on Tenderly Ethereum

**Estimated Time:** 1-2 weeks for full implementation

---

**Generated:** October 17, 2025
**Priority:** HIGH
**Blocker for:** Tenderly deployment and testing
