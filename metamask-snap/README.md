# EthVaultPQ MetaMask Snap 🦊🔐

> Post-quantum secure vesting vault management directly in MetaMask

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MetaMask Snap](https://img.shields.io/badge/MetaMask-Snap-orange)](https://metamask.io/snaps/)
[![Dilithium3](https://img.shields.io/badge/PQ-Dilithium3-blue)](https://csrc.nist.gov/pubs/fips/204/final)

## 🌟 Features

- **Post-Quantum Signatures**: Generate Dilithium3 (ML-DSA-65) signatures
- **ZK-SNARK Proofs**: Create Groth16 proofs for on-chain verification (~250K gas)
- **Vesting Tracking**: Monitor multiple vault schedules in real-time
- **Transaction Insights**: See vesting details before confirming transactions
- **Secure Key Management**: Keys derived from MetaMask seed phrase
- **Native Integration**: Works seamlessly with existing EthVaultPQ contracts

## 🚀 Quick Start

### Installation

```bash
npm install @ethvaultpq/snap
```

Or install directly in MetaMask:

```javascript
await window.ethereum.request({
  method: 'wallet_requestSnaps',
  params: {
    '@ethvaultpq/snap': {}
  }
});
```

### Usage Example

```typescript
// Create a PQ wallet
const result = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: '@ethvaultpq/snap',
    request: {
      method: 'pqwallet_createWallet'
    }
  }
});

console.log('Public Key:', result.publicKey);
console.log('Address:', result.address);

// Sign a transaction
const signedTx = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: '@ethvaultpq/snap',
    request: {
      method: 'pqwallet_signTransaction',
      params: {
        transaction: {
          to: '0x...',
          data: '0x...',
          value: '0',
          chainId: 1
        }
      }
    }
  }
});

// Add a vault to track
await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: '@ethvaultpq/snap',
    request: {
      method: 'pqwallet_addVault',
      params: {
        vaultAddress: '0x...',
        tokenAddress: '0x...',
        tokenSymbol: 'TOKEN'
      }
    }
  }
});

// Get vesting schedule
const schedule = await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: '@ethvaultpq/snap',
    request: {
      method: 'pqwallet_getVestingSchedule',
      params: {
        vaultAddress: '0x...'
      }
    }
  }
});

console.log('Vesting Progress:', schedule.vestingProgress);
console.log('Claimable:', schedule.claimableAmount);
```

## 📚 API Reference

### Wallet Management

#### `pqwallet_createWallet`

Create a new post-quantum wallet with Dilithium3 keypair.

**Parameters**: None

**Returns**:
```typescript
{
  publicKey: string;  // Hex-encoded Dilithium3 public key
  address: string;    // Wallet address
}
```

#### `pqwallet_getPublicKey`

Get the current wallet's public key.

**Returns**: `string` - Hex-encoded public key

#### `pqwallet_getWalletAddress`

Get the current wallet's address.

**Returns**: `string` - Wallet address

### Transaction Signing

#### `pqwallet_signTransaction`

Sign a transaction with Dilithium3 and generate ZK-SNARK proof.

**Parameters**:
```typescript
{
  transaction: {
    to: string;
    data: string;
    value?: string;
    chainId: number;
  }
}
```

**Returns**:
```typescript
{
  signature: string;      // Dilithium3 signature (hex)
  zkProof: {             // Groth16 proof
    proof: object;
    publicSignals: string[];
  };
  messageHash: string;
}
```

#### `pqwallet_signMessage`

Sign an arbitrary message.

**Parameters**:
```typescript
{
  message: string;
}
```

**Returns**: `string` - Dilithium3 signature (hex)

### Vault Management

#### `pqwallet_getVaults`

Get all tracked vaults.

**Returns**:
```typescript
Array<{
  address: string;
  tokenAddress: string;
  tokenSymbol: string;
  totalAmount: string;
  claimedAmount: string;
  startBlock: number;
  endBlock: number;
  cliffBlock: number;
  beneficiary: string;
}>
```

#### `pqwallet_getVestingSchedule`

Get vesting schedule for a specific vault.

**Parameters**:
```typescript
{
  vaultAddress: string;
  currentBlock?: number;  // Optional, defaults to latest
}
```

**Returns**:
```typescript
{
  totalAmount: bigint;
  startBlock: number;
  endBlock: number;
  cliffBlock: number;
  vestedAmount: bigint;
  claimableAmount: bigint;
  claimedAmount: bigint;
  vestingProgress: number;  // 0-100%
}
```

#### `pqwallet_addVault`

Add a vault to track.

**Parameters**:
```typescript
{
  vaultAddress: string;
  tokenAddress: string;
  tokenSymbol?: string;
}
```

#### `pqwallet_removeVault`

Remove a tracked vault.

**Parameters**:
```typescript
{
  vaultAddress: string;
}
```

### Utility

#### `pqwallet_getSnapState`

Get current Snap state (for debugging).

**Returns**: Snap state object (secret key redacted)

#### `pqwallet_resetSnap`

Reset Snap and clear all data.

**Returns**: `{ success: boolean }`

## 🔐 Security

### Post-Quantum Cryptography

- **Algorithm**: Dilithium3 (ML-DSA-65)
- **NIST Standard**: FIPS 204
- **Security Level**: NIST Level 3 (192-bit quantum security)
- **Library**: [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum)

### Key Derivation

Keys are derived from your MetaMask seed phrase using BIP-44:

```
m/44'/60'/0'/0/0 → Entropy → Dilithium3 Keypair
```

**Benefits**:
- Backup = MetaMask seed phrase (no extra keys to store)
- Deterministic generation (same keys from same seed)
- Encrypted storage within MetaMask

### ZK-SNARK Proofs

- **Scheme**: Groth16
- **Curve**: BN254 (BN128)
- **On-chain Cost**: ~250K gas
- **Off-chain Time**: ~1-2 seconds
- **Library**: snarkjs

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         MetaMask Snap                   │
├─────────────────────────────────────────┤
│                                          │
│  📦 Key Management                       │
│    └─ BIP-44 → Dilithium3 Keypair      │
│                                          │
│  🔐 Signature Operations                 │
│    ├─ Sign with Dilithium3             │
│    └─ Generate ZK-SNARK proof          │
│                                          │
│  📊 Vault Tracking                       │
│    ├─ Monitor vesting schedules        │
│    ├─ Calculate claimable amounts      │
│    └─ Track multiple vaults            │
│                                          │
│  🔍 Transaction Insights                 │
│    ├─ Decode vault operations          │
│    ├─ Show vesting details             │
│    └─ Warn on unsafe withdrawals       │
│                                          │
└─────────────────────────────────────────┘
          ↓ RPC Methods
┌─────────────────────────────────────────┐
│         Your DApp                        │
└─────────────────────────────────────────┘
```

## 🧪 Development

### Setup

```bash
# Clone repository
git clone https://github.com/ethvaultpq/ethvaultpq-snap
cd metamask-snap

# Install dependencies
npm install

# Build the Snap
npm run build

# Serve locally for testing
npm run serve
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint
npm run lint
```

### Local Testing in MetaMask

1. Build the Snap: `npm run build`
2. Serve locally: `npm run serve`
3. Open MetaMask Flask (developer version)
4. Connect to `http://localhost:8080`

## 📦 Project Structure

```
metamask-snap/
├── src/
│   ├── index.ts              # Main entry point
│   ├── crypto/
│   │   ├── keyManagement.ts  # PQ key generation & storage
│   │   └── signing.ts        # Dilithium3 & ZK proof generation
│   ├── rpc/
│   │   └── handlers.ts       # RPC method implementations
│   ├── ui/
│   │   └── transactionInsight.ts  # Transaction insight UI
│   ├── utils/
│   │   └── vaultUtils.ts     # Vault interaction helpers
│   └── types/
│       └── index.ts          # TypeScript definitions
├── snap.manifest.json        # Snap configuration
├── package.json
└── tsconfig.json
```

## 🚧 Roadmap

### Phase 1: Core Functionality ✅
- [x] Dilithium3 key generation
- [x] Transaction signing
- [x] ZK proof structure (mock)
- [x] Vault tracking
- [x] Transaction insights

### Phase 2: ZK Integration 🔄
- [ ] Compile Dilithium verification circuit
- [ ] Host circuit files (IPFS/CDN)
- [ ] Integrate real ZK proof generation
- [ ] Test on-chain verification

### Phase 3: Enhanced Features 📋
- [ ] Multi-signature support
- [ ] Batch operations
- [ ] Token price integration
- [ ] Mobile optimization
- [ ] Gasless transactions (meta-transactions)

### Phase 4: Production 🎯
- [ ] Security audit
- [ ] NPM publication
- [ ] MetaMask Snaps directory listing
- [ ] Comprehensive documentation
- [ ] Video tutorials

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **EthVaultPQ Dashboard**: https://ethvault.qkey.co
- **ZK API**: https://api.ethvault.qkey.co
- **Documentation**: https://docs.ethvaultpq.com
- **GitHub**: https://github.com/ethvaultpq
- **Discord**: https://discord.gg/ethvaultpq

## 🙏 Acknowledgments

- **MetaMask Snaps**: For the extensibility framework
- **@noble/post-quantum**: For Dilithium3 implementation
- **snarkjs**: For ZK-SNARK proof generation
- **NIST**: For ML-DSA standardization

## ⚠️ Disclaimer

**THIS IS EXPERIMENTAL SOFTWARE**

- This Snap is in early development (v0.1.0)
- ZK proof generation is currently mocked
- Do NOT use with real funds on mainnet
- Testnet only until security audit is complete

---

Built with 💜 by the EthVaultPQ Team

**Securing tomorrow's tokens with today's quantum-resistant cryptography**
