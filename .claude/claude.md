# Claude Project Context - EthVaultPQ

## Project Overview

EthVaultPQ is a post-quantum cryptographic smart contract protocol featuring:
- Post-quantum secure wallets (ERC-4337)
- Vesting vault with quantum-resistant features (ERC-4626)
- ZK-SNARK proof oracles for Dilithium signatures
- Quantum Random Number Generator (QRNG) oracle
- NIST ML-DSA and SLH-DSA compliant cryptography

## Network Configuration

### Primary Test Network
**Tenderly Ethereum Virtual TestNet**
- Network: Ethereum (not Base, not Sepolia initially)
- Purpose: Safe testing environment with full Ethereum compatibility
- Features: Transaction simulation, debugging, monitoring
- Next Step: Deploy to Tenderly for comprehensive testing

### Deployment Progression
1. **Tenderly Ethereum** ← CURRENT TARGET
2. Sepolia Testnet (after Tenderly validation)
3. Mainnet (after professional audit)

## Important Notes

- This is an **Ethereum project**, not Base
- Testing will be done on **Tenderly Ethereum Virtual TestNet**
- All gas estimates and optimizations are for Ethereum mainnet
- Oracle services will be deployed alongside Tenderly testing
- Block time assumption: 12 seconds (Ethereum standard)
- **Dashboard UI has NOT been updated recently** - needs work
- **Need to add Deploy Tab** showing all deployment states

## Recent Work Completed (October 17, 2025)

### Security Audit Remediation
- Fixed 20 vulnerabilities (7 HIGH, 7 MEDIUM, 6 LOW)
- Implemented comprehensive ERC-4337 attack protections
- Migrated vesting from block.timestamp to block.number
- Added NIST ML-DSA/SLH-DSA parameter validation
- Enhanced CREATE2 entropy with multi-source randomness
- Added access controls to PQValidator
- Verified no ECDSA fallback (pure PQ signatures)

### Testing Infrastructure
- Created 61 unit tests across 4 test files
- Ran Slither static analysis (zero critical findings)
- Comprehensive test coverage for all security fixes

### Documentation
- 7 comprehensive documents (~2,500 lines)
- Deployment checklist (200+ items)
- Multi-sig analysis document
- Complete audit summaries

## Project Status

**Testnet Ready:** ✅ YES
**Mainnet Ready:** 🔴 NO (requires professional audit)
**Dashboard Status:** ⚠️ NEEDS UPDATE (not updated recently)

### Next Immediate Steps
1. Update Dashboard UI with Deploy Tab
2. Deploy to Tenderly Ethereum Virtual TestNet
3. Run comprehensive testing (30+ days)
4. Engage professional security auditor

## Dashboard Requirements

### Deploy Tab (NEW - NEEDS IMPLEMENTATION)
The dashboard needs a new "Deploy" tab that shows:
- Deployment status for all contracts
- Network selection (Tenderly Ethereum, Sepolia, Mainnet)
- Contract addresses once deployed
- Deployment progress indicators
- Verification status on Etherscan/Tenderly
- Test transaction capabilities

**Priority:** HIGH - Required for Tenderly deployment

## Key Technical Details

### Smart Contracts
- **Language:** Solidity 0.8.28
- **Framework:** Foundry
- **Standards:** ERC-4337, ERC-4626
- **Libraries:** OpenZeppelin v5.4.0
- **Cryptography:** Post-Quantum (Dilithium3, SPHINCS+)

### Security Features
- NIST-compliant PQ parameters (9 algorithms supported)
- Block-number-based vesting (manipulation-proof)
- ERC-4337 calldata validation
- Replay protection on oracles
- Emergency pause capability
- Comprehensive access controls
- Multi-source CREATE2 entropy

## Reminders for Future Sessions

- ✅ Always use Tenderly Ethereum for testing (NOT Base, NOT Sepolia initially)
- ✅ This is a pure PQ project (no ECDSA fallback)
- ✅ Block numbers used for vesting (not timestamps)
- ✅ NIST parameter validation is mandatory
- ✅ Professional audit required before mainnet
- ⚠️ Dashboard UI needs update (Deploy Tab required)
- ⚠️ Dashboard has not been updated recently

---

**Last Updated:** October 17, 2025
**Status:** Testnet deployment ready on Tenderly Ethereum
**Next Milestone:** Deploy Tab UI + Tenderly deployment
