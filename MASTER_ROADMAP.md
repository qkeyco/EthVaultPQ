# EthVaultPQ - Master Implementation Roadmap

## 🎯 **Project Vision**

Build a **production-grade, post-quantum secure vesting platform** with:
- Enterprise auth & RBAC
- Clarity Act compliance
- Real-time price feeds
- Multi-chain support
- AI voice assistance
- Full audit trail

---

## 📊 **Phased Implementation Plan**

---

## **PHASE 1: Prize Integrations** ($25,000 revenue) ⏳ **CURRENT FOCUS**

**Goal**: Complete 3 prize integrations to generate $25K in hackathon prizes

**Duration**: 1-2 weeks
**Status**: 95% complete (code done, deployment pending)

### **1.1 Pyth Network** - $5,000 ✅
**Status**: Code complete, docs complete
**Deliverables**:
- [x] PythPriceOracle.sol smart contract
- [x] PQVault4626WithPricing.sol vault with USD pricing
- [x] PriceDisplay.tsx live price component
- [x] 16+ price feeds configured (ETH, BTC, PYUSD, USDC, USDT, DAI, etc.)
- [x] Dashboard integration (Oracles tab)
- [x] Complete documentation (PYTH_INTEGRATION.md)
- [ ] Deploy to Tenderly
- [ ] Record demo video
- [ ] Submit prize application

**Files**:
- `contracts/oracles/PythPriceOracle.sol` (300 lines)
- `contracts/vault/PQVault4626WithPricing.sol` (350 lines)
- `dashboard/src/components/PriceDisplay.tsx` (180 lines)
- `script/DeployPythOracle.s.sol` (100 lines)

---

### **1.2 Blockscout** - $10,000 ✅
**Status**: Documentation complete
**Deliverables**:
- [x] Verification guide for 10 contracts
- [x] Enhanced NatSpec documentation
- [x] Verification script
- [x] Custom metadata prepared
- [x] Complete documentation (BLOCKSCOUT_INTEGRATION.md)
- [ ] Verify all contracts on Blockscout/Tenderly
- [ ] Add custom analytics widgets
- [ ] Record demo video
- [ ] Submit prize application

**Contracts to Verify**:
1. ZKVerifier - `0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288`
2. PQValidator - `0xf527846F3219A6949A8c8241BB5d4ecf2244CadF`
3. PQWalletFactory - `0x5895dAbE895b0243B345CF30df9d7070F478C47F`
4. MockToken - `0xc351De5746211E2B7688D7650A8bF7D91C809c0D`
5. PQVault4626 - `0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21`
6. PQVault4626Demo - `0xE6D42d7B673852fDd755E870A3bDD85a4852AE9C`
7. ZKProofOracle - `0xF8982849A04d7CeD0c36ed9028e293CB4c2277C9`
8. QRNGOracle - `0x1b7754689d5bDf4618aA52dDD319D809a00B0843`
9. PythPriceOracle - (pending deployment)
10. PQVault4626WithPricing - (pending deployment)

---

### **1.3 PayPal USD (PYUSD)** - $10,000 ✅
**Status**: Integration complete
**Deliverables**:
- [x] PYUSD price feed added to Pyth oracle
- [x] PYUSD in dashboard price grid
- [x] Token configuration
- [x] Complete documentation (PAYPAL_USD_INTEGRATION.md)
- [ ] Deploy PYUSD vesting vault
- [ ] Create demo vesting schedule
- [ ] Record demo video
- [ ] Submit prize application

**Features**:
- PYUSD vesting schedules
- Live PYUSD/USD pricing
- Stable value for payroll
- Easy PayPal off-ramp

---

### **Phase 1 Completion Checklist**
- [ ] Deploy Pyth contracts to Tenderly
- [ ] Verify all contracts on Blockscout
- [ ] Test all integrations live
- [ ] Record 3 demo videos (5-7 min total)
- [ ] Submit 3 prize applications
- [ ] Collect $25,000 in prizes 💰

**Estimated Completion**: 1-2 weeks from now

---

## **PHASE 2: Authentication & Authorization** (Weeks 3-5)

