# Tenderly Deployment Guide

## Overview

This guide walks through deploying EthVaultPQ to Tenderly Virtual TestNets for testing and simulation.

## Why Tenderly?

- **Virtual TestNets**: Fork any network (Ethereum mainnet, Base, etc.) with unlimited ETH
- **Transaction Simulation**: Test transactions before sending to real networks
- **Debugging**: Advanced debugging tools with detailed transaction traces
- **Gas Profiling**: Detailed gas usage analysis
- **Web3 Actions**: Automated responses to on-chain events
- **No Faucets Needed**: Unlimited test ETH

## Prerequisites

1. **Tenderly Account**: Sign up at [dashboard.tenderly.co](https://dashboard.tenderly.co/)
2. **Tenderly CLI** (optional):
   ```bash
   npm install -g @tenderly/cli
   tenderly login
   ```

## Setup Steps

### 1. Create a Virtual TestNet

1. Go to [Tenderly Dashboard](https://dashboard.tenderly.co/)
2. Navigate to "Virtual TestNets" in the sidebar
3. Click "Create Virtual TestNet"
4. Choose network to fork:
   - **Ethereum Mainnet** (for maximum compatibility)
   - **Base** (for Base-specific features)
   - **Sepolia** (for testnet-like environment)
5. Name it: `EthVaultPQ-TestNet`
6. Enable "Unlimited Balance" for test accounts
7. Click "Create"

### 2. Get Your Virtual TestNet RPC URL

From your Virtual TestNet page:
- Copy the RPC URL (looks like: `https://virtual.mainnet.rpc.tenderly.co/...`)
- This is your `TENDERLY_RPC_URL`

### 3. Configure Environment

Add to your `.env` file:

```bash
# Tenderly Configuration
TENDERLY_RPC_URL=https://virtual.mainnet.rpc.tenderly.co/YOUR_ID_HERE
TENDERLY_ACCOUNT_ID=your-account-id
TENDERLY_PROJECT=ethvaultpq
TENDERLY_ACCESS_KEY=your-access-key

# Use the same deployer key as testnet
PRIVATE_KEY=your_private_key_here
```

### 4. Deploy to Tenderly

```bash
# Deploy using Foundry
forge script script/DeployTenderly.s.sol \
  --rpc-url $TENDERLY_RPC_URL \
  --broadcast \
  --slow

# Or use environment variable directly
forge script script/DeployTenderly.s.sol \
  --rpc-url https://virtual.mainnet.rpc.tenderly.co/YOUR_ID \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### 5. Verify Contracts (Optional)

Using Tenderly CLI:

```bash
# Initialize Tenderly in project
tenderly init

# Push contracts to Tenderly
tenderly push
```

Or manually in Tenderly Dashboard:
1. Go to "Contracts" tab
2. Click "Add Contract"
3. Paste contract address and ABI

## Dashboard Configuration

Update `dashboard/src/config/networks.ts`:

```typescript
export const TENDERLY_VIRTUAL_TESTNET = {
  chainId: 1, // Or whatever chain ID your fork uses
  name: 'Tenderly Virtual TestNet',
  rpcUrl: process.env.VITE_TENDERLY_RPC_URL || 'https://virtual.mainnet.rpc.tenderly.co/...',
  blockExplorer: 'https://dashboard.tenderly.co/explorer/vnet/YOUR_ID',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    pqWalletFactory: '0x...', // From deployment output
    pqValidator: '0x...',
    pqVault: '0x...',
    mockToken: '0x...',
  },
};
```

Update `dashboard/.env.local`:

```bash
VITE_TENDERLY_RPC_URL=https://virtual.mainnet.rpc.tenderly.co/YOUR_ID
VITE_NETWORK=tenderly
```

## MetaMask Setup

1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Fill in:
   - **Network Name**: Tenderly Virtual TestNet
   - **RPC URL**: Your Tenderly RPC URL
   - **Chain ID**: 1 (or your fork's chain ID)
   - **Currency Symbol**: ETH
4. Save and switch to this network

## Testing Features

### 1. Transaction Simulation

Before sending transactions:

```bash
# Simulate transaction via Tenderly API
curl https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_ID}/project/${TENDERLY_PROJECT}/simulate \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Access-Key: ${TENDERLY_ACCESS_KEY}" \
  -d '{
    "network_id": "1",
    "from": "0x...",
    "to": "0x...",
    "input": "0x...",
    "gas": 21000,
    "value": "0"
  }'
