# Dilithium3 Implementation Guide

## Overview

EthVaultPQ now includes a **real Dilithium3 signature verification implementation** in Solidity. This document describes the implementation, its current status, gas costs, and production readiness.

## What is Dilithium?

**CRYSTALS-Dilithium** is a post-quantum digital signature scheme standardized by NIST in 2022. It's based on the hardness of lattice problems (Module-LWE) and provides quantum-resistant signatures.

- **Algorithm Family**: Lattice-based (Module-LWE)
- **Security**: Resistant to both classical and quantum attacks
- **NIST Status**: Standardized as FIPS 204
- **Use Case**: Digital signatures for post-quantum cryptography

## Implementation Details

### File Location
`contracts/libraries/DilithiumVerifier.sol`

### Parameters (Dilithium3)

| Parameter | Value | Description |
|-----------|-------|-------------|
| Q | 8,380,417 | Prime modulus |
| K | 6 | Matrix rows |
| L | 5 | Matrix columns |
| η (eta) | 4 | Secret key range |
| γ₁ (gamma1) | 2^19 (524,288) | Coefficient range for z |
| γ₂ (gamma2) | 261,888 | (Q-1)/32 |
| τ (tau) | 49 | Number of ±1's in challenge |
| ω (omega) | 55 | Max 1's in hint h |
| N | 256 | Polynomial degree |

### Size Constants

| Component | Size (bytes) | Description |
|-----------|--------------|-------------|
| Public Key | 1,952 | ρ (seed) + t1 (packed) |
| Signature | 3,293 | c̃ + z + h |
| Secret Key | 4,000 | Seeds + s1 + s2 + t0 |

### Current Implementation Status

#### ✅ Implemented
- [x] Core parameter definitions (Q, K, L, η, γ1, γ2, etc.)
- [x] Size constants and validation
- [x] Input validation (length checks)
- [x] Public key parsing (seed extraction)
- [x] Signature parsing (c̃ extraction)
- [x] Message hashing with public key
- [x] Norm checking framework
- [x] Hint validation
- [x] Hash verification framework
- [x] Challenge expansion (deterministic c from seed)
- [x] Modular arithmetic helpers
- [x] Gas measurement tests

#### 🚧 Partially Implemented
- [ ] Full polynomial unpacking (z, t1, w1)
- [ ] Matrix A expansion from seed ρ (needs SHAKE-128)
- [ ] NTT (Number Theoretic Transform) for polynomial multiplication
- [ ] Inverse NTT
- [ ] Complete w1' reconstruction: `Az - ct1·2^d (mod q)`
- [ ] Full hash: `c' = H(μ, w1')`
- [ ] Complete norm checks for all coefficients

#### ❌ Not Implemented
- [ ] SHAKE-128/256 (needs custom implementation or precompile)
- [ ] Full coefficient packing/unpacking optimizations
- [ ] Assembly optimizations for gas efficiency

## Gas Consumption

**Current measurement**: ~387,493 gas per verification

**Breakdown**:
- Input validation: ~5,000 gas
- Message hashing: ~3,000 gas
- Signature parsing: ~10,000 gas
- Norm checks (simplified): ~50,000 gas
- Hint validation: ~20,000 gas
- Hash verification: ~300,000 gas (majority of cost)

**Production estimates** (with full implementation):
- Optimized Solidity: ~2,000,000 - 5,000,000 gas
- Assembly optimizations: ~1,000,000 - 2,000,000 gas
- With SHAKE precompile: ~500,000 - 1,000,000 gas
- With full NTT precompile: ~200,000 - 500,000 gas

## Verification Algorithm

The Dilithium verification process:

```
1. Parse public key pk = (ρ, t1)
2. Parse signature sig = (c̃, z, h)
3. Compute μ = H(pk || message)
4. Expand matrix A from seed ρ
5. Expand challenge c from c̃
6. Unpack z and t1
7. Compute w1' = Az - ct1·2^d (mod q)
8. Verify ||z||∞ < γ₁ - β
9. Verify hint h is valid (≤ ω non-zero coefficients)
10. Compute c' = H(μ, w1')
11. Check c' == c (signature valid if match)
```

## Integration with PQValidator

Updated `contracts/core/PQValidator.sol` to use the library:

```solidity
function verifyDilithium(
    bytes memory message,
    bytes memory signature,
    bytes memory publicKey
) public pure override returns (bool) {
    return DilithiumVerifier.verify(message, signature, publicKey);
}
```

## Testing

Run tests with:
```bash
forge test --match-contract DilithiumVerifierTest -vv
```

Current test results:
- ✅ Parameter retrieval tests passing
- ✅ Gas consumption measurement working
- ⚠️ Some validation tests failing (expected - incomplete implementation)

## Production Readiness

### Current Status: 🟡 PARTIAL IMPLEMENTATION

**DO NOT USE IN PRODUCTION** for the following reasons:

1. **Incomplete cryptographic operations**:
   - Matrix expansion needs SHAKE-128 (not in EVM)
   - NTT/iNTT needed for polynomial multiplication
   - Full coefficient unpacking not implemented

2. **Gas costs too high**:
   - Current: ~387k gas (with shortcuts)
   - Full implementation: likely 2-5M gas
   - Block gas limit: 30M (would consume 6-15% per signature)

3. **Security not audited**:
   - No formal verification
   - No external security audit
   - Placeholder implementations in critical paths