**Goal**: Build enterprise-grade, vendor-lock-in-free auth system

**Duration**: 2-3 weeks
**Status**: Architecture documented, not started

### **2.1 Core Auth Infrastructure**
**Deliverables**:
- [ ] Prisma schema (User, Session, Organization, Membership)
- [ ] Auth.js setup with PrismaAdapter
- [ ] JWT session management
- [ ] Protected route middleware
- [ ] Login/logout flows

**Tech Stack**:
- Next.js App Router
- Auth.js (NextAuth v5)
- Prisma + Postgres (Neon)
- Zero vendor lock-in

---

### **2.2 RBAC System**
**Deliverables**:
- [ ] Role definitions (7 roles)
- [ ] Permission system (action-based)
- [ ] Org-scoped authorization
- [ ] `can(userId, orgId, action)` helper
- [ ] API route protection

**Roles**:
1. `super_admin` - System-wide access
2. `org_admin` - Per-organization management
3. `hr_manager` - Grant operations
4. `finance_ops` - Payouts, reporting
5. `support_agent` - Read + controlled impersonation
6. `end_user` - Employee/contributor view
7. `auditor` - Read-only compliance

**Permissions**:
- `vesting.plan.create`, `vesting.plan.read`
- `grant.assign`, `grant.read`
- `payout.execute`
- `user.view`
- `support.impersonate`

---

### **2.3 Passkeys (WebAuthn)**
**Deliverables**:
- [ ] SimpleWebAuthn integration
- [ ] WebAuthnKey model
- [ ] 4 API endpoints (register/verify, login/verify)
- [ ] Passwordless auth flow
- [ ] Multi-device support

**Benefits**:
- No passwords
- No SaaS dependency
- Browser-native security

---

### **2.4 Support & Impersonation**
**Deliverables**:
- [ ] ImpersonationSession model
- [ ] Impersonation API endpoints
- [ ] Reason + TTL requirements
- [ ] Restricted mutations (dual approval)
- [ ] Audit logging
- [ ] UI banner for impersonation mode

---

### **2.5 Admin UI**
**Deliverables**:
- [ ] Organization selector
- [ ] User management (invite, roles)
- [ ] Vesting plan editor
- [ ] Grant assignment interface
- [ ] Support dashboard (impersonate)
- [ ] Audit log viewer

**New Dashboard Tab**: "Admin" (visible to org_admin+ roles)

---

### **Phase 2 Completion Checklist**
- [ ] All auth models in Prisma
- [ ] Passkeys working
- [ ] All 7 roles functional
- [ ] Admin UI deployed
- [ ] Support impersonation tested
- [ ] Seed script with test data
- [ ] Deploy to Vercel staging

**Estimated Completion**: Week 5

---

## **PHASE 3: Clarity Act Compliance** (Weeks 6-8)

**Goal**: Post-vesting trading limits and regulatory compliance

**Duration**: 2-3 weeks
**Status**: Architecture documented, not started

### **3.1 Trading Restrictions**
**Deliverables**:
- [ ] TradingRestriction model
- [ ] Post-vesting lockup rules
- [ ] Volume limit enforcement
- [ ] Pre-trade validation API
- [ ] Compliance oracle (on-chain option)

**Rules by Role**:
```
Founders/10%+ holders:  2 years hold, ≤1% float/quarter
Key employees:          1 year hold,  ≤2% float/quarter
Non-insider contrib:    6 months hold, ≤4% float/quarter
Public investors:       no limits
```

---

### **3.2 Compliance Rule Engine**
**Deliverables**:
- [ ] JSON rule definitions
- [ ] Rule templates by role
- [ ] Automatic rule attachment on grant creation
- [ ] Exception workflow (dual approval)
- [ ] Rule versioning

**Example Rule**:
```json
{
  "role": "founder",
  "holdMonths": 24,
  "volumeLimitPct": 1,
  "periodDays": 90
}
```

---

### **3.3 Compliance Dashboard**
**Deliverables**:
- [ ] Restricted float % calculator
- [ ] Next unlock schedule (vest vs tradeable)
- [ ] Insider trading limits dashboard
- [ ] Breach attempt log
- [ ] Compliance certificates export

