# Pyth Network Integration - EthVaultPQ

## 🏆 Prize Eligibility Documentation

This document describes EthVaultPQ's integration with **Pyth Network** for hackathon prize eligibility.

---

## Overview

EthVaultPQ integrates Pyth Network's real-time price oracles to provide accurate USD valuations for post-quantum secured vesting schedules. This integration enables:

- **Real-time token pricing** for vested assets
- **Multi-currency valuation** (USD, ETH, BTC equivalent)
- **Historical price tracking** at vesting milestones
- **Transparent vesting value** calculations

---

## Integration Components

### 1. Smart Contracts

#### **PythPriceOracle.sol**
Location: `contracts/oracles/PythPriceOracle.sol`

**Purpose**: Wrapper contract for Pyth Network price feeds

**Features**:
- Multi-token price support (ETH, BTC, USDC, USDT, DAI, etc.)
- Configurable staleness checks (default: 60 seconds)
- Confidence interval validation (< 1% uncertainty)
- Emergency pause mechanism
- Batch price queries
- On-chain price updates

**Key Functions**:
```solidity
// Get latest price for a token
function getPrice(address token) external view
    returns (int64 price, int32 expo, uint256 timestamp);

// Get USD value of token amount
function getValueUSD(address token, uint256 amount, uint8 tokenDecimals)
    external view returns (uint256 valueUSD);

// Update price feeds (pays update fee)
function updatePriceFeeds(bytes[] calldata updateData) external payable;
```

**Deployed To**: Tenderly Ethereum Virtual TestNet (pending)

---

#### **PQVault4626WithPricing.sol**
Location: `contracts/vault/PQVault4626WithPricing.sol`

**Purpose**: Enhanced vesting vault with USD pricing

**Features**:
- Real-time USD valuation of vested shares
- Price history recording at deposit
- Vesting progress with dollar amounts
- Future value estimation
- Multi-currency breakdown (total, vested, unvested)

**Key Functions**:
```solidity
// Get current USD value of vested shares
function getVestedValueUSD(address user) external view
    returns (uint256 valueUSD, uint256 vestedShares);

// Get complete vesting breakdown in USD
function getVestingValueBreakdown(address user) external view
    returns (uint256 totalValueUSD, uint256 vestedValueUSD, uint256 unvestedValueUSD);

// Get vesting progress with prices
function getVestingProgress(address user) external view
    returns (uint256 percentVested, uint256 vestedShares, uint256 totalShares,
             uint256 currentValueUSD, int64 initialPrice, int64 currentPrice);

// Estimate future vesting value
function estimateFutureValue(address user, uint256 futureBlock) external view
    returns (uint256 estimatedShares, uint256 estimatedValueUSD);
```

---

### 2. Frontend Components

#### **PriceDisplay.tsx**
Location: `dashboard/src/components/PriceDisplay.tsx`

**Purpose**: Real-time price display component

**Features**:
- Live price updates every 10 seconds
- Confidence interval display
- Staleness indicators (green < 60s, yellow < 5m, red > 5m)
- Multi-token grid view
- "Live" status indicator

**Usage**:
```tsx
import { PriceDisplay, PriceGrid } from './components/PriceDisplay';
import { COMMON_TOKENS } from './config/pythPriceIds';

// Single token
<PriceDisplay
  symbol="ETH"
  priceId={PYTH_PRICE_IDS.ETH_USD}
  label="Ethereum"
  showConfidence={true}
/>

// Multiple tokens
<PriceGrid tokens={COMMON_TOKENS} />
```

---

#### **pythPriceIds.ts**
Location: `dashboard/src/config/pythPriceIds.ts`

**Purpose**: Centralized Pyth price feed configuration

**Supported Tokens**:
- **Major Crypto**: ETH, BTC, USDC, USDT, DAI
- **DeFi Tokens**: UNI, AAVE, LINK, MKR, CRV
- **Layer 2**: MATIC, OP, ARB
- **Others**: WBTC, stETH, FRAX, BUSD

**Total**: 15+ token price feeds configured

---

## Use Cases

### 1. **Vesting Valuation**
Employees can see the **current USD value** of their vested tokens in real-time:

```
Total Vesting: 10,000 USDC = $10,012.34 USD
Vested (40%):  4,000 USDC  = $4,004.94 USD
Unvested:      6,000 USDC  = $6,007.40 USD
```

### 2. **Price History Tracking**
Track how token price changed since vesting started:

```
Start Price: $1.00 USDC
Current Price: $1.0012 USDC
Price Change: +0.12%
```

### 3. **Multi-Currency Portfolio**
View vesting schedules across different tokens with unified USD view:

```
ETH Vesting:  1.5 ETH   = $4,125.00 USD
USDC Vesting: 5,000 USDC = $5,006.17 USD
Total Value:                $9,131.17 USD
```

### 4. **Future Value Estimation**
Estimate vesting value at a future block (using current prices):

```
Block 20,000,000 (in 30 days):
  Estimated Vested: 6,000 USDC = $6,007.20 USD
  Estimated Unvested: 4,000 USDC = $4,004.80 USD
```

---

## Dashboard Integration

### Oracles Tab
The Oracles tab now displays:

1. **Pyth Network Price Feeds** (with 🏆 Prize Eligible badge)
   - Live prices for ETH, BTC, USDC, USDT, DAI
   - Real-time updates every 10 seconds
   - Confidence intervals and staleness indicators

2. **Post-Quantum Oracles**
   - ZK Proof Oracle (Dilithium signature verification)
   - QRNG Oracle (Quantum random number generation)

**Screenshot**: See dashboard at http://localhost:5175 → Oracles tab

---

## Deployment

### Deploy Script
Location: `script/DeployPythOracle.s.sol`

