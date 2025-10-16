# Post-Quantum Wallet Vault Setup Guide

## Project Overview
Ethereum post-quantum wallet vault implementing:
- **ERC-4337**: Account Abstraction (smart contract wallets)
- **ERC-4626**: Tokenized Vault Standard (vesting/payment system)
- **Post-Quantum Cryptography**: Future-proof security

---

## Initial Repository Structure

```
pq-wallet-vault/
├── contracts/                    # Solidity contracts
│   ├── core/
│   │   ├── PQWalletFactory.sol  # AA wallet factory
│   │   ├── PQWallet.sol         # Main wallet implementation
│   │   └── PQValidator.sol      # Post-quantum signature validator
│   ├── vault/
│   │   ├── PQVault4626.sol      # ERC-4626 tokenized vault
│   │   ├── VestingManager.sol   # Time-locked vesting
│   │   └── PaymentStream.sol    # Streaming payments
│   ├── interfaces/
│   │   ├── IPQWallet.sol
│   │   ├── IPQValidator.sol
│   │   └── IERC4626.sol         # If not using OpenZeppelin
│   └── libraries/
│       ├── PQCrypto.sol         # Post-quantum crypto helpers
│       └── VaultMath.sol        # 4626 math utilities
├── test/                         # Foundry tests
│   ├── PQWallet.t.sol
│   ├── PQVault4626.t.sol
│   ├── VestingManager.t.sol
│   └── integration/
│       └── E2E.t.sol
├── script/                       # Deployment scripts
│   ├── Deploy.s.sol
│   └── DeployTestnet.s.sol
├── dashboard/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletCreator.tsx
│   │   │   ├── VaultManager.tsx
│   │   │   ├── VestingDashboard.tsx
│   │   │   └── PaymentStreams.tsx
│   │   ├── hooks/
│   │   │   ├── usePQWallet.ts
│   │   │   ├── useVault.ts
│   │   │   └── useVesting.ts
│   │   ├── config/
│   │   │   └── networks.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── lib/                          # Git submodules
│   ├── forge-std/               # Foundry testing
│   ├── openzeppelin-contracts/  # OZ for ERC-4626
│   └── account-abstraction/     # ERC-4337 reference
├── foundry.toml
├── package.json
├── .gitignore
├── CLAUDE.md                     # AI development rules
└── README.md
```

---

## Technology Stack

### Smart Contracts
- **Solidity**: ^0.8.23
- **Foundry**: Primary development framework
  - `forge build` - Compile contracts
  - `forge test` - Run tests
  - `forge script` - Deploy contracts
- **OpenZeppelin**: v5.0.0+ (ERC-4626, access control)
- **ERC-4337**: Account abstraction standard
  - EntryPoint contract (v0.7.0)
  - UserOperation handling
  - Paymaster support

### Frontend
- **React**: 18.2.0+
- **TypeScript**: 5.0+
- **Vite**: 5.0+ (MUST use port 5173)
- **wagmi**: 2.x (Web3 hooks)
- **viem**: 2.x (Ethereum interactions)
- **RainbowKit** or **ConnectKit**: Wallet connection UI
- **TailwindCSS**: Styling

### Post-Quantum Cryptography
- **SPHINCS+**: Stateless hash-based signatures (NIST standard)
- **Dilithium**: Lattice-based signatures (NIST standard)
- **Kyber**: Key encapsulation (future use)
- **Implementation**: Off-chain PQ signing, on-chain verification via precompiles or libraries

### Testing & Development
- **Foundry**: Unit & integration tests
- **Hardhat** (optional): For tasks automation
- **Tenderly**: Simulation & debugging
- **BaseScan**: Contract verification

---

## Initial Dependencies

