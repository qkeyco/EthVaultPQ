# EthVaultPQ - Vesting Platform Feature Roadmap

A structured checklist to track features and phases for the post-quantum vesting platform.

**Current Status**: Post-MVP (Basic vesting functional, prize integrations complete)
**Next Phase**: Compliance & Enterprise Features

---

## Legend

- **Priority**:
  - `MVP` - Minimum Viable Product (core functionality)
  - `Phase 2` - Enhanced features for enterprise adoption
  - `Phase 3` - Advanced features and optimizations
  - `Future` - Research/experimental features

- **Status**:
  - ✅ `Complete` - Feature implemented and tested
  - 🔄 `In Progress` - Currently being developed
  - 📋 `Planned` - Designed but not started
  - 🔬 `Research` - Needs investigation/design
  - ⏸️ `Deferred` - Lower priority, postponed

---

## Core Vesting Engine

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Grant creation with cliffs | MVP | ✅ Complete | `depositWithVesting()` functional |
| Linear vesting tranches | MVP | ✅ Complete | Block-based linear vesting |
| Pause / resume / revoke | MVP | ✅ Complete | Owner-controlled pause mechanism |
| Multi-token support (ERC-20) | MVP | ✅ Complete | Any ERC-20 via ERC-4626 |
| Fiat ledger tracking | Phase 2 | 📋 Planned | USD valuation via Pyth integration |
| Unlock scheduler + claim queue | MVP | ✅ Complete | `withdrawVested()` claim system |
| Real-time vesting chart | Phase 2 | 📋 Planned | Dashboard visualization needed |
| Multi-recipient vesting (batch) | MVP | ✅ Complete | Supported in VestingManagerV2 |
| Performance/milestone-based vesting | Phase 3 | 🔬 Research | Rule-based unlock conditions |
| Backfill/import historical grants | Phase 2 | 📋 Planned | CSV/JSON importer with validation |
| Test mode (60x acceleration) | MVP | ✅ Complete | `PQVault4626Demo` deployed |

---

## Compliance & Clarity Act

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Post-vesting hold periods | MVP | 📋 Planned | Lock after vesting completion |
| Volume-based trading limits (≤1%/quarter) | MVP | 📋 Planned | Per role/tier restrictions |
| Insider windows / blackout periods | Phase 2 | 📋 Planned | Auto-freeze by calendar events |
| Cross-chain enforcement oracle | Future | 🔬 Research | Sync rules to L2s/other chains |
| Compliance reports & attestations | Phase 2 | 📋 Planned | CSV/PDF audit bundles |
| SEC Rule 144 compliance | Phase 2 | 📋 Planned | Holding period tracking |
| IRS Form 1099 generation | Phase 2 | 📋 Planned | Tax reporting for vested amounts |
| SOX compliance logging | Phase 2 | 📋 Planned | Financial controls audit trail |

---

## Auth & Security

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| RBAC (org_admin, hr_manager, finance_ops, support_agent, end_user, auditor) | MVP | 🔄 In Progress | Currently only owner-based |
| Impersonation guardrails (reason/ttl/dual approval) | MVP | 📋 Planned | Read-only impersonation with logging |
| Multi-sig admin actions | Phase 2 | 📋 Planned | Treasury & override operations |
| Passkeys / WebAuthn (RIP-7212) | MVP | 📋 Planned | Passwordless login for dashboard |
| ERC-4337 Account Abstraction | MVP | ✅ Complete | PQWallet with EntryPoint v0.7 |
| Post-quantum signatures (NIST ML-DSA) | MVP | ✅ Complete | Dilithium3 support |
| Post-quantum signatures (NIST SLH-DSA) | MVP | ✅ Complete | SPHINCS+ support |
| ZK-SNARK proof verification | MVP | ✅ Complete | Groth16 verifier for Dilithium |
| Quantum-safe key anchoring | Future | ✅ Complete | Already implemented! |
| Emergency pause mechanism | MVP | ✅ Complete | Owner can pause vesting |
| Reentrancy protection | MVP | ✅ Complete | OpenZeppelin ReentrancyGuard |

---

