# EthVaultPQ - Complete Technology Stack

## 📋 Overview
EthVaultPQ is a post-quantum cryptographic smart contract protocol built with modern blockchain and web technologies.

---

## 🔗 Smart Contracts (Backend)

### **Language**
- **Solidity** v0.8.28 - Smart contract programming language

### **Framework & Tools**
- **Foundry** - Smart contract development framework
  - `forge` - Build, test, and deploy
  - `cast` - Ethereum RPC calls
  - `anvil` - Local Ethereum node
- **Slither** - Static analysis tool
- **Tenderly** - Virtual TestNet and debugging

### **Libraries**
- **OpenZeppelin Contracts** v5.4.0
  - ERC-4337 Account Abstraction
  - ERC-4626 Tokenized Vaults
  - ERC-20 Token Standard
  - Access Control (Ownable, Pausable)
  - Security (ReentrancyGuard)

### **Cryptography**
- **Post-Quantum Algorithms**
  - **NIST ML-DSA** (Dilithium) - Digital signatures
  - **NIST SLH-DSA** (SPHINCS+) - Hash-based signatures
  - Support for 9 NIST-approved parameter sets
- **ZK-SNARKs**
  - **Groth16** - ZK proof verification
  - Used for Dilithium signature verification

---

## 🌐 Dashboard (Frontend)

### **Core Framework**
- **React** v18.2.0 - UI library
- **TypeScript** v5.2.0 - Type-safe JavaScript
- **Vite** v5.0.0 - Build tool and dev server

### **Styling**
- **TailwindCSS** v3.3.6 - Utility-first CSS framework
- **PostCSS** v8.4.32 - CSS processor
- **Autoprefixer** v10.4.16 - CSS vendor prefixing

### **Web3 Libraries**
- **wagmi** v2.5.0 - React hooks for Ethereum
- **viem** v2.7.0 - TypeScript Ethereum library
- **RainbowKit** v2.0.0 - Wallet connection UI
- **TanStack Query** v5.0.0 - Data fetching and caching

### **Routing**
- **React Router** v6.20.0 - Client-side routing

---

## 🧪 Testing Frameworks

### **Unit Testing**
- **Vitest** v3.2.4 - Fast unit test framework
- **@testing-library/react** v16.3.0 - React component testing
- **@testing-library/jest-dom** v6.9.1 - DOM matchers
- **@testing-library/user-event** v14.6.1 - User interaction simulation
- **jsdom** v26.1.0 - DOM environment for Node.js

**Test Coverage:**
- 33 unit tests (29 passing)
- Tests for VestingSchema validation
- Tests for time conversion utilities
- Tests for JSON import/export

### **E2E Testing**
- **Playwright** v1.56.1 - Browser automation
- **@axe-core/playwright** v4.10.2 - Accessibility testing

**Test Coverage:**
- 40 E2E tests across 3 suites
- Multi-browser (Chrome, Firefox, Safari, Mobile)
- Navigation testing
- Vesting builder testing
- Import/export testing

### **Smart Contract Testing**
- **Foundry Test Suite** - 61 unit tests
- Gas optimization tests
- Security vulnerability tests
- ERC-4337 compliance tests

---

## 🛠️ Development Tools

### **Linting & Formatting**
- **ESLint** v6.0.0 - JavaScript linter
- **@typescript-eslint** v6.0.0 - TypeScript ESLint rules

### **Build Tools**
- **@vitejs/plugin-react** v4.2.0 - React plugin for Vite
- **tsc** - TypeScript compiler

### **Package Management**
- **npm** - Node package manager

---

## 🔐 Blockchain Infrastructure

### **Networks**
- **Tenderly Ethereum Virtual TestNet** (Primary)
  - Ethereum mainnet fork
  - Full simulation and debugging
  - No gas costs
- **Sepolia Testnet** (Future)
- **Ethereum Mainnet** (Future - after audit)

### **Node**
- **Node.js** v18.20.8

### **Smart Contract Deployment**
- **EntryPoint v0.7** - `0x0000000071727De22E5E9d8BAf0edAc6f37da032`
- **Deployed Contracts (Tenderly)**:
  - ZKVerifier
  - PQValidator
  - PQWalletFactory
  - MockToken (MUSDC)
  - PQVault4626
  - PQVault4626Demo (60x acceleration)
  - ZKProofOracle
  - QRNGOracle

---

## 📦 Project Structure

```
EthVaultPQ/
├── contracts/              # Solidity smart contracts
│   ├── wallet/            # ERC-4337 PQ wallets
│   ├── vault/             # ERC-4626 vesting vaults
│   ├── libraries/         # ZK verifiers, validators
│   └── oracles/           # ZK proof + QRNG oracles
├── dashboard/             # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── config/        # Network and contract config
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── tests/
│   │   ├── unit/          # Vitest unit tests
│   │   └── e2e/           # Playwright E2E tests
│   └── templates/         # Vesting JSON templates
├── script/                # Deployment scripts
└── test/                  # Foundry tests
```

---

## 🎯 Key Features Built

### **1. Vesting System**
- JSON schema specification (v1.0.0)
- Block-based vesting (12s Ethereum blocks)
- Multi-recipient support
- Test mode (60x acceleration)
- Past-date catch-up vesting
- Import/export functionality
- 4 preset templates

