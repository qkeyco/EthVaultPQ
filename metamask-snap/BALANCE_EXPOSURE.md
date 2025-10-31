# MetaMask Snap Balance Exposure Feature

## Overview

The EthVaultPQ Snap now exposes vault account balances through the MetaMask interface, allowing users to see their vesting token balances directly in MetaMask.

## Features

### 1. Account Exposure (`pqwallet_getAccounts`)

Exposes the PQWallet address as a read-only account in MetaMask's account list.

**Usage:**
```javascript
const accounts = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: { method: 'pqwallet_getAccounts' },
  },
});

// Returns:
// [
//   {
//     address: '0x...',
//     type: 'pqwallet',
//     label: 'PQ Vault Account (Read-Only)',
//     balance: '0'
//   }
// ]
```

### 2. Balance Fetching (`pqwallet_getBalance`)

Fetches ETH or ERC-20 token balances for the PQWallet address.

**Get ETH Balance:**
```javascript
const balance = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: {
      method: 'pqwallet_getBalance',
      params: {}, // Defaults to PQWallet address
    },
  },
});

// Returns: { address: '0x...', balance: '0x...' }
```

**Get ERC-20 Token Balance (e.g., MUSDC vesting tokens):**
```javascript
const tokenBalance = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: {
      method: 'pqwallet_getBalance',
      params: {
        tokenAddress: '0x4E94A1765779fe999638d26afC71b8A049a5164d', // MUSDC on Tenderly
      },
    },
  },
});

// Returns: { address: '0x...', balance: '0x...', tokenAddress: '0x...' }
```

### 3. Balance Notifications (`pqwallet_notifyBalances`)

Send in-app notifications to users showing balance updates.

**Usage:**
```javascript
await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: {
      method: 'pqwallet_notifyBalances',
      params: {
        balance: '0x56bc75e2d63100000', // 100 tokens in hex
        tokenSymbol: 'MUSDC',
      },
    },
  },
});

// Shows notification: "Vault balance: 100.0000 MUSDC"
```

## Adding Custom Tokens to MetaMask

**Important:** Users need to manually import tokens to see them in MetaMask.

### Step 1: Get Your PQWallet Address
```javascript
const status = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: { method: 'pqwallet_getStatus' },
  },
});

console.log('PQWallet Address:', status.address);
```

### Step 2: Import Token in MetaMask

1. Open MetaMask
2. Go to "Assets" tab
3. Click "Import tokens"
4. Enter token details:
   - **Token Contract Address**: `0x4E94A1765779fe999638d26afC71b8A049a5164d` (MUSDC on Tenderly)
   - **Token Symbol**: `MUSDC`
   - **Token Decimal**: `6`
5. Click "Add Custom Token"

### Step 3: Verify Balance

Once imported, MetaMask will automatically display the token balance for your PQWallet address.

## Example: Vesting Token Workflow

```javascript
// 1. Check wallet status
const status = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: { method: 'pqwallet_getStatus' },
  },
});

if (!status.hasWallet) {
  console.log('Create wallet first using pqwallet_createWallet');
}

// 2. Get vesting token balance (MUSDC)
const balance = await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: {
      method: 'pqwallet_getBalance',
      params: {
        tokenAddress: '0x4E94A1765779fe999638d26afC71b8A049a5164d', // MUSDC
      },
    },
  },
});

console.log('Vested MUSDC balance:', balance.balance);

// 3. Send notification about balance
await ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'npm:@qkey/ethvaultpq-snap',
    request: {
      method: 'pqwallet_notifyBalances',
      params: {
        balance: balance.balance,
        tokenSymbol: 'MUSDC',
      },
    },
  },
});
```

## RPC Endpoint

The Snap uses the Tenderly Ethereum Virtual TestNet RPC:
```
https://virtual.mainnet.us-west.rpc.tenderly.co/8d34857c-35dd-4e13-b36d-2688a4377b1f
```

## Security Considerations

1. **Read-Only Access**: The exposed accounts are read-only. Users cannot sign transactions directly from MetaMask with these addresses.

2. **PQ Signatures Required**: All transactions must be signed using the Snap's `pqwallet_signTransaction` method with Dilithium3 signatures.

3. **Balance Verification**: Balances are fetched directly from the blockchain via RPC calls - no trust required.

## Permissions Required

The following permissions are needed in `snap.manifest.json`:

```json
{
  "initialPermissions": {
    "snap_notify": {},
    "endowment:network-access": {}
  }
}
```

## Next Steps

- **Import MUSDC Token**: Follow the steps above to see vesting token balances
- **Monitor Vesting**: Use `pqwallet_getVestingSchedule` to track vesting progress
- **Claim Tokens**: Use `pqwallet_signTransaction` to claim vested tokens with quantum-safe signatures

## Troubleshooting

**Q: I don't see my token balance**
A: Make sure you've imported the token in MetaMask (see "Adding Custom Tokens" above)

**Q: Balance shows 0 but I have vested tokens**
A: Check that you're using the correct token address for your network (Tenderly vs Sepolia vs Mainnet)

**Q: Can I send transactions from the exposed account?**
A: No - the account is read-only. Use `pqwallet_signTransaction` to sign with quantum-safe signatures.

## References

- [MetaMask Snaps Documentation](https://docs.metamask.io/snaps/)
- [ERC-20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EthVaultPQ Main Documentation](../README.md)