### Root `package.json`
```json
{
  "name": "pq-wallet-vault",
  "version": "0.1.0",
  "description": "Post-quantum secure wallet vault with ERC-4337 and ERC-4626",
  "scripts": {
    "build": "forge build",
    "test": "forge test",
    "test:gas": "forge test --gas-report",
    "deploy:testnet": "forge script script/DeployTestnet.s.sol --rpc-url base-sepolia --broadcast --verify",
    "dashboard": "cd dashboard && npm run dev",
    "lint": "solhint 'contracts/**/*.sol'",
    "format": "forge fmt"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "hardhat": "^2.19.0",
    "solhint": "^4.0.0"
  }
}
```

### Dashboard `package.json`
```json
{
  "name": "pq-wallet-dashboard",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wagmi": "^2.5.0",
    "viem": "^2.7.0",
    "@tanstack/react-query": "^5.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.0",
    "vite": "^5.0.0"
  }
}
```

### `foundry.toml`
```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc_version = "0.8.23"
optimizer = true
optimizer_runs = 200
via_ir = false
evm_version = "paris"

[profile.test]
verbosity = 2
gas_reports = ["*"]

[profile.production]
optimizer = true
optimizer_runs = 1000000
via_ir = true

[rpc_endpoints]
base-sepolia = "${BASE_SEPOLIA_RPC_URL}"
base = "${BASE_MAINNET_RPC_URL}"

[etherscan]
base-sepolia = { key = "${BASESCAN_API_KEY}" }
base = { key = "${BASESCAN_API_KEY}" }
```

---

## Network Configuration

### Dashboard `config/networks.ts`
```typescript
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // ERC-4337 v0.6
    pqWalletFactory: '0x...', // Deploy and fill in
    pqVault: '0x...', // Deploy and fill in
  },
  faucets: {
    eth: 'https://www.coinbase.com/faucets/base-ethereum-goerli-faucet',
  },
};

export const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  contracts: {
    entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    pqWalletFactory: '0x...',
    pqVault: '0x...',
  },
};
```

---

## Environment Setup

### `.env.example`
```bash
# NEVER commit actual .env file!
# Copy this to .env and fill in your values

# RPC URLs (get from Alchemy, Infura, or use public)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Block explorer API key (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key_here

# IMPORTANT: NEVER put private keys in .env!
# Use hardware wallet or MetaMask for all deployments
# This is for reference only:
# DEPLOYER_PRIVATE_KEY=  # ❌ DO NOT USE

# Dashboard (optional overrides)
VITE_NETWORK=testnet  # or 'mainnet'
```

### `.gitignore`
```
# Compiler output
out/
cache/
artifacts/

# Environment files
.env
.env.local
.env.production

# Dependencies
node_modules/
dashboard/node_modules/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Foundry
cache_hardhat/
broadcast/

# Local deployment records
deployments/local/
.openzeppelin/
```

---

## Git Setup

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: PQ Wallet Vault setup"

# Add Foundry dependencies as submodules
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install eth-infinitism/account-abstraction --no-commit

git add .
git commit -m "Add Foundry dependencies"

# Create develop branch
git checkout -b develop
```

---

## Quick Start Commands

```bash
# 1. Install Foundry dependencies
forge install

# 2. Install dashboard dependencies
cd dashboard
npm install
cd ..

# 3. Build contracts
forge build

# 4. Run tests
forge test

# 5. Start dashboard (ALWAYS port 5173)
cd dashboard
npm run dev
# Opens at http://localhost:5173

# 6. Deploy to testnet (via MetaMask through dashboard)
# Or use Foundry script with hardware wallet:
forge script script/DeployTestnet.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  --ledger  # Use hardware wallet
```

---

## Key Design Principles

### 1. ERC-4337 Architecture
```
User → Frontend → UserOperation → Bundler → EntryPoint → PQWallet
                                                          ↓
                                                    PQValidator
                                                    (verify PQ sig)
```

### 2. ERC-4626 Vault Architecture
```
Depositor → deposit() → PQVault4626 → mint shares
                           ↓
                      Vesting Schedule
                           ↓
                      withdraw() → redeem shares
```

### 3. Post-Quantum Security
```
Off-chain:
- User signs with SPHINCS+/Dilithium
- Generate PQ signature

