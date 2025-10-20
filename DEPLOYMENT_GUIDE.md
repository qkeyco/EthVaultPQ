# EthVaultPQ - Deployment Guide

Complete guide for deploying all contracts and integrations to Tenderly Virtual TestNet.

---

## Prerequisites

### 1. Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# Required:
# - PRIVATE_KEY (deployment wallet)
# - RPC_URL (Tenderly virtual testnet)
```

### 2. Install Dependencies

```bash
# Install Foundry dependencies
forge install

# Build contracts
forge build

# Run tests
forge test
```

### 3. Fund Deployment Wallet

Your deployment wallet needs ETH on Tenderly Virtual TestNet (free - no real cost).

**Get your address**:
```bash
cast wallet address --private-key $PRIVATE_KEY
```

**Fund via Tenderly Faucet**: Use Tenderly dashboard to fund your address.

---

## Deployment Steps

### Step 1: Deploy Core Contracts (Already Done ✅)

The following contracts are already deployed to Tenderly:

```
ZKVerifier:         0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288
PQValidator:        0xf527846F3219A6949A8c8241BB5d4ecf2244CadF
PQWalletFactory:    0x5895dAbE895b0243B345CF30df9d7070F478C47F
MockToken (MUSDC):  0xc351De5746211E2B7688D7650A8bF7D91C809c0D
PQVault4626:        0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21
PQVault4626Demo:    0xE6D42d7B673852fDd755E870A3bDD85a4852AE9C
ZKProofOracle:      0xF8982849A04d7CeD0c36ed9028e293CB4c2277C9
QRNGOracle:         0x1b7754689d5bDf4618aA52dDD319D809a00B0843
```

---

### Step 2: Deploy Pyth Price Oracle ($5K Prize)

**Command**:
```bash
# Load environment
source .env

# Deploy Pyth integration
forge script script/DeployPythOracle.s.sol:DeployPythOracle \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY \
    -vvvv
```

**Expected Output**:
```
== Logs ==
  Deploying Pyth Oracle integration...
  Deployer: 0x...
  PythPriceOracle deployed at: 0x...

  Configuring price feeds...
  Configured ETH/USD price feed
  Configured BTC/USD price feed
  Configured USDC/USD price feed
  Configured USDT/USD price feed
  Configured DAI/USD price feed
  Configured PYUSD/USD price feed
  Price feed configuration complete!

  === Deployment Summary ===
  PythPriceOracle: 0x...
  Network: Tenderly Ethereum Virtual TestNet
```

**Save the deployed address** to `.env`:
```bash
echo "PYTH_PRICE_ORACLE=0x..." >> .env
```

---

### Step 3: Deploy Pricing-Enabled Vault

**Update deployment script** with PythPriceOracle address:

```solidity
// In DeployPythOracle.s.sol, uncomment the vault deployment:

address tokenAddress = 0xc351De5746211E2B7688D7650A8bF7D91C809c0D; // MUSDC
PQVault4626WithPricing vault = new PQVault4626WithPricing(
    IERC20(tokenAddress),
    "PQ Vesting Vault - MUSDC (with Pricing)",
    "vMUSDC-PQ-Price",
    6,  // MUSDC decimals
    address(priceOracle)
);
console.log("PQVault4626WithPricing deployed at:", address(vault));
```

**Deploy**:
```bash
forge script script/DeployPythOracle.s.sol:DeployPythOracle \
    --rpc-url $RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY
```

**Save vault address**:
```bash
echo "PQ_VAULT_WITH_PRICING=0x..." >> .env
```

---

### Step 4: Verify Contracts (Blockscout - $10K Prize)

#### On Tenderly Explorer

Tenderly has built-in verification. Visit:
```
https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
```

For each contract:
1. Click on contract address
2. Click "Verify Contract"
3. Upload source code or use Foundry verification

#### Using Foundry (if Blockscout instance available)

```bash
# Verify PythPriceOracle
forge verify-contract \
    --chain-id 1 \
    --num-of-optimizations 200 \
    --compiler-version v0.8.28 \
    $PYTH_PRICE_ORACLE \
    contracts/oracles/PythPriceOracle.sol:PythPriceOracle \
    --constructor-args $(cast abi-encode "constructor(address,address)" \
        0x4305FB66699C3B2702D4d05CF36551390A4c69C6 \
        $DEPLOYER_ADDRESS)