**Command**:
```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d

# Deploy
forge script script/DeployPythOracle.s.sol:DeployPythOracle --rpc-url $RPC_URL --broadcast
```

**What it deploys**:
1. PythPriceOracle contract
2. Configures price feeds for ETH, BTC, USDC, USDT, DAI
3. Optionally deploys PQVault4626WithPricing (when token address provided)

**Gas Costs** (estimated):
- PythPriceOracle deployment: ~1.5M gas
- Price feed configuration (5 tokens): ~500K gas
- Total: ~2M gas (~$10 USD on mainnet at 50 gwei)

---

## Testing

### Unit Tests
Location: `test/PythPriceOracle.t.sol` (to be created)

**Test Coverage**:
- Price feed registration
- USD value calculations
- Staleness validation
- Confidence interval checks
- Multi-token batch queries
- Emergency pause functionality

### Integration Tests
**Manual Testing Steps**:

1. Deploy PythPriceOracle to Tenderly
2. Configure price feeds (ETH, USDC, etc.)
3. Query prices and verify with Pyth API
4. Deploy PQVault4626WithPricing
5. Create vesting schedule
6. Verify USD values update correctly
7. Test price history recording

**Expected Results**:
- Prices within 1% of Pyth API
- Updates every 10-60 seconds
- No reverts on stale data (< 60s old)

---

## Price Feed Configuration

### Pyth Contract Addresses
```solidity
// Ethereum Mainnet
address constant PYTH_MAINNET = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;

// Sepolia Testnet
address constant PYTH_SEPOLIA = 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21;

// Tenderly (uses mainnet fork)
address constant PYTH_TENDERLY = 0x4305FB66699C3B2702D4d05CF36551390A4c69C6;
```

### Configured Price Feeds

| Token | Symbol | Price Feed ID | Address |
|-------|--------|--------------|---------|
| Ethereum | ETH | 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace | WETH |
| Bitcoin | BTC | 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 | WBTC |
| USD Coin | USDC | 0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a | USDC |
| Tether | USDT | 0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b | USDT |
| Dai | DAI | 0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd | DAI |

Full list: See `dashboard/src/config/pythPriceIds.ts`

---

## API Integration

### Hermes Price Service
**Endpoint**: `https://hermes.pyth.network`

**Usage in Dashboard**:
```typescript
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';

const connection = new EvmPriceServiceConnection('https://hermes.pyth.network');
const priceFeeds = await connection.getLatestPriceFeeds([priceId]);
const price = priceFeeds[0].getPriceUnchecked();
```

**Update Frequency**: 400ms on-chain, 10s in dashboard (for performance)

---

## Security Considerations

### 1. **Staleness Checks**
Prices older than 60 seconds are rejected:
```solidity
uint256 age = block.timestamp - price.publishTime;
if (age > maxPriceAge) revert PriceTooOld(age, maxPriceAge);
```

### 2. **Confidence Intervals**
Prices with > 1% uncertainty are rejected:
```solidity
uint256 confidenceBps = (confidence * 10000) / price;
if (confidenceBps > minConfidenceBps) revert PriceNotConfident(...);
```

### 3. **Emergency Pause**
Owner can pause oracle in case of anomalies:
```solidity
function pause() external onlyOwner { paused = true; }
```

### 4. **No Price Manipulation**
Vesting uses **block numbers**, not prices, for time calculations. Prices are only for **display/valuation**, never for unlocking logic.

---

## Benefits for EthVaultPQ

1. **Transparency**: Recipients see exact USD value of vesting
2. **Multi-Token Support**: Price any ERC-20 token in the vesting vault
3. **Tax Reporting**: Historical price snapshots for tax compliance
4. **User Experience**: Real-time updates without centralized backend
5. **Composability**: Other protocols can query vesting USD values

---

## Prize Eligibility Checklist

- ✅ **Pyth SDK Installed**: `@pythnetwork/pyth-evm-js`
- ✅ **Smart Contract Integration**: PythPriceOracle.sol
- ✅ **Price Feed Configuration**: 15+ tokens configured
- ✅ **Frontend Integration**: Live price displays
- ✅ **Real-World Use Case**: USD valuation of vesting schedules
- ✅ **Documentation**: This file + inline comments
- ✅ **Deployment Script**: DeployPythOracle.s.sol
- ✅ **Open Source**: MIT License, public GitHub repo

---

## Future Enhancements

1. **Price-Based Vesting Triggers**
   - Unlock vesting when token price reaches $X
   - Example: "Vest 10% when ETH > $5,000"

2. **Multi-Currency Display**
   - Show vesting value in EUR, GBP, JPY
   - Use Pyth's FX price feeds

3. **Price Alerts**
   - Notify recipients when vested value crosses threshold
   - Example: "Your vesting is now worth $100K USD"

4. **Historical Charts**
   - Price history visualization
   - Vesting value over time chart

5. **Tax Reporting**
   - Automatically calculate cost basis
   - Generate IRS Form 1099 data

---

## Links

- **Pyth Network**: https://pyth.network
- **Price Feeds**: https://pyth.network/developers/price-feed-ids
- **Docs**: https://docs.pyth.network
- **Hermes API**: https://hermes.pyth.network
- **Contract Addresses**: https://docs.pyth.network/price-feeds/contract-addresses/evm

---

## Contact

For questions about this integration:
- GitHub: https://github.com/yourusername/EthVaultPQ
- Project: EthVaultPQ - Post-Quantum Ethereum Protocol

---

**Built with Pyth Network**
**Prize Category**: Pyth Network Integration
**Status**: Testnet Ready (Tenderly)
**Next**: Deploy to Tenderly → Test → Submit for prizes

---

*Last Updated: October 18, 2025*
