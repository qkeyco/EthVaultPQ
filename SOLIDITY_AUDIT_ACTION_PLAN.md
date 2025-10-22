# Solidity Audit Action Plan - Grok 4 Findings

**Audit Date:** October 21, 2025
**Auditor:** Grok 4 (xAI)
**Overall Score:** 7/10
**Status:** Testnet Ready / Mainnet Requires Fixes

---

## Executive Summary

The Grok 4 audit of our Solidity contracts identified **critical security issues** that must be addressed before mainnet deployment. While the codebase demonstrates good security practices (OpenZeppelin libraries, post-quantum focus), there are **NIST parameter mismatches** and **oracle/vault vulnerabilities** that pose exploit risks.

**Key Strengths:**
- ✅ OpenZeppelin security libraries (Ownable, ReentrancyGuard, Pausable)
- ✅ ERC-4337 and ERC-4626 compliance
- ✅ Innovative post-quantum + ZK-SNARK integration
- ✅ Pay-per-use oracle models

**Critical Weaknesses:**
- 🔴 NIST PQC constants incorrect (signature size mismatches)
- 🔴 ERC-4626 inflation attack vulnerability
- 🔴 Oracle reentrancy risks
- 🔴 Incomplete cryptographic testing

---

## Priority Matrix

| Priority | Issue | Impact | Effort | Deadline |
|----------|-------|--------|--------|----------|
| **P0** | NIST PQC parameter fixes | High | Low | Week 1 |
| **P0** | ERC-4626 inflation protection | High | Medium | Week 1 |
| **P1** | Oracle reentrancy guards | Medium | Low | Week 2 |
| **P1** | Pyth price validation | Medium | Medium | Week 2 |
| **P2** | Gas optimizations | Low | Medium | Week 3 |
| **P2** | Access control timelocks | Low | High | Week 3 |
| **P3** | Complete test coverage | Info | High | Week 4 |

---

## P0: Critical Fixes (Block Mainnet)

### 1. NIST PQC Parameter Mismatches ⚠️

**File:** `contracts/libraries/PQConstants.sol`
**Severity:** HIGH (Signature Forgery Risk)

**Issue:**
ML-DSA (Dilithium) signature sizes do not match finalized NIST FIPS 204 (August 2024):

| Variant | Current | NIST Correct | Delta |
|---------|---------|--------------|-------|
| ML-DSA-44 (Dilithium2) | 2420 | 2420 | ✅ OK |
| ML-DSA-65 (Dilithium3) | **3293** | **3309** | ❌ -16 bytes |
| ML-DSA-87 (Dilithium5) | **4595** | **4627** | ❌ -32 bytes |

**Impact:**
- Buffer overflows when verifying real Dilithium signatures
- Incompatibility with standard libraries (@noble/post-quantum uses 3309)
- Invalid signatures could be accepted/rejected incorrectly
- Potential signature forgery or DoS attacks

**Root Cause:**
Constants based on draft NIST spec (pre-August 2024 finalization).

**Fix Required:**
```solidity
// contracts/libraries/PQConstants.sol (Lines 14-20)

// CURRENT (WRONG):
uint256 public constant DILITHIUM3_SIGNATURE_SIZE = 3293;
uint256 public constant DILITHIUM5_SIGNATURE_SIZE = 4595;

// CORRECT (NIST FIPS 204):
uint256 public constant DILITHIUM3_SIGNATURE_SIZE = 3309; // ML-DSA-65
uint256 public constant DILITHIUM5_SIGNATURE_SIZE = 4627; // ML-DSA-87
```

**Verification:**
- Cross-reference NIST FIPS 204 PDF (Table 1, Page 15)
- Test with @noble/post-quantum v0.2.0
- Run integration tests with real signatures

**Testing:**
```bash
# After fix, verify all tests pass:
forge test --match-contract DilithiumVerifier -vvv
```

**References:**
- NIST FIPS 204: https://csrc.nist.gov/pubs/fips/204/final
- OpenQuantumSafe docs: https://openquantumsafe.org/liboqs/algorithms/sig/dilithium.html

---

### 2. ERC-4626 Inflation Attack Vulnerability 🔴