```

---

### Step 5: Update Dashboard Configuration

**Edit** `dashboard/src/config/contracts.ts`:

```typescript
export const DEPLOYED_CONTRACTS = {
  // Existing contracts
  zkVerifier: '0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288',
  pqValidator: '0xf527846F3219A6949A8c8241BB5d4ecf2244CadF',
  // ... other contracts ...

  // New Pyth integration
  pythPriceOracle: '0x...', // YOUR DEPLOYED ADDRESS
  pqVaultWithPricing: '0x...', // YOUR DEPLOYED VAULT
} as const;
```

**Restart dashboard**:
```bash
cd dashboard
npm run dev
```

**Test**: Navigate to http://localhost:5175 → Oracles tab
- Should see live prices for ETH, BTC, PYUSD, USDC, USDT, DAI
- Prices should update every 10 seconds

---

## Testing Deployment

### Test 1: Query Pyth Prices

```bash
# Get ETH price
cast call $PYTH_PRICE_ORACLE \
    "getPrice(address)(int64,int32,uint256)" \
    0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

# Get PYUSD price
cast call $PYTH_PRICE_ORACLE \
    "getPrice(address)(int64,int32,uint256)" \
    0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
```

**Expected**: Returns (price, exponent, timestamp)

---

### Test 2: Create Vesting with USD Valuation

```bash
# Approve vault to spend MUSDC
cast send $MOCK_TOKEN \
    "approve(address,uint256)" \
    $PQ_VAULT_WITH_PRICING \
    1000000000 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

# Create vesting schedule
cast send $PQ_VAULT_WITH_PRICING \
    "depositWithVestingAndPrice(uint256,address,uint256,uint256)" \
    1000000000 \
    $RECIPIENT_ADDRESS \
    31536000 \
    0 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY
```

---

### Test 3: Check USD Value

```bash
# Get vested value in USD
cast call $PQ_VAULT_WITH_PRICING \
    "getVestedValueUSD(address)(uint256,uint256)" \
    $RECIPIENT_ADDRESS
```

**Expected**: Returns (USD value with 8 decimals, vested shares)

---

## Dashboard Integration Testing

### Manual Test Checklist

1. **Oracles Tab**:
   - [ ] Navigate to Oracles tab
   - [ ] Verify Pyth Network section visible
   - [ ] Verify 6 price cards displayed (ETH, BTC, PYUSD, USDC, USDT, DAI)
   - [ ] Verify prices are live numbers (not "Loading...")
   - [ ] Verify "Live" indicator is green and pulsing
   - [ ] Verify prices update after 10 seconds
   - [ ] Verify "Prize Eligible" badge visible

2. **Vesting Tab**:
   - [ ] Create new vesting schedule
   - [ ] Verify USD value displayed (if using pricing vault)
   - [ ] Verify price history recorded

3. **Tools Tab**:
   - [ ] Run network diagnostics
   - [ ] Verify contract addresses valid
   - [ ] Check block time test

---

## Troubleshooting

### Issue: "Insufficient update fee" when calling Pyth

**Solution**: Pyth requires a small fee for price updates. Check the fee:

```bash
# Get update fee
cast call $PYTH_PRICE_ORACLE \
    "getUpdateFee(bytes[])(uint256)" \
    "[]"
```

Send value with the call:
```bash
cast send $PYTH_PRICE_ORACLE \
    "updatePriceFeeds(bytes[])" \
    "[]" \
    --value 1 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY
```

---

### Issue: Price feeds not working

**Check**:
1. Pyth contract address is correct for the network
2. Price IDs are valid (check `dashboard/src/config/pythPriceIds.ts`)
3. Token addresses are correct

**Debug**:
```bash
# Check if token is supported
cast call $PYTH_PRICE_ORACLE \
    "isSupported(address)(bool)" \
    $TOKEN_ADDRESS
```

---

### Issue: Dashboard not showing prices

**Check**:
1. `@pythnetwork/pyth-evm-js` is installed
2. Browser console for errors
3. Network requests to Pyth Hermes API (`https://hermes.pyth.network`)

**Debug**:
Open browser DevTools → Network tab → Filter "hermes" → Should see successful 200 responses

---

## Prize Submission

### Pyth Network ($5K)

**What to submit**:
1. Deployed PythPriceOracle contract address
2. Link to dashboard showing live prices
3. Link to GitHub repo with integration code
4. Screenshots of dashboard Oracles tab
5. Video demo (3-5 minutes)

**Submission checklist**:
- [ ] Contract deployed and functional
- [ ] 15+ price feeds configured
- [ ] Dashboard integration working
- [ ] Documentation complete (`PYTH_INTEGRATION.md`)
- [ ] Demo video recorded
- [ ] GitHub repo public with MIT license

