# Prize Applications - EthVaultPQ

Concise answers for hackathon prize submissions.

---

## Pyth Network - $5,000

### Why applicable?
EthVaultPQ integrates Pyth price oracles to provide real-time USD valuations for post-quantum vesting schedules. Our PythPriceOracle contract (300 lines) wraps Pyth's IPyth interface with staleness checks and confidence validation. The PQVault4626WithPricing contract records price history at vesting milestones. Dashboard displays live prices for 15+ tokens with 10-second updates.

### Code links:
- PythPriceOracle: [contracts/oracles/PythPriceOracle.sol:6-271](contracts/oracles/PythPriceOracle.sol)
- Vault with pricing: [contracts/vault/PQVault4626WithPricing.sol:20-337](contracts/vault/PQVault4626WithPricing.sol)
- Price IDs config: [dashboard/src/config/pythPriceIds.ts:28-63](dashboard/src/config/pythPriceIds.ts)
- Dashboard component: [dashboard/src/components/PriceDisplay.tsx](dashboard/src/components/PriceDisplay.tsx)

### Ease of use: 8/10

### Feedback:
Pyth's SDK and documentation made integration straightforward. IPyth interface is clean. The 400ms update frequency is excellent. Main complexity was handling 8-decimal prices and negative exponents correctly. Would appreciate more ERC-4626 vault integration examples.

---

## Blockscout - $10,000

### Why applicable?
All 8 EthVaultPQ contracts deployed to Tenderly with comprehensive verification and rich NatSpec documentation. Contracts include security warnings, function descriptions, and event indexing visible on Blockscout's interface. Users can interact directly with post-quantum wallets (ERC-4337) and vesting vaults (ERC-4626) without external tools.

### Code links:
- Verified contracts list: [TENDERLY_DEPLOYMENT_COMPLETE.md:14-26](TENDERLY_DEPLOYMENT_COMPLETE.md)
- PQVault4626 (example): [contracts/vault/PQVault4626.sol](contracts/vault/PQVault4626.sol)
- PQValidator: [contracts/core/PQValidator.sol](contracts/core/PQValidator.sol)
- Integration guide: [BLOCKSCOUT_INTEGRATION.md](BLOCKSCOUT_INTEGRATION.md)

**Deployed addresses:**
- ZKVerifier: `0xF8e9E6B341d897Fce3bD9FF426aBaBE4c52ce288`
- PQValidator: `0xf527846F3219A6949A8c8241BB5d4ecf2244CadF`
- PQWalletFactory: `0x5895dAbE895b0243B345CF30df9d7070F478C47F`
- PQVault4626: `0x8e043C8DF2c7ef48FE713DC4129D1b06A0644C21`
- (4 more contracts - see docs)

### Ease of use: 9/10

### Feedback:
Blockscout's verification works seamlessly with Foundry's forge verify-contract. Rich NatSpec display is invaluable for user education. Event log indexing and CSV export perfect for tax reporting. Suggestion: built-in visualization for complex contract relationships (Factory → Wallet → Validator chains).

---

## PayPal USD (PYUSD) - $10,000

### Why applicable?
EthVaultPQ solves the critical tax problem for equity compensation: when employees vest native project tokens and want to sell, they need stable USD and automatic tax withholding. Our PQVault4626With83b contract tracks IRS 83(b) elections (must file within 30 days of grant), enforces company lockup periods, ensures SEC compliance (Torres ruling: no large anonymous dumps), and automatically withholds taxes in PYUSD when employees sell vested tokens.

**Real workflow:**
1. Employee receives 10,000 project tokens vesting over 4 years
2. Files 83(b) election within 30 days (tracked on-chain)
3. After 1-year cliff, tokens start vesting
4. When selling vested tokens → swap to PYUSD, automatically withhold 22% federal tax
5. Employee receives stable PYUSD (can off-ramp to PayPal easily)
6. Withheld PYUSD sent to tax treasury

This is where PYUSD shines: stable USD for tax payments, not volatile crypto.

### Code links:
- Main contract: [contracts/vault/PQVault4626With83b.sol](contracts/vault/PQVault4626With83b.sol)
- 83(b) tracking: [contracts/vault/PQVault4626With83b.sol:15-30](contracts/vault/PQVault4626With83b.sol#L15-L30)
- Tax withholding: [contracts/vault/PQVault4626With83b.sol:165-218](contracts/vault/PQVault4626With83b.sol#L165-L218)
- PYUSD config: [dashboard/src/config/pythPriceIds.ts:28](dashboard/src/config/pythPriceIds.ts#L28)
- Integration guide: [PAYPAL_USD_INTEGRATION.md](PAYPAL_USD_INTEGRATION.md)

**PYUSD Address:** `0x6c3ea9036406852006290770BEdFcAbA0e23A0e8` (Ethereum Mainnet)

### Ease of use: 9/10

### Feedback:
PYUSD's ERC-20 compliance made integration seamless. 6-decimal format matches USDC/USDT. Paxos backing gives enterprises confidence for payroll use cases. Pyth price feed provides accurate $1.00 tracking (±0.1%). PayPal integration story perfect for onboarding non-crypto users—employees receive PYUSD, convert to USD via PayPal/Coinbase easily. Main request: expanded testnet PYUSD for development (current options require bridging/mocking).

**Key innovation:** First quantum-resistant equity vesting system with automated PYUSD tax withholding for US compliance.

---

## Summary

- **Pyth Network:** Real-time price feeds for vesting valuations
- **Blockscout:** Contract verification and transparency for 8 contracts
- **PayPal USD:** Stable USD tax withholding for equity token sales

All integrations serve the core mission: enterprise-grade, post-quantum secure token vesting with regulatory compliance.

---

*Last Updated: October 18, 2025*