**New Dashboard Tab**: "Compliance" (visible to compliance_officer+ roles)

---

### **3.4 On-Chain Enforcement** (Optional)
**Deliverables**:
- [ ] Compliance oracle contract
- [ ] `canTransfer(user, amount)` validation
- [ ] Uniswap v4 hook integration
- [ ] Transfer proxy pattern
- [ ] Volume tracking on-chain

---

### **Phase 3 Completion Checklist**
- [ ] All trading restrictions working
- [ ] Rule engine tested
- [ ] Compliance dashboard deployed
- [ ] Export compliance certificates
- [ ] Test breach scenarios
- [ ] Deploy to mainnet (if on-chain)

**Estimated Completion**: Week 8

---

## **PHASE 4: Comprehensive Audit Trail** (Weeks 9-10)

**Goal**: Tamper-evident, hash-chained audit system

**Duration**: 1-2 weeks
**Status**: Architecture documented, not started

### **4.1 Audit Log System**
**Deliverables**:
- [ ] AuditLog model (hash-chained)
- [ ] Event taxonomy (auth, rbac, vesting, compliance, etc.)
- [ ] `logAudit()` middleware
- [ ] PII redaction rules
- [ ] prevHash/selfHash computation

**Events Tracked**:
- `auth.*` - login, logout, passkey
- `rbac.*` - role assignments, impersonation
- `vesting.*` - plan creation, grants, revokes
- `compliance.*` - restrictions, trade blocks
- `system.*` - cron, webhooks, migrations
- `onchain.*` - tx submitted/mined/reverted

---

### **4.2 Hash-Chain & Anchoring**
**Deliverables**:
- [ ] Keccak256 hash chain
- [ ] Periodic Merkle root anchoring to L1
- [ ] Anchor transaction storage
- [ ] Tamper detection
- [ ] Integrity widget

---

### **4.3 Retention & Export**
**Deliverables**:
- [ ] 90-day hot storage (Postgres)
- [ ] 7-year archive (S3 WORM)
- [ ] Nightly CSV/Parquet export
- [ ] SIEM streaming (optional)
- [ ] Audit bundle download (ZIP)

---

### **4.4 Audit Dashboards**
**Deliverables**:
- [ ] Sensitive actions timeline
- [ ] Impersonation activity heatmap
- [ ] Unlocks/claims error rates
- [ ] Audit integrity status

**New Dashboard Tab**: "Audit Trail" (visible to auditor+ roles)

---

### **Phase 4 Completion Checklist**
- [ ] All events logged with hashes
- [ ] Anchoring working (testnet)
- [ ] Export bundles tested
- [ ] Audit dashboard deployed
- [ ] 7-year retention setup
- [ ] Tamper detection verified

**Estimated Completion**: Week 10

---

## **PHASE 5: Advanced Features** (Weeks 11-14)

**Goal**: Polish, analytics, and user experience

**Duration**: 3-4 weeks
**Status**: Architecture documented, not started

### **5.1 Visual Organization Hierarchy**
**Deliverables**:
- [ ] Organization tree component
- [ ] User roles visualization
- [ ] Vesting plan hierarchy
- [ ] Grant flow diagram
- [ ] Compliance overlay
- [ ] Interactive drill-down

**New Dashboard Tab**: "Org Hierarchy" 🎯 **YOU REQUESTED THIS**

**Features**:
- Graphical org chart
- Auth roles per user
- Vesting plans per org
- Active grants per user
- Clarity Act restrictions
- Color-coded status (active/vested/locked)

**Example Visualization**:
```
Organization: Acme Corp
├── Org Admin: alice@acme.com
├── HR Manager: bob@acme.com
├── Finance Ops: carol@acme.com
└── Employees (25)
    ├── john@acme.com
    │   ├── Grant #1: 100K PRIZE (40% vested, 60% locked)
    │   ├── Clarity Restriction: 2-year hold (ends 2027-01-01)
    │   └── Role: end_user
    └── jane@acme.com
        ├── Grant #2: 50K PYUSD (100% vested, 50% tradeable)
        ├── Clarity Restriction: 1-year hold (ends 2026-06-01)
        └── Role: end_user
```