---

### Blockscout ($10K)

**What to submit**:
1. List of all 10 verified contract addresses
2. Links to Blockscout/Tenderly explorer pages
3. Screenshots of verification
4. Link to GitHub with enhanced NatSpec

**Submission checklist**:
- [ ] All 10 contracts verified
- [ ] Rich NatSpec documentation added
- [ ] Custom metadata configured
- [ ] Documentation complete (`BLOCKSCOUT_INTEGRATION.md`)
- [ ] Demo video recorded

---

### PayPal USD ($10K)

**What to submit**:
1. PYUSD price feed configuration
2. PYUSD vesting vault deployment
3. Dashboard showing PYUSD support
4. Use case documentation

**Submission checklist**:
- [ ] PYUSD price feed in Pyth oracle
- [ ] PYUSD visible in dashboard
- [ ] PYUSD vesting vault deployed (optional)
- [ ] Documentation complete (`PAYPAL_USD_INTEGRATION.md`)
- [ ] Demo video recorded
- [ ] Use cases explained (payroll, grants, etc.)

---

## Post-Deployment

### Update Documentation

1. Add deployed addresses to README.md
2. Update PRIZE_SUMMARY.md with deployment status
3. Create deployment transaction links
4. Add Tenderly dashboard links

### Create Demo Videos

**Video 1: Pyth Integration (3-5 min)**
- Show dashboard
- Navigate to Oracles tab
- Point out live prices
- Explain use cases
- Show vesting USD valuation

**Video 2: Blockscout (2-3 min)**
- Show verified contracts
- Highlight documentation
- Explain transparency benefits

**Video 3: PayPal USD (3-4 min)**
- Show PYUSD price
- Explain stable vesting
- Demonstrate off-ramp process

### Submit Prize Applications

**Timeline**:
- Day 1: Deploy all contracts
- Day 2: Test thoroughly
- Day 3: Record videos
- Day 4: Submit applications
- Day 5: Follow up with organizers

---

## Gas Costs (Ethereum Mainnet Estimates)

**At 50 gwei gas price**:

| Contract | Gas Used | Cost (ETH) | Cost (USD @ $3000 ETH) |
|----------|----------|------------|------------------------|
| PythPriceOracle | ~1,500,000 | 0.075 | $225 |
| PQVault4626WithPricing | ~3,000,000 | 0.15 | $450 |
| Configure 6 price feeds | ~300,000 | 0.015 | $45 |
| **Total** | **~4,800,000** | **0.24** | **$720** |

**On Tenderly**: Free (testnet)
**On Layer 2**: ~10-100x cheaper

---

## Security Considerations

### Pre-Deployment Checklist

- [ ] All tests passing (`forge test`)
- [ ] Slither analysis clean
- [ ] No TODO/FIXME in production code
- [ ] Owner address is correct multi-sig
- [ ] Price feed IDs verified from Pyth docs
- [ ] Token addresses verified on Etherscan

### Post-Deployment Checklist

- [ ] Verify contract source code
- [ ] Test all price feeds
- [ ] Test vesting creation
- [ ] Test USD valuation
- [ ] Monitor for anomalies (24 hours)
- [ ] Set up monitoring alerts

---

## Monitoring

### Tenderly Dashboard

Monitor all transactions:
```
https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d
```

### Key Metrics to Watch

1. **Price Feed Updates**
   - Frequency: Every 10 seconds (dashboard)
   - Staleness: < 60 seconds (contract)
   - Confidence: < 1% (contract)

2. **Vesting Operations**
   - Deposits per day
   - Withdrawals per day
   - Total value locked

3. **Errors**
   - Failed transactions
   - Reverted calls
   - Gas spikes

---

## Rollback Plan

If deployment fails or issues found:

1. **Pause contracts**:
   ```bash
   cast send $PYTH_PRICE_ORACLE "pause()" \
       --rpc-url $RPC_URL \
       --private-key $PRIVATE_KEY
   ```

2. **Deploy fixes to new address**

3. **Update dashboard configuration**

4. **Migrate users (if needed)**

---

## Support

**Issues**: https://github.com/yourusername/EthVaultPQ/issues
**Documentation**: See `PYTH_INTEGRATION.md`, `BLOCKSCOUT_INTEGRATION.md`, `PAYPAL_USD_INTEGRATION.md`
**Tenderly**: https://dashboard.tenderly.co

---

**Last Updated**: October 18, 2025
**Status**: Ready for deployment
**Next**: Deploy PythPriceOracle

---

*Follow this guide step-by-step to deploy all prize-eligible integrations*
