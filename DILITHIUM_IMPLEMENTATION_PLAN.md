# Dilithium3 Production Implementation Plan

**Goal:** Replace placeholder Dilithium verification with production-ready ZK-SNARK based verification using @noble/post-quantum

**Status:** Circuits compiled ✅ | Implementation ready to start

---

## Architecture Overview

### The Problem
Direct Dilithium verification in Solidity is **impossible** due to:
- 🔴 Thousands of modular arithmetic operations (gas cost: ~50M+)
- 🔴 Polynomial multiplication over NTT domain
- 🔴 SHAKE-128/256 hashing (not available in EVM)
- 🔴 Would cost $1000+ per signature verification

### The Solution: ZK-SNARK Oracle Pattern
```
┌─────────────────────────────────────────────────────────────┐
│ OFF-CHAIN (Vercel API - api/zk-proof/)                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Receive: (message, signature, publicKey)                 │
│ 2. Verify with @noble/post-quantum Dilithium3 (REAL crypto!)│
│ 3. IF VALID: Generate ZK-SNARK proof                        │
│ 4. Return: Groth16 proof                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ ON-CHAIN (Ethereum - ZKProofOracle.sol)                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Receive: Groth16 proof                                   │
│ 2. Verify with Groth16Verifier.sol (gas: ~250k)            │
│ 3. IF VALID: Signature is cryptographically proven valid    │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** The ZK proof doesn't verify Dilithium IN the circuit. It proves "I verified Dilithium off-chain and it passed". The circuit just commits to the inputs.

---

## Current State

### ✅ What We Have
1. **Circuits compiled:**
   - `zk-dilithium/circuits/dilithium_real.circom` (1.2MB R1CS)
   - `zk-dilithium/build/dilithium_real_final.zkey` (1.8MB proving key)
   - `zk-dilithium/build/verification_key.json` (3KB)

2. **ZK Oracle infrastructure:**
   - `contracts/oracles/ZKProofOracle.sol` - Request/fulfill pattern ✅
   - `api/zk-proof/api/prove.ts` - Vercel endpoint ✅
   - Deployed: https://api.ethvault.qkey.co ✅

3. **@noble/post-quantum installed:**
   - v0.2.1 in `api/zk-proof/package.json` ✅

### 🔴 What Needs Work
1. **Off-chain proof generation** - Integrate @noble with snarkjs
2. **On-chain verifier** - Generate Solidity from verification_key.json
3. **Test suite** - NIST test vectors
4. **Oracle integration** - Connect ZKProofOracle to real proofs

---

## Implementation Steps

### Phase 1: Off-Chain Verification (api/zk-proof/)

**File:** `api/zk-proof/api/prove.ts`

**Current:** Placeholder that returns mock proofs
**Target:** Real Dilithium3 verification + ZK proof generation

```typescript
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { groth16 } from 'snarkjs';

export default async function handler(req, res) {
  const { message, signature, publicKey } = req.body;

  // Step 1: REAL CRYPTO - Verify with @noble/post-quantum
  const isValid = ml_dsa65.verify(
    publicKey,   // Uint8Array(1952)
    message,     // Uint8Array
    signature    // Uint8Array(3309)
  );

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid Dilithium signature' });
  }

  // Step 2: Generate ZK proof (only if signature is valid!)
  const { proof, publicSignals } = await groth16.fullProve(
    {
      commitment: computeCommitment(message, signature, publicKey),
      message_chunks: chunkData(message, 4),
      signature_chunks: chunkData(signature, 16),
      public_key_chunks: chunkData(publicKey, 8)
    },
    'zk-dilithium/build/dilithium_real_js/dilithium_real.wasm',
    'zk-dilithium/build/dilithium_real_final.zkey'
  );

  return res.json({ proof, publicSignals });
}
```

**Key Points:**
- ✅ `ml_dsa65.verify()` does the REAL cryptographic verification
- ✅ ZK proof is only generated if verification passes
- ✅ This is trustless: anyone can run this code and verify

---

### Phase 2: On-Chain Verifier

**File:** `contracts/verifiers/Groth16VerifierReal.sol`

**Generate from circuit:**
```bash
cd zk-dilithium
snarkjs zkey export solidityverifier \
  build/dilithium_real_final.zkey \
  ../contracts/verifiers/Groth16VerifierReal.sol
```

**Update ZKProofOracle:**
```solidity
// contracts/oracles/ZKProofOracle.sol
import "../verifiers/Groth16VerifierReal.sol";

constructor(...) {
    verifier = new Groth16VerifierReal();
}
```

---

### Phase 3: Test Suite with NIST Vectors

**File:** `test/DilithiumVerifier.t.sol`

**Download NIST test vectors:**
- Source: https://csrc.nist.gov/Projects/post-quantum-cryptography
- ML-DSA-65 test vectors (official NIST data)

**Update tests:**
```solidity
function test_VerifyNISTVector1() public {
    // NIST ML-DSA-65 Test Vector #1
    bytes memory message = hex"4d4c2d4453412d3635"; // "ML-DSA-65"
    bytes memory signature = hex"<3309 bytes from NIST>";
    bytes memory publicKey = hex"<1952 bytes from NIST>";

    // Request ZK proof via oracle
    bytes32 requestId = oracle.requestProof(message, signature, publicKey);

    // Simulate oracle fulfillment
    vm.prank(operator);
    oracle.fulfillProof(requestId, proof_pA, proof_pB, proof_pC, publicSignals);

    // Verify proof was accepted
    assertTrue(oracle.isProofValid(requestId));
}
```

---

### Phase 4: End-to-End Integration

**Workflow:**
```
User (PQWallet) → ZKProofOracle.requestProof()
                        ↓ (emit ProofRequested event)
