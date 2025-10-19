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

## Automation Rules (CRITICAL - FOLLOW ALWAYS)

### Auto-Commit After Significant Builds
**IMPORTANT**: After completing any significant build task, run the auto-commit hook:
```bash
./.claude/hooks/auto-commit.sh
```

**Significant builds include**:
- Completing a smart contract
- Finishing a React component
- Creating/updating database schemas
- Adding new libraries or utilities
- Completing documentation files
- Finishing any task from the todo list

### Auto-Continue Workflow
**IMPORTANT**: After completing each todo item:
1. Mark it as completed in TodoWrite
2. Run auto-commit hook
3. **Immediately start the next pending todo** - DO NOT wait for user input
4. Only stop and ask for direction when:
   - All todos are completed
   - You encounter an error you can't resolve
   - You need user input for a decision
   - Token usage exceeds 90% (see below)

### Token Budget Management
**Current capacity**: 200,000 tokens per session

**Monitoring rules**:
- At 80% usage (160K tokens): Alert user, continue working
- At 90% usage (180K tokens): Suggest compaction, continue working
- At 95% usage (190K tokens): **STOP and ask user to compact**

**Alert format**:
```
⚠️ Token Usage: X% (Y/200K tokens)
Recommend: [Continue | Compact Soon | Compact Now]
```

### Continuous Progress Mode
When working through a todo list:
1. Complete current task
2. Update TodoWrite
3. Run auto-commit hook
4. **Start next task immediately**
5. Repeat until all tasks done

**DO NOT** wait for "continue" or "go ahead" between tasks unless:
- You need a decision from the user
- You encounter an error
- All tasks are complete

---

**Last Updated:** October 19, 2025
**Status:** Auth system in progress, Prize integrations ready ($25K)
**Next Milestone:** Complete auth UI, deploy Pyth to Tenderly