---

### **5.2 Analytics & Insights**
**Deliverables**:
- [ ] Vesting liability projection
- [ ] Token distribution heatmap
- [ ] Burn-down chart (unvested pool)
- [ ] Employee engagement metrics
- [ ] Stress test simulator

---

### **5.3 Notifications & Communication**
**Deliverables**:
- [ ] Email notifications (grant created, unlock, claim)
- [ ] SMS notifications (Twilio)
- [ ] SignalWire AI voice assistant
- [ ] WebSocket real-time updates
- [ ] Notification preferences UI

---

### **5.4 Multi-Chain Support**
**Deliverables**:
- [ ] Base network deployment
- [ ] Solana adapter (future)
- [ ] Cross-chain vesting sync
- [ ] Bridge verification
- [ ] Multi-chain dashboard

---

### **5.5 UX Polish**
**Deliverables**:
- [ ] Vesting timeline chart (interactive)
- [ ] Projected value calculator (live prices)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Mobile optimization (PWA)
- [ ] Accessibility (WCAG AA)

---

### **Phase 5 Completion Checklist**
- [ ] Org hierarchy tab deployed 🎯
- [ ] All analytics working
- [ ] SignalWire voice integrated
- [ ] Multi-chain tested
- [ ] UX polish complete
- [ ] Full E2E testing

**Estimated Completion**: Week 14

---

## **PHASE 6: Production Readiness** (Weeks 15-16)

**Goal**: Security, audits, and go-live

**Duration**: 2 weeks
**Status**: Not started

### **6.1 Security Audit**
**Deliverables**:
- [ ] Smart contract audit (Consensys/Trail of Bits)
- [ ] Backend security review
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Security scorecard

---

### **6.2 Performance & Scale**
**Deliverables**:
- [ ] Load testing (10K+ users)
- [ ] Database optimization
- [ ] CDN setup (Cloudflare)
- [ ] Caching layer (Redis)
- [ ] Rate limiting

---

### **6.3 Monitoring & Alerting**
**Deliverables**:
- [ ] Grafana dashboards
- [ ] Prometheus metrics
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] On-call rotation

---

### **6.4 Documentation & Training**
**Deliverables**:
- [ ] User documentation
- [ ] Admin guides
- [ ] API documentation
- [ ] Video tutorials
- [ ] Customer support playbooks

---

### **6.5 Mainnet Launch**
**Deliverables**:
- [ ] Deploy to Ethereum mainnet
- [ ] Deploy to Base
- [ ] Verify all contracts
- [ ] Announce launch
- [ ] Onboard first customers

---

### **Phase 6 Completion Checklist**
- [ ] Security audit complete
- [ ] Performance validated
- [ ] Monitoring active
- [ ] Documentation published
- [ ] Mainnet deployed
- [ ] Production live! 🚀

**Estimated Completion**: Week 16

---

## 📊 **Summary Timeline**

| Phase | Duration | Weeks | Status | Revenue/Value |
|-------|----------|-------|--------|---------------|
| **Phase 1: Prizes** | 1-2 weeks | 1-2 | 95% Done | **$25,000** |
| **Phase 2: Auth** | 2-3 weeks | 3-5 | Planned | Foundation |
| **Phase 3: Clarity** | 2-3 weeks | 6-8 | Planned | Compliance |
| **Phase 4: Audit** | 1-2 weeks | 9-10 | Planned | Security |
| **Phase 5: Advanced** | 3-4 weeks | 11-14 | Planned | UX |
| **Phase 6: Production** | 2 weeks | 15-16 | Planned | Launch |

**Total Timeline**: ~16 weeks (4 months)
**Total Prize Revenue**: $25,000 (Phase 1)
**Production Launch**: Week 16

---

## 🎯 **Immediate Next Steps** (This Week)

### **Week 1 Tasks**:
1. [ ] Deploy PythPriceOracle to Tenderly
2. [ ] Deploy PQVault4626WithPricing to Tenderly
3. [ ] Verify all 10 contracts on Blockscout/Tenderly
4. [ ] Test Pyth price feeds live
5. [ ] Test PYUSD integration live
6. [ ] Record 3 demo videos:
   - Pyth Network integration (5 min)
   - Blockscout verification (3 min)
   - PayPal USD vesting (4 min)