### **2. Wallet Management**
- Post-quantum secure wallets
- ERC-4337 account abstraction
- Multiple verification modes

### **3. Developer Tools**
- Test runner interface
- Network diagnostics
- Block time measurement
- Contract validation
- Vesting calculator
- Live block number display

### **4. Testing Infrastructure**
- Comprehensive unit tests
- Multi-browser E2E tests
- CI/CD with GitHub Actions
- HTML/JSON test reports

---

## 🚀 Development Workflow

### **Local Development**
```bash
# Smart contracts
cd contracts
forge build
forge test

# Dashboard
cd dashboard
npm run dev           # Start dev server
npm run test:unit     # Run unit tests
npm test              # Run E2E tests
npm run build         # Build for production
```

### **Test Execution**
```bash
# Unit tests (Vitest)
npm run test:unit             # Run all unit tests
npm run test:unit:ui          # Interactive UI mode
npm run test:unit:coverage    # With coverage report

# E2E tests (Playwright)
npm test                      # Run all E2E tests
npm run test:headed           # See browser
npm run test:ui               # Interactive mode
npm run test:debug            # Step-through debugging
npm run test:report           # View HTML report

# All tests
npm run test:all              # Unit + E2E
```

---

## 📊 Standards & Protocols

### **ERC Standards**
- **ERC-4337** - Account Abstraction
- **ERC-4626** - Tokenized Vaults
- **ERC-20** - Fungible Tokens

### **NIST Standards**
- **ML-DSA** (Module-Lattice-Based Digital Signature Algorithm)
- **SLH-DSA** (Stateless Hash-Based Digital Signature Algorithm)

### **Web Standards**
- **ES2020** - JavaScript/TypeScript
- **CSS3** - Styling
- **HTML5** - Markup
- **WebAssembly** - (Future for PQ crypto)

---

## 🔒 Security Features

### **Smart Contract**
- Block-based vesting (manipulation-resistant)
- Reentrancy protection
- Pausable emergency stops
- Access control (owner-only functions)
- Input validation (NIST parameter checking)
- No ECDSA fallback (pure PQ)

### **Frontend**
- Type-safe TypeScript
- Input validation
- Percentage allocation checks
- Address format validation
- JSON schema validation

### **Testing**
- 61 Foundry tests
- 33 Vitest unit tests
- 40 Playwright E2E tests
- Slither static analysis
- Accessibility testing ready

---

## 📈 Performance

### **Smart Contracts**
- Optimized for Ethereum gas costs
- Average gas per deployment: ~3-5M gas
- Vesting calculations: O(1) complexity

### **Frontend**
- Vite HMR (Hot Module Replacement)
- Code splitting
- Tree shaking
- Production build < 500KB gzipped

### **Tests**
- Unit tests: ~1.4s execution
- E2E tests: ~26s execution (Chromium)
- Full suite: ~30s total

---

## 🌍 Deployment

### **Smart Contracts**
- Deployed to Tenderly Virtual TestNet
- Deployment via Foundry scripts
- Contract verification on Tenderly

### **Frontend**
- Local: `http://localhost:5175`
- Build: Static files in `dist/`
- Deploy: Any static host (Vercel, Netlify, etc.)

### **CI/CD**
- **GitHub Actions** workflow
- Automated E2E testing on push/PR
- Test reports uploaded as artifacts
- PR comments with test results

---

## 📚 Documentation

### **Generated Docs**
- `TECH_STACK.md` - This file
- `tests/e2e/README.md` - E2E testing guide
- `templates/README.md` - Vesting template docs
- `dashboard/README.md` - Setup instructions

### **Code Documentation**
- Inline comments
- JSDoc/NatSpec
- Type definitions
- Test descriptions

---

## 🎓 Learning Resources

### **Frameworks Used**
- [Foundry Book](https://book.getfoundry.sh/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Docs](https://react.dev/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Docs](https://playwright.dev/)
- [wagmi Documentation](https://wagmi.sh/)

### **Standards**
- [ERC-4337 Spec](https://eips.ethereum.org/EIPS/eip-4337)
- [ERC-4626 Spec](https://eips.ethereum.org/EIPS/eip-4626)
- [NIST PQC](https://csrc.nist.gov/projects/post-quantum-cryptography)

---

## 🔮 Future Enhancements

### **Planned Additions**
- [ ] Vitest UI (in-browser test runner)
- [ ] Coverage reports visualization
- [ ] Component library with Storybook
- [ ] Performance monitoring (Web Vitals)
- [ ] i18n (Internationalization)
- [ ] Dark mode theme
- [ ] Mobile-optimized UI
- [ ] GraphQL API for contract data
- [ ] WebSocket for real-time updates

### **Security Roadmap**
- [ ] Professional smart contract audit
- [ ] Formal verification (Certora/Halmos)
- [ ] Bug bounty program
- [ ] Security scorecard

---

**Last Updated:** October 18, 2025
**Dashboard Version:** 0.1.0
**Total Lines of Code:** ~15,000+
**Test Coverage:** 94 tests across 3 frameworks