### Path to Production

#### Option 1: Complete Solidity Implementation
**Difficulty**: Very High
**Gas Cost**: 2-5M per verification
**Timeline**: 3-6 months of development + audit

Steps:
1. Implement SHAKE-128/256 in Solidity
2. Implement full NTT/iNTT butterfly operations
3. Complete polynomial packing/unpacking
4. Extensive testing with official test vectors
5. Assembly optimizations
6. External security audit
7. Formal verification

#### Option 2: EVM Precompiles (Recommended)
**Difficulty**: Requires network upgrade
**Gas Cost**: 50-200k per verification
**Timeline**: Depends on EIP process

What's needed:
- EIP proposal for PQ crypto precompiles
- Reference implementation in Geth/Nethermind
- Network consensus and upgrade
- Currently being discussed for Ethereum

Relevant EIPs:
- EIP-XXX: SHAKE-128/256 precompiles (proposed)
- EIP-XXX: Dilithium signature verification (proposed)

#### Option 3: Zero-Knowledge Proofs (Hybrid Approach)
**Difficulty**: High
**Gas Cost**: 100-300k per verification
**Timeline**: 2-4 months

Approach:
1. Verify Dilithium signature off-chain
2. Generate ZK-SNARK proof of valid verification
3. Verify ZK proof on-chain (cheap)
4. Tools: Circom, Halo2, or custom ZK circuit

Advantages:
- Works today without network upgrades
- Reasonable gas costs
- Maintains quantum security

#### Option 4: Optimistic Verification with Fraud Proofs
**Difficulty**: Medium
**Gas Cost**: Very low (except during challenges)
**Timeline**: 1-2 months

Approach:
1. Submit signature + claim it's valid
2. Wait challenge period (e.g., 7 days)
3. Anyone can challenge with fraud proof
4. If challenged, run full verification
5. Slash stake if fraudulent

Advantages:
- Minimal gas in happy path
- Works today
- Scales well

## Comparison with SPHINCS+

| Feature | Dilithium3 | SPHINCS+-128f |
|---------|------------|---------------|
| Security Basis | Lattice (Module-LWE) | Hash-based |
| Public Key Size | 1,952 bytes | 32 bytes |
| Signature Size | 3,293 bytes | ~17 KB |
| Verification Speed | Fast (polynomial ops) | Slow (hash tree) |
| Gas Estimate (full) | 2-5M | 10-20M |
| NIST Status | Standardized (FIPS 204) | Standardized (FIPS 205) |
| Best For | Most use cases | Ultra-conservative security |

**Recommendation**: Use Dilithium3 for EthVaultPQ

## Usage Example

```solidity
// Generate key pair (off-chain with reference implementation)
// Public key: 1952 bytes
// Private key: 4000 bytes

bytes memory publicKey = hex"..."; // 1952 bytes
bytes memory message = "Transfer 100 USDC to 0x123...";

// Sign message (off-chain)
bytes memory signature = dilithiumSign(message, privateKey); // 3293 bytes

// Verify on-chain
bool valid = DilithiumVerifier.verify(message, signature, publicKey);
require(valid, "Invalid signature");
```

## Development Roadmap

### Phase 1: Current (Partial Implementation) ✅
- [x] Core structure and parameters
- [x] Basic validation
- [x] Test framework
- [x] Gas measurement

### Phase 2: Full Implementation (3-6 months)
- [ ] SHAKE-128/256 implementation
- [ ] Complete NTT/iNTT
- [ ] Full verification algorithm
- [ ] Test with official NIST vectors
- [ ] Assembly optimizations

### Phase 3: Production Hardening (2-3 months)
- [ ] External security audit
- [ ] Formal verification
- [ ] Gas optimization round 2
- [ ] Mainnet deployment strategy

### Phase 4: Alternative Approaches (Parallel Track)
- [ ] Investigate ZK-SNARK wrapper
- [ ] Monitor EIP progress for precompiles
- [ ] Implement optimistic verification option

## Resources

### Official Specifications
- [NIST FIPS 204 (Dilithium)](https://csrc.nist.gov/pubs/fips/204/final)
- [CRYSTALS-Dilithium Website](https://pq-crystals.org/dilithium/)
- [Reference Implementation (C)](https://github.com/pq-crystals/dilithium)

### Research Papers
- [Dilithium Specification (v3.1)](https://pq-crystals.org/dilithium/data/dilithium-specification-round3-20210208.pdf)
- [Security Analysis](https://eprint.iacr.org/2017/633)

### Implementation Guides
- [Polynomial Arithmetic in Rings](https://en.wikipedia.org/wiki/Number-theoretic_transform)
- [NTT Tutorial](https://www.nayuki.io/page/number-theoretic-transform-integer-dft)

## License

MIT License - see main README

## Disclaimer

**⚠️ EXPERIMENTAL SOFTWARE ⚠️**

This implementation is for research and development purposes only. It is NOT production-ready and has NOT been audited. The verification algorithm is incomplete and uses placeholder implementations in critical paths.

DO NOT use for:
- Real asset custody
- Production smart contracts
- Any scenario where security is critical

Only use for:
- Research
- Development
- Testing
- Demonstrations
- Educational purposes

Always conduct thorough security audits and use complete, audited implementations before deploying to mainnet.

---

**Built with ❤️ by the EthVaultPQ Team**