**File:** `contracts/vaults/PQVault4626.sol`
**Severity:** HIGH (Yield Theft)

**Issue:**
Classic ERC-4626 first-depositor attack:
1. Attacker deposits 1 wei, gets 1 share
2. Attacker donates 1000 ETH directly to vault (not via deposit)
3. Share price inflates to 1 share = 1000 ETH
4. Victim deposits 999 ETH, gets 0 shares (rounds down)
5. Attacker redeems 1 share for 1999 ETH (steals victim's 999 ETH)

**Impact:**
- Early users can steal yield from later depositors
- DoS on small deposits (all round to 0 shares)
- Violates ERC-4626 security assumptions

**Current Code (Vulnerable):**
```solidity
function _convertToShares(uint256 assets, Math.Rounding rounding)
    internal
    view
    virtual
    override
    returns (uint256)
{
    return assets.mulDiv(totalSupply() + 10 ** _decimalsOffset(), totalAssets() + 1, rounding);
    // ^ No virtual shares, first deposit gets 1:1 ratio
}
```

**Fix Required:**
Add virtual shares offset in constructor to prevent inflation:

```solidity
// Add at top of contract:
uint256 private constant VIRTUAL_SHARES = 1e3; // 1000 virtual shares
uint256 private constant VIRTUAL_ASSETS = 1;   // 1 wei virtual asset

constructor(
    IERC20 asset_,
    string memory name_,
    string memory symbol_
) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
    // Mint virtual shares to address(0) to prevent inflation attack
    _mint(address(0), VIRTUAL_SHARES);

    // Also enforce minimum deposit
}

function deposit(uint256 assets, address receiver)
    public
    virtual
    override
    returns (uint256)
{
    require(assets >= 1e15, "Deposit too small"); // Min 0.001 ETH
    return super.deposit(assets, receiver);
}
```

**Alternative Fix (OpenZeppelin Pattern):**
```solidity
function _convertToShares(uint256 assets, Math.Rounding rounding)
    internal
    view
    virtual
    override
    returns (uint256)
{
    uint256 supply = totalSupply();
    // Add virtual offset for first deposit protection
    return (assets == 0 || supply == 0)
        ? assets
        : assets.mulDiv(supply + VIRTUAL_SHARES, totalAssets() + VIRTUAL_ASSETS, rounding);
}
```

**Testing:**
```solidity
// test/PQVault4626.t.sol - Add this test:
function test_InflationAttackPrevention() public {
    // Attacker deposits 1 wei
    vm.prank(attacker);
    vault.deposit(1, attacker);

    // Attacker donates 1000 ether directly
    vm.prank(attacker);
    asset.transfer(address(vault), 1000 ether);

    // Victim tries to deposit 999 ether
    vm.prank(victim);
    uint256 shares = vault.deposit(999 ether, victim);

    // Victim should get reasonable shares (not 0)
    assertGt(shares, 0, "Victim got 0 shares - inflation attack!");

    // Attacker shouldn't be able to steal victim's funds
    vm.prank(attacker);
    uint256 redeemed = vault.redeem(vault.balanceOf(attacker), attacker, attacker);
    assertLt(redeemed, 2 ether, "Attacker stole funds!");
}
```

**References:**
- OpenZeppelin ERC-4626 Security: https://docs.openzeppelin.com/contracts/4.x/erc4626#inflation-attack
- Mixbytes audit: https://mixbytes.io/blog/overview-of-the-inflation-attack

---

## P1: High Priority Fixes (Before Testnet Mainnet)

### 3. Oracle Reentrancy Vulnerability 🟡

**Files:**
- `contracts/oracles/ZKProofOracle.sol`
- `contracts/oracles/QRNGOracle.sol`

**Severity:** MEDIUM (State Corruption Risk)

**Issue:**
`fulfillProof()` and `fulfillRandomness()` call external consumer contracts without reentrancy protection:

```solidity
// ZKProofOracle.sol (Line ~150)
function fulfillProof(uint256 requestId, bool isValid) external onlyOwner {
    ProofRequest storage request = proofRequests[requestId];
    request.fulfilled = true;
    request.isValid = isValid;

    // VULNERABLE: External call without ReentrancyGuard
    IProofConsumer(request.requester).handleProof(requestId, isValid);
    // ^ If handleProof() reenters, state could be corrupted
}
```

**Attack Scenario:**
1. Malicious consumer implements `handleProof()` with reentrancy
2. During callback, attacker calls `fulfillProof()` again
3. State mutations could be replayed or bypassed

**Fix Required:**
Add `nonReentrant` modifier to all external-calling functions:

```solidity
// contracts/oracles/ZKProofOracle.sol
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ZKProofOracle is Ownable, ReentrancyGuard {
    // ... existing code ...

    function fulfillProof(uint256 requestId, bool isValid)
        external
        onlyOwner
        nonReentrant  // ADD THIS
    {
        ProofRequest storage request = proofRequests[requestId];
        require(!request.fulfilled, "Already fulfilled");

        request.fulfilled = true;
        request.isValid = isValid;

        // Safe: nonReentrant prevents reentrancy during callback
        IProofConsumer(request.requester).handleProof(requestId, isValid);

        emit ProofFulfilled(requestId, isValid);
    }
}

// Same fix for QRNGOracle.sol::fulfillRandomness()
```

**Testing:**
```solidity
// test/ZKProofOracle.t.sol
contract MaliciousConsumer is IProofConsumer {
    ZKProofOracle public oracle;
    uint256 public attackRequestId;

    function handleProof(uint256 requestId, bool isValid) external {
        // Attempt reentrancy
        oracle.fulfillProof(attackRequestId, true);
    }
}

function test_ReentrancyProtection() public {
    MaliciousConsumer attacker = new MaliciousConsumer();
    attacker.attackRequestId = 1;

    vm.prank(address(attacker));
    oracle.requestProof(bytes("test"), bytes("sig"), bytes("pk"));

    vm.expectRevert("ReentrancyGuard: reentrant call");
    oracle.fulfillProof(1, true);
}
```

---

### 4. Pyth Oracle Price Manipulation Risk 🟡

**File:** `contracts/oracles/PythPriceOracle.sol`
**Severity:** MEDIUM (Price Manipulation)

**Issue:**
Multiple security gaps in price fetching:
1. Uses `getPriceUnsafe()` without update fee payment (stale prices)
2. No Verifiable Merkle Accumulator (VMA) validation
3. Minimum confidence set to 1% (too lax for high-value vaults)
4. No handling of negative prices (Pyth uses signed int64)

**Current Code (Vulnerable):**
```solidity
function _validatePrice(PythStructs.Price memory price) private view {
    require(price.price > 0, "Invalid price");
    // ^ Negative prices not handled!

    require(price.conf * 10000 / uint64(price.price) <= minConfidenceBps, "Low confidence");
    // ^ 1% confidence too low for DeFi
}
```

**Fix Required:**
```solidity
// 1. Always use getPrice() (pays for updates)
function getLatestPrice() public payable returns (int64 price, uint64 publishTime) {
    // OLD: bytes memory priceData = pyth.getPriceUnsafe(priceId);

    // NEW: Pay for update to ensure freshness
    bytes[] memory updateData = new bytes[](1);
    updateData[0] = pyth.getUpdateData(priceId);

    uint256 updateFee = pyth.getUpdateFee(updateData);
    require(msg.value >= updateFee, "Insufficient fee");

    pyth.updatePriceFeeds{value: updateFee}(updateData);
    PythStructs.Price memory priceStruct = pyth.getPrice(priceId);

    return (priceStruct.price, priceStruct.publishTime);
}

// 2. Handle negative prices
function _validatePrice(PythStructs.Price memory price) private view {
    // Use absolute value for negative prices (e.g., inverse pairs)
    int64 absPrice = price.price < 0 ? -price.price : price.price;
    require(absPrice > 0, "Invalid price");

    // Increase confidence requirement to 0.5% (50 bps)
    require(price.conf * 10000 / uint64(absPrice) <= 50, "Low confidence");

    // Add staleness check (max 60 seconds old)
    require(block.timestamp - price.publishTime <= 60, "Price too stale");
}

// 3. Add EMA/TWAP for smoothing
uint256 private constant EMA_ALPHA = 80; // 80% weight on new price
int64 private emaPrice;

function updateEMA(int64 newPrice) private {
    if (emaPrice == 0) {
        emaPrice = newPrice;
    } else {
        emaPrice = int64((int256(newPrice) * EMA_ALPHA + int256(emaPrice) * (100 - EMA_ALPHA)) / 100);
    }
}
```

**Testing:**
```solidity
function test_StalePrice() public {
    // Mock stale price (2 minutes old)
    vm.warp(block.timestamp + 120);

    vm.expectRevert("Price too stale");
    oracle.getLatestPrice();
}

function test_NegativePrice() public {
    // Some Pyth pairs have negative prices
    // Should handle via absolute value
    int64 negPrice = -100000000;
    // Test that abs() is used correctly
}
```

---

## P2: Medium Priority (Optimization & Hardening)

### 5. Gas Optimizations

**Files:** Multiple
**Severity:** LOW (Cost Inefficiency)

**Issues:**
1. **Storage reads in loops** (QRNGOracle.sol)
2. **Block.number used for vesting** (vulnerable to reorgs)
3. **No storage caching**

**Fixes:**
```solidity
// QRNGOracle.sol - Cache storage
function requestMultipleRandomness(uint256 count) external {
    uint256 _nextRequestId = nextRequestId; // Cache storage
    for (uint256 i = 0; i < count; i++) {
        _createRequest(_nextRequestId + i);
    }
    nextRequestId = _nextRequestId + count; // Single write
}

// PQVault4626.sol - Add timestamp fallback
function _getVestingProgress(address account) internal view returns (uint256) {
    VestingSchedule memory schedule = vestingSchedules[account];

    // Use block.number primarily, timestamp as fallback for reorgs
    uint256 currentBlock = block.number;
    if (block.number - schedule.startBlock > 100) {
        // Reorg unlikely after 100 blocks, switch to timestamp
        currentBlock = (block.timestamp - schedule.startTimestamp) / 12 + schedule.startBlock;
    }

    // Rest of logic...
}
```

---

### 6. Access Control Hardening

**Files:** All oracles/vaults
**Severity:** LOW (Centralization Risk)

**Issue:**
- Single `Ownable` owner (no multisig)
- No timelocks on critical functions (e.g., `setPriceId`)
- Free users in `ZKProofOracle` could be abused

**Fixes:**
```solidity
// Add TimelockController
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract PythPriceOracle is Ownable {
    TimelockController public timelock;

    modifier onlyTimelock() {
        require(msg.sender == address(timelock), "Not timelock");
        _;
    }

    function setPriceId(bytes32 newPriceId) external onlyOwner onlyTimelock {
        // 48-hour delay enforced by timelock
        priceId = newPriceId;
    }
}

// Add rate limiting to free oracle usage
mapping(address => uint256) public lastFreeRequest;
uint256 public constant FREE_REQUEST_COOLDOWN = 1 hours;

function requestProof(...) external {
    if (!subscriptions[msg.sender].active) {
        require(block.timestamp - lastFreeRequest[msg.sender] >= FREE_REQUEST_COOLDOWN, "Cooldown");
        lastFreeRequest[msg.sender] = block.timestamp;
    }
    // ...
}
```

---

## P3: Testing & Documentation

### 7. Complete Cryptographic Tests

**File:** `test/DilithiumVerifier.t.sol`
**Severity:** INFORMATIONAL

**Issue:**
Tests use placeholders with no real cryptographic verification:
```solidity
// Current (WRONG):
bytes memory validSig = new bytes(3293);
for (uint i = 0; i < validSig.length; i++) {
    validSig[i] = bytes1(uint8(i % 256)); // Deterministic fill
}
```

**Fix Required:**
Use real NIST test vectors from FIPS 204:

```solidity
// test/DilithiumVerifier.t.sol
// Download test vectors: https://csrc.nist.gov/Projects/post-quantum-cryptography/post-quantum-cryptography-standardization/example-files

function test_VerifyNISTTestVector1() public {
    // ML-DSA-65 (Dilithium3) Test Vector #1
    bytes memory message = hex"4d4c2d4453412d3635"; // "ML-DSA-65"
    bytes memory signature = hex"<3309 byte signature from NIST>";
    bytes memory publicKey = hex"<1952 byte pubkey from NIST>";

    bool valid = DilithiumVerifier.verify(message, signature, publicKey);
    assertTrue(valid, "NIST vector should verify");
}

function test_VerifyWithNobleLibrary() public {
    // Use @noble/post-quantum to generate real signatures in setup
    // Then verify in Solidity
}
```

---

## Implementation Timeline

### Week 1 (P0 - Critical)
- [ ] Day 1-2: Fix NIST PQC constants
- [ ] Day 3-4: Implement ERC-4626 inflation protection
- [ ] Day 5: Run full test suite, verify no regressions

### Week 2 (P1 - High Priority)
- [ ] Day 1-2: Add reentrancy guards to oracles
- [ ] Day 3-4: Fix Pyth oracle price validation
- [ ] Day 5: Integration testing with real oracles

### Week 3 (P2 - Optimizations)
- [ ] Day 1-2: Gas optimizations
- [ ] Day 3-4: Timelock + multisig setup
- [ ] Day 5: Deploy to Tenderly testnet

### Week 4 (P3 - Testing)
- [ ] Day 1-3: Complete NIST test vectors
- [ ] Day 4-5: Slither, Mythril, Manticore scans
- [ ] Weekend: Bug bounty prep

---

## Testing Checklist

**After Each Fix:**
```bash
# 1. Unit tests
forge test --match-contract <ContractName> -vvv

# 2. Integration tests
forge test --fork-url $TENDERLY_RPC -vvv

# 3. Coverage (target >95%)
forge coverage

# 4. Static analysis
slither . --exclude-dependencies

# 5. Gas report
forge test --gas-report

# 6. Formal verification (if available)
certora verify specs/<contract>.spec
```

**Before Mainnet:**
- [ ] All tests passing (100%)
- [ ] Slither: 0 high/medium findings
- [ ] Coverage: >95%
- [ ] Formal audit: $50k-100k (Trail of Bits, OpenZeppelin, Consensys Diligence)
- [ ] Bug bounty: Immunefi ($25k+ rewards)
- [ ] Multisig setup: 3-of-5 Gnosis Safe
- [ ] Timelock: 48-hour minimum

---

## External Resources

**NIST Standards:**
- FIPS 204 (ML-DSA): https://csrc.nist.gov/pubs/fips/204/final
- FIPS 205 (SLH-DSA): https://csrc.nist.gov/pubs/fips/205/final

**Security References:**
- OWASP Smart Contract Top 10 (2025): https://owasp.org/
- OpenZeppelin Security: https://docs.openzeppelin.com/contracts/4.x/
- Consensys Best Practices: https://consensys.github.io/smart-contract-best-practices/

**Audit Firms (Recommended):**
1. Trail of Bits - $80k-120k, 4-6 weeks
2. OpenZeppelin - $60k-100k, 3-4 weeks
3. Consensys Diligence - $70k-110k, 4-5 weeks

---

## Risk Assessment (Current)

| Category | Risk | Mitigation Status |
|----------|------|-------------------|
| Signature Forgery | 🔴 HIGH | ⏳ PENDING (P0) |
| Inflation Attack | 🔴 HIGH | ⏳ PENDING (P0) |
| Oracle Manipulation | 🟡 MEDIUM | ⏳ PENDING (P1) |
| Reentrancy | 🟡 MEDIUM | ⏳ PENDING (P1) |
| Gas Griefing | 🟢 LOW | ⏳ PENDING (P2) |
| Centralization | 🟢 LOW | ⏳ PENDING (P2) |

**Mainnet Ready:** 🔴 NO (requires all P0/P1 fixes + audit)
**Testnet Ready:** 🟡 YES (with monitoring)

---

**Last Updated:** October 21, 2025
**Next Review:** After P0 fixes (Week 1)
**Contact:** Security team / james@ethvaultpq.com