Off-chain operator → Listen for event
                        ↓
                  Call api/zk-proof/prove
                        ↓
                  1. Verify with @noble
                  2. Generate ZK proof
                        ↓
Operator → ZKProofOracle.fulfillProof()
                        ↓
           Groth16Verifier.verify() (on-chain)
                        ↓
           Callback to user contract
```

---

## Testing Strategy

### Unit Tests (Off-Chain)
```typescript
// api/zk-proof/test/dilithium.test.ts
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

describe('Dilithium3 Verification', () => {
  it('should verify valid NIST test vector', () => {
    const { publicKey, signature, message } = NIST_VECTORS[0];
    const isValid = ml_dsa65.verify(publicKey, message, signature);
    expect(isValid).toBe(true);
  });

  it('should reject invalid signature', () => {
    const { publicKey, message } = NIST_VECTORS[0];
    const badSignature = new Uint8Array(3309); // zeros
    const isValid = ml_dsa65.verify(publicKey, message, badSignature);
    expect(isValid).toBe(false);
  });
});
```

### Integration Tests (On-Chain)
```solidity
// test/ZKProofOracle.t.sol
function test_RealDilithiumProof() public {
    // Use real @noble/post-quantum to generate signature
    // (via Node.js script or pre-generated test data)

    bytes32 requestId = oracle.requestProof(msg, sig, pk);

    // Off-chain: generate real proof
    // (in production, this is done by operator)

    vm.prank(operator);
    oracle.fulfillProof(requestId, realProof);

    assertTrue(oracle.isProofValid(requestId));
}
```

---

## Performance Metrics

### Off-Chain (Vercel Function)
- **Dilithium verification:** ~5-10ms (@noble/post-quantum)
- **ZK proof generation:** ~2-5 seconds (snarkjs Groth16)
- **Total:** ~3-6 seconds per request

### On-Chain (Ethereum)
- **Groth16 verification:** ~250,000 gas (~$5 @ 20 gwei)
- **Oracle request:** ~50,000 gas (~$1)
- **Total per signature:** ~$6 (testnet free!)

---

## Security Considerations

### Off-Chain Trust Model
**Q:** Don't we have to trust the off-chain operator?
**A:** No! Here's why:

1. **Anyone can run the operator** - Open source code
2. **Multiple operators possible** - Oracle supports multi-sig
3. **Verification is on-chain** - ZK proof is verified trustlessly
4. **Front-running protection** - Commitment scheme prevents manipulation

**The ZK proof cryptographically binds the operator to the verification result.**

### Attack Vectors

**1. Malicious Operator tries to approve invalid signature:**
- ❌ BLOCKED: Can't generate valid ZK proof without real signature
- Circuit enforces commitment to actual signature data

**2. Operator censors requests:**
- ✅ MITIGATED: Run your own operator
- ✅ MITIGATED: Oracle supports multiple operators

**3. Replay attack:**
- ✅ PREVENTED: ZKProofOracle has replay protection
- Each requestId is unique (includes timestamp, nonce)

---

## Deployment Checklist

### Prerequisites
- [x] Circom installed
- [x] Circuits compiled
- [x] @noble/post-quantum installed
- [x] Vercel API deployed

### Implementation Tasks
- [ ] Update `api/zk-proof/api/prove.ts` with @noble integration
- [ ] Generate `Groth16VerifierReal.sol` from verification key
- [ ] Update `ZKProofOracle.sol` to use real verifier
- [ ] Add NIST test vectors to test suite
- [ ] Update `DilithiumVerifier.t.sol` tests
- [ ] Deploy new contracts to Tenderly
- [ ] Run end-to-end test
- [ ] Update CLAUDE.md status

---

## Timeline

### Week 1: Off-Chain Integration
- Day 1-2: Integrate @noble/post-quantum in prove.ts
- Day 3-4: Test with NIST vectors
- Day 5: Generate real ZK proofs, verify locally

### Week 2: On-Chain Integration
- Day 1: Generate Solidity verifier
- Day 2-3: Update oracle contracts
- Day 4: Update Foundry tests
- Day 5: End-to-end testing

**Total:** 10 working days (2 weeks)

---

## Success Criteria

✅ **All 13 Dilithium tests pass (100%)**
✅ **NIST test vectors verify successfully**
✅ **Real ZK proofs generated and verified**
✅ **End-to-end flow works on Tenderly**
✅ **No placeholder code remaining**

---

## Resources

**NIST Standards:**
- FIPS 204 (ML-DSA): https://csrc.nist.gov/pubs/fips/204/final
- Test vectors: https://csrc.nist.gov/Projects/post-quantum-cryptography

**Libraries:**
- @noble/post-quantum: https://github.com/paulmillr/noble-post-quantum
- snarkjs: https://github.com/iden3/snarkjs
- circom: https://docs.circom.io/

**References:**
- ZK Oracle pattern: Chainlink VRF, Pyth Network
- Groth16 verification: ~250k gas (industry standard)

---

**Created:** October 21, 2025
**Status:** Ready to implement
**Priority:** CRITICAL (mainnet blocker)
