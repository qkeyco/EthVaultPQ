# EthVaultPQ Vesting FAQ
## Understanding Vesting, Unlocking, Lockup, and Legal Considerations

---

## Table of Contents
1. [Vesting vs. Unlocking](#vesting-vs-unlocking)
2. [IRS Section 83(b) Elections](#irs-section-83b-elections)
3. [CLARITY Act and Lockup Rules](#clarity-act-and-lockup-rules)
4. [How It All Fits Together](#how-it-all-fits-together)
5. [Common Scenarios](#common-scenarios)
6. [Important Disclaimers](#important-disclaimers)

---

## Vesting vs. Unlocking

### What is Vesting?

**Vesting** is the **legal transfer of ownership** of tokens over time. When tokens vest:
- You gain **beneficial ownership** of the tokens
- You have **tax obligations** at vesting time (for U.S. taxpayers)
- The tokens become **yours legally**, but may not be transferable yet
- This is typically an **off-chain legal concept** enforced by contracts

**Example:** You're granted 10,000 tokens with 4-year vesting. After 1 year, 2,500 tokens have **vested** - you legally own them, but they might not be liquid yet.

### What is Unlocking?

**Unlocking** is the **technical ability to transfer** tokens. When tokens unlock:
- You can **transfer, sell, or trade** the tokens on-chain
- No additional tax event (you were already taxed at vesting)
- This is an **on-chain enforcement mechanism**
- Tokens must be **both vested AND unlocked** to be transferable

**Example:** The same 2,500 tokens that vested after 1 year might not **unlock** until after a 2-year lockup period. You own them legally (vested), but can't transfer them yet (still locked).

### Key Differences

| Aspect | Vesting | Unlocking |
|--------|---------|-----------|
| **What it means** | Legal ownership transfer | Technical transfer capability |
| **Where it happens** | Legal/contractual (off-chain concept) | Smart contract (on-chain) |
| **Tax implications** | Creates taxable event (U.S.) | No additional tax event |
| **Can you claim?** | Yes, into your vault | Not until unlocked |
| **Can you transfer?** | No, until also unlocked | Yes, if also vested |

### In EthVaultPQ

Our protocol handles both concepts:

1. **Vesting Schedule**: Defined in `VestingVault.sol`, determines when you gain ownership
2. **Unlock Mechanism**: Enforced on-chain, determines when tokens become transferable
3. **Claim Function**: Allows you to claim vested tokens into your quantum-secure vault
4. **Transfer Restrictions**: Prevent transfers until both vested AND unlocked

---

## IRS Section 83(b) Elections

### What is an 83(b) Election?

**This is NOT legal advice. Consult a tax professional.**

An **83(b) election** is a letter you send to the IRS within **30 days** of receiving restricted property (like vesting tokens) that allows you to:

- Pay taxes on the **current fair market value** immediately
- Avoid paying taxes on **future appreciation** as ordinary income
- Convert future gains to **capital gains** (potentially lower tax rate)

### Why It Matters for Vesting Tokens

**Without 83(b) election:**
```
Year 1: 2,500 tokens vest at $10/token = $25,000 ordinary income tax
Year 2: 2,500 tokens vest at $50/token = $125,000 ordinary income tax
Year 3: 2,500 tokens vest at $100/token = $250,000 ordinary income tax
Year 4: 2,500 tokens vest at $200/token = $500,000 ordinary income tax

Total ordinary income: $900,000 (taxed at ordinary income rates: 24-37%)
```

**With 83(b) election:**
```
Day 1: File 83(b), pay tax on 10,000 tokens at $1/token = $10,000 ordinary income
Year 4: Sell all tokens at $200/token = $1,990,000 capital gain

Ordinary income: $10,000 (taxed at 24-37%)
Capital gain: $1,990,000 (taxed at 15-20% long-term rate)
```

### Critical Timing

- **Must be filed within 30 days** of token grant/receipt (if you have token options)
- **Cannot be revoked** after filing
- **Risk**: If tokens go to $0, you still paid tax on the initial value
- **Benefit**: Massive tax savings if tokens appreciate

### How Do I Tell If I Have Token Options?

**Check your grant documents** - they should explicitly say "token options."

**The key difference: Do you own tokens outright, or are they given step-by-step?**

- **Token Options**: If there's a chance you don't get the tokens (e.g., you leave early before vesting completes), these are options → 83(b) election applies
- **Outright Grant**: If tokens are yours immediately (even if subject to vesting schedule or lockup), they might not be "options" in the tax sense

**Examples:**
- You receive restricted tokens that vest over 4 years, but if you quit after 1 year, you forfeit unvested tokens → These are **options**, 83(b) applies
- You purchase tokens in a private sale that unlock over 12 months → These are **not options**, you already own them

⚠️ **Check the IRS rules and consult your lawyer/tax advisor immediately.** This is complex and varies by situation.

### Resources (NOT legal advice)

- **IRS Information**: [IRS Publication 525 - Taxable and Nontaxable Income](https://www.irs.gov/publications/p525)
- **IRS Form**: Search "IRS Section 83(b) election template"
- **Legal Guidance**: Consult with:
  - Tax attorney specializing in equity compensation
  - CPA with cryptocurrency/token experience
  - Lawyers at firms like Cooley, Fenwick & West, Gunderson Dettmer (for startups)

### Useful Websites

- **IRS Official**: https://www.irs.gov
- **Startup Law Resources**:
  - Cooley GO: https://www.cooleygo.com
  - Gunderson Dettmer: https://www.gunder.com/resources
- **Token Tax Specialists**:
  - CoinTracker Tax Resources
  - TokenTax Blog
  - CryptoTrader.Tax Resources

---

## CLARITY Act and Lockup Rules

### What is the CLARITY Act?

The **CLARITY Act** (Crypto Law in America for Revenue and Investment in Tomorrow's Youth) is proposed U.S. legislation that would:

- Define when cryptocurrency transactions create taxable events
- Potentially exclude **locked tokens** from immediate taxation
- Clarify the treatment of staking, airdrops, and vesting
- **Status**: Proposed, not yet law (as of October 2025)

### Current Impact (If Passed)

**Lockup provisions** might allow:
- Deferring taxes on **locked tokens** until they unlock
- Excluding certain DeFi activities from immediate taxation
- Clearer guidance on vesting token treatment

### Lockup in EthVaultPQ

Our protocol implements **on-chain lockup** that could benefit from CLARITY Act provisions:

1. **Vesting Period**: Legal ownership transfer timeline
2. **Lockup Period**: Additional transfer restriction (can be longer than vesting)
3. **Combined Protection**: Tokens can vest but remain locked for additional time

**Example CLARITY Act Scenario:**
```
Today: Receive 10,000 tokens, 4-year vesting, 6-year lockup
Without CLARITY: Tax each year as tokens vest
With CLARITY: Potentially defer tax until unlock (year 6)
```

### Important Notes

- **Not law yet**: Don't rely on CLARITY Act for current tax planning
- **Consult professionals**: Tax treatment of locked tokens is complex
- **Document everything**: Keep records of vesting schedules, lockup periods, and elections
- **Stay updated**: Tax law changes frequently

---

## How It All Fits Together

### Complete Timeline Example

Let's walk through a typical EthVaultPQ vesting scenario:

#### Day 0: Token Grant
```
Grant: 10,000 tokens
FMV: $1/token
Vesting: 4 years linear (2,500/year)
Lockup: 2 years from grant date
83(b) Decision: 30-day window starts NOW
```

**Action Items:**
- ✅ Consult tax advisor about 83(b) election
- ✅ If filing 83(b), send to IRS within 30 days
- ✅ Pay tax on $10,000 ordinary income (if filing 83(b))

#### Year 1: First Vesting Event
```
Vested: 2,500 tokens
Unlocked: 0 tokens (still in 2-year lockup)
Can claim to vault: YES (vested)
Can transfer: NO (locked)
```

**Tax Implications:**
- **With 83(b)**: No new tax event
- **Without 83(b)**: Ordinary income tax on 2,500 × current FMV

#### Year 2: Lockup Expires
```
Vested: 5,000 tokens (2,500 more this year)
Unlocked: 5,000 tokens (lockup ends)
Can claim to vault: YES (5,000 tokens)
Can transfer: YES (all 5,000 vested tokens now unlocked)
```

**Tax Implications:**
- **With 83(b)**: No new tax event
- **Without 83(b)**: Ordinary income tax on 2,500 × current FMV (Year 2 vesting)

#### Year 3-4: Remaining Vesting
```
Each year: 2,500 tokens vest
Each year: Tokens unlock immediately (past 2-year lockup)
Can claim to vault: YES
Can transfer: YES (immediately upon vesting)
```

**Tax Implications:**
- **With 83(b)**: No new tax events, just track basis
- **Without 83(b)**: Ordinary income tax each year on 2,500 × FMV

#### Year 5+: Post-Vesting Sales
```
Sell tokens: Capital gains tax
Holding period: Starts from vesting date (or grant if 83(b))
Rate: Long-term (15-20%) if held >1 year from vesting
```

### Visual Flow

```
           VESTING SCHEDULE (Legal Ownership)
           ====================================
Day 0      Year 1    Year 2    Year 3    Year 4
  |----------|---------|---------|---------|
  0        2,500     5,000     7,500    10,000 tokens

           LOCKUP PERIOD (Transfer Restriction)
           =====================================
Day 0                Year 2
  |-------------------|
        LOCKED        |    All future vestings unlock immediately
                      ↓
                   UNLOCKED

           TAX EVENTS
           ==========
83(b) Filed:   Day 0 only (pay tax on $10K at $1/token)
No 83(b):      Every vesting event (tax at current FMV)
```

---

## Common Scenarios

### Scenario 1: Startup Employee Grant

**Situation:**
- Joined early-stage startup
- Granted 100,000 tokens at $0.10/token
- 4-year vesting, 1-year cliff, no lockup
- Company plans Tenderly mainnet launch in 6 months

**Recommendation:**
1. **File 83(b) within 30 days** (pay tax on $10K)
2. Claim vested tokens to quantum-secure vault each year
3. If tokens appreciate to $10/token, you saved ~$360K in taxes
4. Consult tax attorney BEFORE accepting grant

### Scenario 2: Investor with Lockup

**Situation:**
- Purchased 1M tokens at $0.50/token in private sale
- Immediate vesting (100% day 1)
- 12-month lockup period
- Token lists on exchange at month 6

**Recommendation:**
1. **83(b) not applicable** (already fully vested at purchase)
2. Cost basis = $500K (purchase price)
3. Cannot sell until month 12 (lockup)
4. After lockup, sales taxed as capital gains from purchase date
5. Track holding period from purchase for long-term rates

### Scenario 3: DAO Contributor

**Situation:**
- Contributing to EthVaultPQ DAO
- Earn 10,000 tokens over 2 years (quarterly vesting)
- No lockup after vesting
- Tokens worth $5/token today

**Recommendation:**
1. **83(b) might not be available** (no upfront grant)
2. Each quarterly vesting = ordinary income event
3. Track cost basis for each vesting event
4. Consider holding for >1 year after each vest for capital gains treatment
5. Consult tax pro about whether this is employment income

### Scenario 4: Airdrop Recipients

**Situation:**
- Received 5,000 tokens in protocol airdrop
- 2-year vesting, immediate unlocking
- Tokens worth $2/token at receipt

**Recommendation:**
1. **83(b) likely not applicable** (IRS guidance unclear for airdrops)
2. Current IRS position: Ordinary income at receipt ($10K)
3. Future vestings: Additional ordinary income (if not all vested immediately)
4. CLARITY Act may change treatment (monitor legislation)
5. Consider if this is a gift, income, or property (complex area)

---

## Important Disclaimers

### This is NOT Legal or Tax Advice

**EthVaultPQ provides software, not legal or tax advice.**

- ✅ **DO**: Consult qualified professionals before making decisions
- ✅ **DO**: Work with tax attorneys, CPAs, and financial advisors
- ✅ **DO**: Research current law (tax rules change frequently)
- ❌ **DON'T**: Rely solely on this FAQ for tax or legal decisions
- ❌ **DON'T**: Assume CLARITY Act provisions (not yet law)
- ❌ **DON'T**: Ignore state tax implications (varies by state)

### Jurisdictional Differences

This FAQ focuses on **U.S. federal tax law**. If you're in:

- **Other countries**: Different tax rules apply entirely
- **U.S. states**: Additional state income tax may apply
- **Non-U.S. crypto users**: Consult local tax professionals

### Software Limitations

EthVaultPQ smart contracts:

- ✅ **CAN**: Enforce vesting schedules on-chain
- ✅ **CAN**: Implement lockup periods technically
- ✅ **CAN**: Prevent transfers until conditions met
- ❌ **CANNOT**: Provide legal advice
- ❌ **CANNOT**: File 83(b) elections for you
- ❌ **CANNOT**: Track your tax basis
- ❌ **CANNOT**: Generate tax forms (you need tax software/CPA)

### Professional Resources

Find qualified professionals:

**Tax Attorneys:**
- National Association of Tax Professionals: https://www.natptax.com
- American Bar Association Tax Section: https://www.americanbar.org/tax

**CPAs with Crypto Experience:**
- American Institute of CPAs (AICPA): https://www.aicpa.org
- Cryptocurrency CPAs: Search for crypto-specialized practices

**Legal Resources:**
- Startup lawyers: Cooley, Fenwick & West, Gunderson Dettmer, Goodwin
- Token/crypto specialists: Anderson Kill, Debevoise & Plimpton

**IRS Resources:**
- Publication 525: Taxable and Nontaxable Income
- Publication 551: Basis of Assets
- Virtual Currency Guidance: https://www.irs.gov/businesses/small-businesses-self-employed/virtual-currencies

---

## Summary Checklist

### Before Accepting Vesting Tokens

- [ ] Understand the vesting schedule
- [ ] Understand the lockup period (if any)
- [ ] Calculate potential 83(b) election benefits
- [ ] Consult tax attorney/CPA within first week
- [ ] File 83(b) within 30 days (if beneficial)
- [ ] Keep copies of all documents
- [ ] Set calendar reminders for vesting dates

### During Vesting Period

- [ ] Track each vesting event
- [ ] Document fair market value at each vesting
- [ ] Pay quarterly estimated taxes (if applicable)
- [ ] Claim vested tokens to your quantum-secure vault
- [ ] Update tax basis spreadsheet
- [ ] Monitor lockup expiration dates

### At Sale/Transfer

- [ ] Calculate cost basis (FMV at vesting or grant if 83(b))
- [ ] Determine holding period (long-term vs short-term)
- [ ] Report capital gains/losses on tax return
- [ ] Consider tax-loss harvesting strategies
- [ ] Keep transaction records for 7+ years

---

## Questions?

**For software/technical questions:**
- GitHub Issues: https://github.com/[your-repo]/issues
- Documentation: See `DEPLOYMENT_CHECKLIST.md`

**For legal/tax questions:**
- Consult qualified professionals
- Do NOT ask the development team for legal advice
- See professional resources listed above

---

**Document Version:** 1.0
**Last Updated:** October 21, 2025
**Status:** Educational Resource Only
**License:** MIT (software), CC BY 4.0 (documentation)

---

## Appendix: Quick Reference

### Vesting vs. Unlocking Table

| Time | Vested | Unlocked | Can Claim? | Can Transfer? | Tax Event? |
|------|--------|----------|------------|---------------|------------|
| Day 0 (with 83b) | 0% | 0% | No | No | Yes (all tokens) |
| Day 0 (no 83b) | 0% | 0% | No | No | No |
| Year 1 | 25% | 0% | Yes | No | If no 83(b) |
| Year 2 | 50% | 50% | Yes | Yes | If no 83(b) |
| Year 3 | 75% | 75% | Yes | Yes | If no 83(b) |
| Year 4 | 100% | 100% | Yes | Yes | If no 83(b) |

### Key Dates to Remember

| Event | Deadline | Consequence |
|-------|----------|-------------|
| 83(b) Election | 30 days from grant | Miss it = pay tax at each vesting |
| Quarterly Estimated Tax | 15th of Apr/Jun/Sep/Jan | Avoid penalties |
| Tax Return Filing | April 15 | Report all crypto income |
| Long-term Holding | >1 year from vesting | Lower capital gains rate |

---

**Remember:** When in doubt, ask a professional. The cost of advice is small compared to the cost of mistakes.