```

### 2. Debugging Transactions

1. Go to Tenderly Dashboard
2. Navigate to your Virtual TestNet
3. Click "Transactions" tab
4. Click on any transaction
5. View detailed trace, gas usage, state changes

### 3. Fork Mainnet State

Your Virtual TestNet can interact with real mainnet contracts:

```solidity
// Example: Interact with real Uniswap on forked mainnet
IUniswapV2Router router = IUniswapV2Router(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
// This will work on Tenderly fork!
```

### 4. Time Travel

Fast-forward time for vesting tests:

```bash
# Increase block timestamp by 30 days (2592000 seconds)
curl https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_ID}/project/${TENDERLY_PROJECT}/vnets/${VNET_ID}/admin/increase-time \
  -X POST \
  -H "X-Access-Key: ${TENDERLY_ACCESS_KEY}" \
  -d '{"time": 2592000}'
```

## Useful Tenderly Features

### Gas Profiling

1. Deploy contract
2. Execute transactions
3. View "Gas Profiler" in transaction details
4. Identify expensive operations
5. Optimize contracts

### Web3 Actions

Automate responses to events:

```javascript
// Example: Auto-process vesting withdrawals
module.exports.actionFn = async (context, event) => {
  const { userAddress } = event;

  // Check if vesting is ready
  const vestedAmount = await vault.getVestedAmount(userAddress);

  if (vestedAmount > 0) {
    // Auto-withdraw
    await vault.withdrawVested(vestedAmount);
  }
};
```

### State Overrides

Modify contract state for testing:

```bash
# Set mock token balance
tenderly devnet call \
  --to 0xMOCK_TOKEN_ADDRESS \
  --data "0x..." \
  --state-overrides '{"0xYOUR_ADDRESS": {"balance": "1000000000000000000000"}}'
```

## Deployment Checklist

- [ ] Create Tenderly Virtual TestNet
- [ ] Copy RPC URL to `.env`
- [ ] Deploy contracts with `DeployTenderly.s.sol`
- [ ] Verify contract addresses in Tenderly Dashboard
- [ ] Update `dashboard/src/config/networks.ts` with contract addresses
- [ ] Add Virtual TestNet to MetaMask
- [ ] Test wallet creation in dashboard
- [ ] Test vault deposits with time travel
- [ ] Review transaction traces in Tenderly

## Common Issues

### Issue: "Invalid Chain ID"

**Solution**: Check that your Virtual TestNet chain ID matches MetaMask configuration.

### Issue: "Insufficient Funds"

**Solution**: Use Tenderly's "Fund Account" feature in the Dashboard to add unlimited test ETH.

### Issue: "Contract Not Verified"

**Solution**: Run `tenderly push` or manually verify in Tenderly Dashboard.

### Issue: "Transaction Reverts"

**Solution**: Use Tenderly's debugger to see exact revert reason and state changes.

## Resources

- [Tenderly Documentation](https://docs.tenderly.co/)
- [Virtual TestNets Guide](https://docs.tenderly.co/virtual-testnets/virtual-testnets)
- [Tenderly CLI Reference](https://github.com/Tenderly/tenderly-cli)
- [Web3 Actions Guide](https://docs.tenderly.co/web3-actions/intro-to-web3-actions)

## Cost

- **Free Tier**:
  - Unlimited virtual testnet usage
  - Up to 100 simulations/month
  - Basic debugging features

- **Developer Tier** ($25/month):
  - Unlimited simulations
  - Advanced debugging
  - Web3 Actions
  - Team collaboration

## Next Steps

1. Deploy to Tenderly Virtual TestNet
2. Test all wallet and vault functionality
3. Use simulation to test edge cases
4. Profile gas usage and optimize
5. Deploy to Base Sepolia for public testing
6. Finally, deploy to Base Mainnet

---

**Note**: Tenderly Virtual TestNets are perfect for:
- Rapid prototyping
- Integration testing
- Debugging complex interactions
- Gas optimization
- Pre-deployment testing

All without needing faucets or waiting for block confirmations!
