# Real Dilithium3 Implementation Plan

**Status:** 🔴 IN PROGRESS - NO MOCKS ALLOWED
**Deadline:** End of week (Oct 20-27, 2025)
**Priority:** CRITICAL

---

## Current Problem

All Dilithium verification is **PLACEHOLDER/MOCK**:
- ❌ API just checks if signature is non-zero
- ❌ ZK circuits don't do real crypto
- ❌ Proofs are hardcoded mock values

**This is a critical security vulnerability!**

---

## Solution: Use @noble/post-quantum

### Library Selection

**Winner:** `@noble/post-quantum` by Paul Miller

**Why:**
- ✅ Audited implementation
- ✅ FIPS-204 ML-DSA (official NIST standard)
- ✅ Fast (272 sign ops/sec, 546 verify ops/sec)
- ✅ Minimal (16KB gzipped)
- ✅ Tree-shakeable
- ✅ TypeScript support
- ✅ Well-maintained (updated for NIST standardization)

**npm:** https://www.npmjs.com/package/@noble/post-quantum
**GitHub:** https://github.com/paulmillr/noble-post-quantum

---

## Implementation Tasks

### Phase 1: API Layer (1-2 hours)

**File:** `api/zk-proof/index.ts`

1. ✅ Install @noble/post-quantum
2. ✅ Replace placeholder `verifyDilithiumSignature()` with real verification
3. ✅ Use ML-DSA-65 (Dilithium3 equivalent)
4. ✅ Test with real signatures

**Code change:**
```typescript
// BEFORE (MOCK):
const notAllZeros = signature.some(byte => byte !== 0);
return notAllZeros;

// AFTER (REAL):
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
return ml_dsa65.verify(publicKey, message, signature);
```

---

### Phase 2: ZK Circuit (2-4 hours compile time)

**File:** `zk-dilithium/circuits/dilithium_verifier.circom`

**Options:**

#### Option A: Simplified but Real (Recommended for deadline)
- Use Poseidon hash of signature components
- Verify signature off-chain, prove knowledge in ZK
- Faster to implement and compile

#### Option B: Full Dilithium in Circuit (Advanced)
- Implement full Dilithium verification in circom
- Very complex, very slow to compile
- May exceed circuit constraints

**Recommendation:** Start with Option A, upgrade to B later

---

### Phase 3: Proof Generation (30 min)

**File:** `api/zk-proof/index.ts`

1. ✅ Verify signature with @noble/post-quantum
2. ✅ Generate real ZK proof with snarkjs
3. ✅ Return real proof (not mock)

**Flow:**
```
1. Receive: message, signature, publicKey
2. Verify: ml_dsa65.verify(publicKey, message, signature)
3. If valid: Generate ZK proof
4. Return: Real Groth16 proof
```

---

### Phase 4: Testing (1 hour)

**Tests needed:**
1. ✅ Generate real Dilithium3 keypair
2. ✅ Sign test message
3. ✅ Verify signature with @noble/post-quantum
4. ✅ Generate ZK proof
5. ✅ Verify ZK proof on-chain
6. ✅ Test invalid signatures are rejected

---

### Phase 5: Integration (30 min)

**Files to update:**
- `contracts/oracles/ZKProofOracle.sol` (already correct)
- `api/zk-proof/package.json` (add @noble/post-quantum)
- `zk-dilithium/README.md` (update docs)
- Documentation (remove "placeholder" warnings)

---

## Timeline Estimate

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Install @noble/post-quantum | 5 min | ⏳ Next |
| 2 | Implement real verification | 30 min | ⏳ Pending |
| 3 | Test verification works | 15 min | ⏳ Pending |
| 4 | Update ZK circuit | 1 hour | ⏳ Pending |
| 5 | Compile circuit | 2-4 hours | ⏳ Pending |
| 6 | Generate real proofs | 30 min | ⏳ Pending |
| 7 | End-to-end testing | 1 hour | ⏳ Pending |
| 8 | Deploy to Tenderly | 30 min | ⏳ Pending |
| **TOTAL** | | **5.5-7.5 hours** | |

**Can be done in 1 day!**

---

## Technical Details

### ML-DSA-65 Parameters (Dilithium3)

| Parameter | Value |
|-----------|-------|
| Public Key | 1952 bytes |
| Signature | 3293 bytes |
| Security Level | NIST Level 3 (~192-bit) |
| FIPS Standard | FIPS-204 |

### API Usage

```typescript
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

// Generate keypair
const { publicKey, secretKey } = ml_dsa65.keygen();

// Sign
const signature = ml_dsa65.sign(secretKey, message);

// Verify (THIS IS WHAT WE NEED)
const isValid = ml_dsa65.verify(publicKey, message, signature);
```

---

## Success Criteria

✅ **Phase 1 Complete When:**
- API uses @noble/post-quantum for verification
- Real signatures pass, invalid signatures fail
- No more "check if non-zero" code

✅ **Phase 2 Complete When:**
- ZK circuit compiles successfully
- Circuit proves real signature verification
- No mock/placeholder logic

✅ **Phase 3 Complete When:**
- API generates real ZK proofs
- Proofs verify on-chain
- No hardcoded proof values

✅ **Full Success When:**
- End-to-end test passes:
  1. Generate real Dilithium keypair
  2. Sign message
  3. Send to API
  4. API verifies signature (real)
  5. API generates ZK proof (real)
  6. Proof verifies on Tenderly
  7. Invalid signatures are rejected

---

## Risks & Mitigation

### Risk 1: Circuit Too Complex
**Problem:** Full Dilithium in circuit exceeds constraints
**Mitigation:** Use simplified circuit that proves knowledge of valid signature

### Risk 2: Compilation Takes Too Long
**Problem:** Circuit compilation takes 8+ hours
**Mitigation:** Use smaller circuit, compile on powerful machine, or use cloud VM

### Risk 3: Library Incompatibility
**Problem:** @noble/post-quantum doesn't work in Vercel
**Mitigation:** Test locally first, use dilithium-crystals-js as backup

---

## Alternative Libraries (Backup)

If @noble/post-quantum doesn't work:

1. **dilithium-crystals-js** (Feb 2025)
   - npm: dilithium-crystals-js
   - Also supports Dilithium3
   - Good TypeScript support

2. **Official WASM** (Fastest)
   - Compile official C implementation to WASM
   - Fastest but more complex integration

---

## Next Steps

1. ✅ Add task to todo list
2. ✅ Update claude.md with "NO MOCKS" requirement
3. ⏳ Install @noble/post-quantum
4. ⏳ Implement real verification
5. ⏳ Test and validate
6. ⏳ Update ZK circuit
7. ⏳ Deploy to Tenderly

---

**Created:** October 20, 2025
**Author:** Claude (following user directive: "no mocks allowed")
**Status:** Ready to implement