7. [ ] Submit 3 prize applications
8. [ ] Collect $25,000 💰

---

## 📁 **Project Structure**

```
EthVaultPQ/
├── contracts/              # Solidity contracts
│   ├── core/              # PQWallet, PQWalletFactory
│   ├── vault/             # PQVault4626, PQVault4626WithPricing
│   ├── oracles/           # PythPriceOracle, ZKProofOracle, QRNGOracle
│   └── libraries/         # ZKVerifier, PQValidator
├── dashboard/             # React + Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── config/       # Network, tokens, Pyth IDs
│   │   ├── lib/          # Auth, authz, audit (Phase 2+)
│   │   └── types/        # TypeScript types
│   ├── tests/
│   │   ├── unit/         # Vitest tests
│   │   └── e2e/          # Playwright tests
│   └── prisma/           # Database schema (Phase 2+)
├── script/                # Deployment scripts
├── test/                  # Foundry tests
└── docs/                  # Documentation
    ├── PYTH_INTEGRATION.md
    ├── BLOCKSCOUT_INTEGRATION.md
    ├── PAYPAL_USD_INTEGRATION.md
    ├── PRIZE_SUMMARY.md
    └── MASTER_ROADMAP.md (this file)
```

---

## 🎓 **Key Architecture Decisions**

### **Smart Contracts**
- **Language**: Solidity 0.8.28
- **Framework**: Foundry
- **Standards**: ERC-4337, ERC-4626, ERC-20
- **Security**: Post-quantum (NIST ML-DSA, SLH-DSA)
- **Deployment**: Tenderly → Sepolia → Mainnet

### **Backend**
- **Framework**: Next.js App Router
- **Database**: Postgres (Neon) + Prisma
- **Auth**: Auth.js (no vendor lock-in)
- **Hosting**: Vercel

### **Frontend**
- **Framework**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **State**: TanStack Query
- **Web3**: wagmi + viem
- **Testing**: Vitest + Playwright

### **Infrastructure**
- **Oracles**: Pyth Network (prices)
- **Blockchain**: Ethereum, Base (future)
- **Storage**: S3 (audit archive)
- **Monitoring**: Grafana + Prometheus

---

## 🔒 **Security Principles**

1. **Post-Quantum First** - NIST ML-DSA/SLH-DSA throughout
2. **Zero Trust** - Every action authenticated + authorized
3. **Audit Everything** - Comprehensive, tamper-evident logs
4. **No Vendor Lock-In** - All code OSS, self-hostable
5. **Defense in Depth** - Multi-layer security (auth, RBAC, compliance, audit)

---

## 💰 **Business Model** (Future)

### **Revenue Streams** (Post-Launch)
1. **SaaS Subscriptions**: $99-$999/month per org
2. **Enterprise**: Custom pricing for large companies
3. **Transaction Fees**: 0.5% of vested amounts (optional)
4. **Professional Services**: Integration, consulting
5. **White Label**: License platform to other protocols

### **Target Market**
- Web3 startups (employee vesting)
- DAOs (contributor compensation)
- Traditional companies (token vesting)
- VCs/funds (portfolio management)

---

## 📞 **Support & Community**

- **GitHub**: https://github.com/yourusername/EthVaultPQ
- **Discord**: (create community server)
- **Email**: support@ethvaultpq.com
- **Twitter**: @EthVaultPQ

---

## ✅ **Current Status**

**Phase 1: Prizes** - 95% Complete
- ✅ Pyth Network integrated
- ✅ Blockscout documented
- ✅ PayPal USD integrated
- ⏳ Deployments pending
- ⏳ Demos pending
- ⏳ Submissions pending

**Next Milestone**: Complete Phase 1 ($25K) → Start Phase 2 (Auth)

---

**Last Updated**: October 18, 2025
**Current Phase**: Phase 1 (Prizes)
**Next Phase**: Phase 2 (Auth) - starts Week 3

---

*Built with post-quantum security and modern Web3 infrastructure*