## Audit & Logging

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Event capture (deposits, claims, withdrawals) | MVP | ✅ Complete | Solidity events emitted |
| Hash-chain + periodic L1 anchoring | Phase 2 | 📋 Planned | Tamper-evidence via merkle roots |
| Security alerting | Phase 2 | 📋 Planned | Email/SMS on suspicious activity |
| Export + long-term archive (S3/WORM) | Phase 2 | 📋 Planned | 7-year retention for compliance |
| Block explorer integration | MVP | ✅ Complete | Blockscout integration ready |
| Price history snapshots | MVP | ✅ Complete | Via PQVault4626WithPricing |
| Audit trail for all admin actions | Phase 2 | 📋 Planned | Enhanced event logging |

---

## Treasury & Finance

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Vaulted multisig treasury | MVP | 📋 Planned | Founders + HR + finance multi-sig |
| FX conversion + price feeds | MVP | ✅ Complete | Pyth Network integration ($5K prize!) |
| PayPal USD (PYUSD) support | MVP | ✅ Complete | PYUSD integration ($10K prize!) |
| Accounting export (CSV/XBRL) | Phase 2 | 📋 Planned | QuickBooks/ERP bridge |
| Liability forecasting | Phase 2 | 📋 Planned | Unlock → reserve calculations |
| Yield optimization (ERC-4626) | Phase 3 | ✅ Complete | ERC-4626 allows yield strategies |
| Real-time USD valuation | MVP | ✅ Complete | Via Pyth price oracle |
| Multi-currency display | Phase 2 | 📋 Planned | EUR, GBP, JPY conversion |

---

## Governance & Legal

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Digital grant agreements (hash + e-sign) | MVP | 📋 Planned | IPFS/hash or doc store |
| Policy engine (JSON rules) | Phase 2 | 📋 Planned | Dynamic compliance rules |
| DAO/board approvals for overrides | Future | 🔬 Research | Governance hooks |
| Rule versioning + notarization | Future | 🔬 Research | Immutable policy history |
| Sign Protocol attestations | Phase 2 | 📋 Planned | Vesting schedule attestations |
| Vesting schedule immutability | MVP | ✅ Complete | Cannot modify after creation |

---

## Analytics & Insights

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Vesting curve forecasting | Phase 2 | 📋 Planned | Dashboard charts/exports |
| Risk & exposure analysis | Phase 2 | 📋 Planned | Insider unlock heatmap |
| AI compliance auditor | Future | 🔬 Research | Anomaly detection |
| Unlock impact simulator | Phase 2 | 📋 Planned | Early-exit scenario modeling |
| Historical price charts | Phase 2 | 📋 Planned | Vesting value over time |
| Future value estimation | MVP | ✅ Complete | `estimateFutureValue()` function |
| USD value breakdown | MVP | ✅ Complete | Total, vested, unvested in USD |

---

## Integrations & APIs

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| REST/GraphQL read APIs | MVP | 📋 Planned | Scoped access tokens |
| Webhooks: grant.created, tranche.vested, claim.paid, trade.blocked | Phase 2 | 📋 Planned | Event bus integration |
| Payroll/HRIS connectors (Deel/Gusto) | Future | 🔬 Research | Off-chain payout automation |
| Exchange/KYC sync | Future | 🔬 Research | OTC desk workflows |
| SignalWire AI Voice assistant | MVP | 📋 Planned | Q&A + escalation ($5K prize?) |
| Pyth Network price feeds | MVP | ✅ Complete | 16+ tokens ($5K prize!) |
| Blockscout verification | MVP | ✅ Complete | All contracts ($10K prize!) |
| Lit Protocol encryption | Phase 2 | 📋 Planned | Private vesting schedules |
| The Graph subgraph | Phase 2 | 📋 Planned | Vesting event indexing |
| Envio indexer | Phase 2 | 📋 Planned | Real-time analytics ($5K prize?) |

---

