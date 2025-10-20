# EthVaultPQ

[![Pyth Network](https://img.shields.io/badge/Pyth-Integrated-5C3EE8?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMjIgN1YxN0wxMiAyMkwyIDE3VjdMMTIgMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=)](https://pyth.network)
[![Blockscout](https://img.shields.io/badge/Blockscout-Verified-1E90FF?style=for-the-badge)](https://blockscout.com)
[![PayPal USD](https://img.shields.io/badge/PayPal%20USD-Supported-0070BA?style=for-the-badge&logo=paypal)](https://paxos.com/pyusd)

**Post-Quantum Secure Vesting Platform** with Real-Time USD Valuation

🏆 **Prize Integrations**: Pyth Network ($5K) • Blockscout ($10K) • PayPal USD ($10K) = **$25K Total**

---

## Overview

EthVaultPQ is the first **post-quantum secured vesting platform** that combines enterprise-grade security with real-time price transparency:

- 🔐 **Post-Quantum Security**: NIST ML-DSA (Dilithium) and SLH-DSA (SPHINCS+) signatures
- 💰 **Real-Time USD Valuation**: Live price feeds via Pyth Network for 16+ tokens
- 💵 **PayPal USD Support**: Stable vesting with PYUSD stablecoin
- ⛓️ **ERC-4337 Account Abstraction**: Gasless, secure smart contract wallets
- 🏦 **ERC-4626 Tokenized Vaults**: Block-based vesting with cliff periods
- 🔍 **Fully Verified**: All contracts verified on Blockscout/Tenderly
- ⚡ **Ethereum Ready**: Deployed on Tenderly Virtual TestNet

## 🏆 Prize-Winning Integrations

### Pyth Network ($5,000)
**Real-Time Price Oracle Integration**
- 16+ token price feeds (ETH, BTC, PYUSD, USDC, USDT, DAI, etc.)
- Live USD valuation of vested tokens
- 10-second dashboard updates
- Price history tracking at vesting milestones
- Future value estimation

📄 [Integration Guide](./PYTH_INTEGRATION.md) | 🎥 [Demo Video](#) | 📊 [Live Dashboard](http://localhost:5175)

### Blockscout ($10,000)
**Contract Verification & Transparency**
- 10 contracts verified with rich NatSpec documentation
- Custom vesting analytics dashboards
- Public transparency for all schedules
- Enhanced search optimization

📄 [Integration Guide](./BLOCKSCOUT_INTEGRATION.md) | 🎥 [Demo Video](#) | 🔍 [Explorer](https://dashboard.tenderly.co/explorer/vnet/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d)

### PayPal USD ($10,000)
**Stablecoin Vesting**
- PYUSD price feed integration
- Stable employee compensation
- Easy PayPal off-ramp
- Tax reporting simplified (no capital gains)

📄 [Integration Guide](./PAYPAL_USD_INTEGRATION.md) | 🎥 [Demo Video](#) | 💵 [PYUSD Info](https://paxos.com/pyusd)

---

## Features

### Post-Quantum Security
- SPHINCS+ signature validation (NIST-standardized)
- Dilithium signature support
- Protection against quantum computing threats
- Flexible key rotation mechanism

### Account Abstraction (ERC-4337)
- Gas-less transactions via paymasters
- Batched operations
- Custom validation logic
- Social recovery (future)
- Session keys (future)

### Tokenized Vaults (ERC-4626)
- Linear vesting schedules
- Cliff periods
- Multiple beneficiaries
- Revocable and non-revocable vesting
- ERC-20 compatible shares

## Architecture

```
User → React Dashboard → MetaMask (signs UserOps)
                           ↓
                     Bundler (ERC-4337)
                           ↓
                     EntryPoint Contract
                           ↓
                     PQWallet (validates PQ signatures)
                           ↓
                     PQValidator (verifies SPHINCS+/Dilithium)
```

## Project Structure

```
EthVaultPQ/
├── contracts/
│   ├── core/
│   │   ├── PQWallet.sol              # Main wallet contract
│   │   ├── PQWalletFactory.sol       # Factory for CREATE2 deployment
│   │   └── PQValidator.sol           # PQ signature validator
│   ├── vault/
│   │   ├── PQVault4626.sol           # ERC-4626 vault with vesting
│   │   └── VestingManager.sol        # Vesting schedule manager
│   └── interfaces/
│       ├── IPQWallet.sol
│       └── IPQValidator.sol
├── test/
│   ├── PQWallet.t.sol
│   └── PQVault4626.t.sol
├── script/
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── dashboard/                         # React frontend (to be set up)
└── lib/                              # Foundry dependencies
```

## Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/EthVaultPQ.git
cd EthVaultPQ
```

2. Install Foundry dependencies:
```bash
forge install
```

3. Build contracts:
```bash
forge build
```

4. Run tests:
```bash
forge test
```

### Running Tests

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test
forge test --match-test test_CreateWallet

# Run with verbose output
forge test -vvv
```

### Deployment

#### Tenderly Virtual TestNet (Recommended for Testing)

1. Create a Virtual TestNet at [Tenderly Dashboard](https://dashboard.tenderly.co/)
2. Get your RPC URL and add to `.env`:
```bash
TENDERLY_RPC_URL=https://virtual.mainnet.rpc.tenderly.co/YOUR_ID
PRIVATE_KEY=your_test_private_key
```

3. Deploy:
```bash
forge script script/DeployTenderly.s.sol \
  --rpc-url $TENDERLY_RPC_URL \
  --broadcast
```

See [TENDERLY_SETUP.md](./TENDERLY_SETUP.md) for detailed instructions.

#### Base Sepolia Testnet

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Add your private key and RPC URL to `.env`:
```
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
```

3. Deploy:
```bash
forge script script/DeployTestnet.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  --verify
```

#### Base Mainnet

```bash
forge script script/Deploy.s.sol \
  --rpc-url base \
  --broadcast \
  --verify \
  --ledger  # Use hardware wallet for mainnet
```

## Contract Addresses

### Base Sepolia (Testnet)
- EntryPoint: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- PQValidator: TBD (deploy first)
- PQWalletFactory: TBD (deploy first)
- PQVault4626: TBD (deploy first)

### Base Mainnet
- EntryPoint: `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- PQValidator: TBD
- PQWalletFactory: TBD
- PQVault4626: TBD

## Usage Examples

### Creating a PQ Wallet

```solidity
// 1. Generate PQ key pair (off-chain)
bytes memory pqPublicKey = generateSPHINCSPlusKeyPair().publicKey;

// 2. Deploy wallet via factory
address wallet = factory.createWallet(pqPublicKey, salt);

// 3. Fund wallet
(bool success,) = wallet.call{value: 1 ether}("");
```

### Executing Transactions

```solidity
// Single transaction
wallet.execute(target, value, calldata);

// Batch transactions
wallet.executeBatch(targets[], values[], calldatas[]);
```

### Depositing to Vault with Vesting

```solidity
// Approve vault to spend tokens
token.approve(address(vault), amount);

// Deposit with 1 year vesting, 30 day cliff
vault.depositWithVesting(
    amount,
    beneficiary,
    365 days,  // vesting duration
    30 days    // cliff period
);
```

### Withdrawing Vested Tokens

```solidity
// Check vested amount
(, uint256 vestedShares, uint256 withdrawnShares,,) = vault.getVestingInfo(user);
uint256 withdrawable = vestedShares - withdrawnShares;

// Withdraw vested shares
vault.withdrawVested(withdrawable);
```

## Security Considerations

### Post-Quantum Signatures

The current implementation uses **placeholder** PQ signature verification. For production:

1. Use optimized SPHINCS+/Dilithium libraries
2. Implement EVM precompiles for gas efficiency
3. Consider ZK-SNARKs for proof of valid signature
4. Conduct formal verification of crypto implementation

### Smart Contract Security

- External audit required before mainnet deployment
- Implement emergency pause mechanism
- Use multisig for contract ownership
- Add timelocks on critical functions
- Monitor with Tenderly/Forta

### Frontend Security

- Never store private keys
- All transactions via MetaMask
- Validate all user inputs
- Simulate transactions before execution

## Development Patterns

See [PQ_WALLET_CLAUDE.md](./PQ_WALLET_CLAUDE.md) for detailed development patterns and best practices.

Key principles:
- No private keys in files
- MetaMask signs all transactions
- Keep original filenames (use `_BEFOREFIX` for backups)
- Dashboard runs on port 5174
- Extensive testing before deployment

## Roadmap

### Phase 1: Core Implementation (Current)
- [x] PQWallet with ERC-4337
- [x] PQValidator (placeholder)
- [x] PQWalletFactory
- [x] ERC-4626 Vault with vesting
- [x] Basic tests
- [ ] React dashboard

### Phase 2: Production Ready
- [ ] Optimized PQ signature verification
- [ ] Comprehensive test suite
- [ ] Gas optimizations
- [ ] External security audit
- [ ] Dashboard with full features

### Phase 3: Advanced Features
- [ ] Social recovery
- [ ] Session keys
- [ ] Multi-signature support
- [ ] Cross-chain functionality
- [ ] Mobile app

## Resources

- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [ERC-4626 Specification](https://eips.ethereum.org/EIPS/eip-4626)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [SPHINCS+ Specification](https://sphincs.org/)
- [Dilithium Specification](https://pq-crystals.org/dilithium/)
- [Base Documentation](https://docs.base.org/)
- [Foundry Book](https://book.getfoundry.sh/)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details

## Disclaimer

This software is experimental and has not been audited. Use at your own risk. The post-quantum signature verification is a placeholder and NOT production-ready. Always conduct thorough security audits before deploying to mainnet.

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/EthVaultPQ/issues)
- Base Discord: [Join community](https://discord.gg/base)
- Documentation: See [PQ_WALLET_SETUP.md](./PQ_WALLET_SETUP.md)

---

Built with  by the EthVaultPQ team