On-chain:
- PQValidator.validate(signature, message)
- Use precompiles or optimized Solidity verification
- Return valid/invalid to EntryPoint
```

---

## Development Workflow

1. **Write Contracts**: Use Foundry in `contracts/`
2. **Write Tests**: Use Foundry tests in `test/`
3. **Deploy to Testnet**: Use dashboard or Foundry scripts
4. **Build Dashboard**: React components in `dashboard/src/`
5. **Test Integration**: Full E2E testing on Base Sepolia
6. **Audit**: External security audit before mainnet
7. **Deploy Mainnet**: Via multisig + hardware wallet

---

## Compatibility with OPO Stack

### Shared Patterns
- ✅ React dashboard with MetaMask signing
- ✅ wagmi + viem for Web3 interactions
- ✅ Foundry for contract development
- ✅ Port 5173 for dashboard
- ✅ No private keys in files
- ✅ Step-by-step deployment UI
- ✅ Base Sepolia → Base Mainnet progression

### Differences
- Uses ERC-4337 (account abstraction) instead of Token-2022
- Uses ERC-4626 (tokenized vaults) for vesting
- Post-quantum signature validation
- Payment streaming instead of lottery mechanics

---

## Security Checklist

### Smart Contracts
- [ ] External audit by reputable firm
- [ ] Formal verification of critical functions
- [ ] Reentrancy guards on all state-changing functions
- [ ] Access control on admin functions
- [ ] Emergency pause mechanism
- [ ] Upgrade path (UUPS proxy or similar)
- [ ] Gas optimization for UserOperations
- [ ] PQ signature verification tested extensively

### Frontend
- [ ] No private keys stored
- [ ] All transactions via MetaMask/wallet
- [ ] Input validation on all forms
- [ ] Rate limiting on bundler submissions
- [ ] Clear error messages
- [ ] Transaction simulation before submission

### Deployment
- [ ] Multisig for contract ownership
- [ ] Timelocks on critical functions
- [ ] Gradual rollout (testnet → small mainnet → full mainnet)
- [ ] Bug bounty program
- [ ] Incident response plan

---

## Resources

### ERC-4337 (Account Abstraction)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [eth-infinitism/account-abstraction](https://github.com/eth-infinitism/account-abstraction)
- [Alchemy AA SDK](https://github.com/alchemyplatform/aa-sdk)

### ERC-4626 (Tokenized Vaults)
- [EIP-4626 Specification](https://eips.ethereum.org/EIPS/eip-4626)
- [OpenZeppelin ERC4626](https://docs.openzeppelin.com/contracts/5.x/erc4626)

### Post-Quantum Cryptography
- [NIST PQC Standards](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [SPHINCS+ Specification](https://sphincs.org/)
- [Dilithium Specification](https://pq-crystals.org/dilithium/)

### Development Tools
- [Foundry Book](https://book.getfoundry.sh/)
- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [Base Documentation](https://docs.base.org/)

---

## Next Steps

1. **Clone this setup** into your new repository
2. **Initialize Foundry**: `forge init --force`
3. **Install dependencies**: See Quick Start Commands above
4. **Read CLAUDE.md**: Understand AI development patterns
5. **Start with PQWallet.sol**: Core wallet implementation
6. **Build PQValidator.sol**: Post-quantum signature verification
7. **Implement ERC-4626 vault**: Tokenized vault for vesting
8. **Create dashboard**: React UI for wallet creation and management
9. **Test extensively**: Unit, integration, and E2E tests
10. **Deploy to Base Sepolia**: Test in production-like environment

---

## Support

- **Base Discord**: [https://discord.gg/base](https://discord.gg/base)
- **Foundry Telegram**: [https://t.me/foundry_rs](https://t.me/foundry_rs)
- **ERC-4337 Discord**: [https://discord.gg/account-abstraction](https://discord.gg/account-abstraction)

---

Good luck building! 🚀