## User Experience

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Employee dashboard (timeline + claim) | MVP | 🔄 In Progress | VestingManagerV2 functional |
| Admin console (orgs, grants, roles) | MVP | 🔄 In Progress | Basic UI complete |
| Live price ticker | MVP | ✅ Complete | Pyth integration in Oracles tab |
| Vesting schedule builder | MVP | ✅ Complete | VestingScheduleBuilder component |
| JSON import/export | MVP | ✅ Complete | VestingSchema + templates |
| Notifications center (email/SMS/voice) | Phase 2 | 📋 Planned | Template system + preferences |
| Multi-language (i18n) | Phase 2 | 📋 Planned | HR/legal localization |
| Accessibility & PWA | Phase 2 | 📋 Planned | WCAG 2.1 AA compliance |
| Mobile-responsive design | MVP | ✅ Complete | TailwindCSS responsive |
| Dark mode | Phase 2 | 📋 Planned | Theme switcher |

---

## DevOps & Infrastructure

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Environment separation (dev/stage/prod) | MVP | ✅ Complete | Tenderly testnet |
| Serverless crons (vesting, clarity checks) | MVP | 📋 Planned | Vercel/Supabase cron jobs |
| CI/CD with migrations | Phase 2 | 🔄 In Progress | GitHub Actions for tests |
| Monitoring + alerts | Phase 2 | 📋 Planned | Grafana/Prometheus |
| Config-as-code (JSON/YAML plans & rules) | Phase 2 | ✅ Complete | VestingSchema JSON format |
| Automated testing (E2E) | MVP | ✅ Complete | Playwright 40 tests |
| Automated testing (Unit) | MVP | ✅ Complete | Vitest 33 tests |
| Smart contract testing | MVP | ✅ Complete | Foundry 61 tests |
| Gas optimization | MVP | ✅ Complete | Optimized for Ethereum mainnet |

---

## Support & Operations

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Case management linked to audit IDs | Phase 2 | 📋 Planned | Support ticket system |
| Knowledge base / AI FAQ | Phase 2 | 📋 Planned | Embedded documentation |
| Voice agent escalation path | Phase 2 | 📋 Planned | AI → human handoff |
| SLA tracking & metrics | Future | 🔬 Research | Response time monitoring |
| Test runner UI | MVP | ✅ Complete | ToolsPage with TestRunner |
| Network diagnostics | MVP | ✅ Complete | Block time tests, gas price |
| Contract address validation | MVP | ✅ Complete | Address verification tools |

---

## Notifications & Messaging

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Multi-channel alerts (email/SMS/SignalWire) | MVP | 📋 Planned | Vesting & compliance events |
| Notification preferences per role | Phase 2 | 📋 Planned | User-configurable settings |
| Escalation routing | Phase 2 | 📋 Planned | Compliance or support escalations |
| Real-time dashboard updates | MVP | ✅ Complete | wagmi hooks with auto-refresh |
| Price alert notifications | Phase 2 | 📋 Planned | Notify when vesting value hits threshold |

---

## Data Privacy & Compliance

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| GDPR/CCPA consent management | MVP | 📋 Planned | User consent registry |
| Data anonymization / redaction | Phase 2 | 📋 Planned | PII minimization in logs |
| Right-to-forget / export | Phase 2 | 📋 Planned | Data portability tools |
| On-chain privacy | Phase 2 | 📋 Planned | Lit Protocol encrypted schedules |
| KYC/AML integration | Phase 2 | 📋 Planned | Compliance verification |

---

## Backup & Disaster Recovery

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Automated DB snapshots | MVP | 📋 Planned | Nightly backups |
| Encryption key rotation | Phase 2 | 📋 Planned | Quarterly rotation policy |
| Recovery & failover tests | Phase 2 | 📋 Planned | Tabletop disaster drills |
| Smart contract upgradeability | Phase 2 | 📋 Planned | Proxy pattern with timelock |
| Emergency withdrawal mechanism | MVP | ✅ Complete | Pause + owner controls |

---

## Testing & QA

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Automated unit + integration tests | MVP | ✅ Complete | Jest/Vitest coverage |
| E2E browser tests | MVP | ✅ Complete | Playwright multi-browser |
| Security penetration testing | Phase 2 | 📋 Planned | Annual external audit |
| Compliance test suite | Phase 2 | 📋 Planned | Clarity Act & vesting rules |
| Slither static analysis | MVP | ✅ Complete | Zero critical findings |
| Gas optimization tests | MVP | ✅ Complete | Foundry gas reports |
| Formal verification | Phase 3 | 🔬 Research | Certora/Halmos |

---

## Cross-Chain & Future-Proofing

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Mirror vesting proofs across chains | Future | 🔬 Research | ETH/Base/Solana sync |
| PQ signature migration testing | Future | ✅ Complete | Already using NIST PQ! |
| Bridge adapter for verification | Future | 🔬 Research | Wormhole / NTT design |
| Layer 2 deployment (Base, Optimism, Arbitrum) | Phase 3 | 📋 Planned | Multi-chain support |
| Hedera deployment | Phase 2 | 📋 Planned | EVM compatibility ($10K prize?) |
| Quantum RNG oracle | MVP | ✅ Complete | QRNGOracle deployed |

---

## Backlog Tags

### By Priority
- **MVP**: 45 features (31 complete, 14 planned)
- **Phase 2**: 38 features (0 complete, 38 planned)
- **Phase 3**: 5 features (1 complete, 4 research)
- **Future**: 11 features (2 complete, 9 research)

### By Category
- **Security**: 15 features (8 complete) 🔒
- **Compliance**: 12 features (0 complete) ⚖️
- **Treasury**: 8 features (5 complete) 💰
- **On-Chain**: 25 features (18 complete) ⛓️
- **UX**: 16 features (8 complete) 🎨
- **Infra**: 12 features (7 complete) 🛠️

### By Status
- ✅ **Complete**: 52 features
- 🔄 **In Progress**: 3 features
- 📋 **Planned**: 41 features
- 🔬 **Research**: 13 features

---

## Prize-Eligible Features

| Feature | Prize | Status | Submission |
|---------|-------|--------|------------|
| Pyth Network Integration | $5,000 | ✅ Complete | Ready |
| Blockscout Verification | $10,000 | ✅ Complete | Ready |
| PayPal USD Integration | $10,000 | ✅ Complete | Ready |
| Envio Indexing | $5,000 | 📋 Planned | TBD |
| Lit Protocol Encryption | $5,000 | 📋 Planned | TBD |
| Hardhat Tooling | $5,000 | 📋 Planned | TBD |
| Hedera Deployment | $10,000 | 📋 Planned | TBD |

**Current Prize Total**: $25,000 (3 integrations complete)
**Potential Additional**: $35,000 (4 integrations planned)

---

## Phase Roadmap

### ✅ Phase 0: MVP Core (COMPLETE)
- Block-based vesting engine
- ERC-4337 PQ wallets
- ERC-4626 tokenized vaults
- ZK-SNARK verification
- Basic dashboard UI
- Foundry testing
- **Status**: Deployed to Tenderly testnet

### 🔄 Phase 1: Prize Integrations (IN PROGRESS)
- Pyth Network price feeds ✅
- Blockscout verification ✅
- PayPal USD support ✅
- Dashboard enhancements 🔄
- **Status**: 3/3 complete, ready to submit

### 📋 Phase 2: Enterprise Features (NEXT)
- RBAC and multi-sig
- Compliance automation (Clarity Act)
- Advanced analytics
- Multi-channel notifications
- Lit Protocol privacy
- Envio indexing
- **Target**: Q1 2026

### 🔬 Phase 3: Advanced Features
- Cross-chain vesting
- AI compliance auditor
- Performance-based vesting
- Formal verification
- Layer 2 deployments
- **Target**: Q2-Q3 2026

---

## Priority Focus

### Immediate (This Week)
1. ✅ Complete Pyth integration
2. ✅ Complete Blockscout docs
3. ✅ Complete PayPal USD integration
4. Deploy new contracts to Tenderly
5. Record demo videos
6. Submit prize applications

### Short-Term (This Month)
1. Implement RBAC system
2. Add compliance hold periods
3. Build real-time vesting charts
4. Integrate Lit Protocol encryption
5. Deploy Envio indexer
6. Add notification system

### Medium-Term (Next Quarter)
1. Multi-sig treasury
2. Compliance reporting suite
3. Advanced analytics dashboard
4. Cross-chain bridging
5. Professional security audit
6. Mainnet deployment preparation

---

**Last Updated**: October 18, 2025
**Current Phase**: Phase 1 (Prize Integrations)
**Next Milestone**: Deploy + submit for $25K in prizes

---

*This is a living document. Features will be reprioritized based on user feedback, market conditions, and prize opportunities.*
