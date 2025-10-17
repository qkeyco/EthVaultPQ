# Multi-Signature Support Analysis
## Post-Quantum Multi-Sig for PQValidator

### Executive Summary

Analysis of multi-signature support requirements for the PQValidator system. Multi-sig adds significant complexity and gas costs to post-quantum cryptography, but provides critical security benefits for high-value operations.

**Recommendation:** Implement threshold-based multi-sig support with off-chain signature aggregation and on-chain verification.

---

## Current Architecture

### Single Signature Flow:
```
User Operation → PQ Wallet → PQValidator.verifySignature() → Dilithium/SPHINCS+ verification
```

**Pros:**
- ✅ Simple architecture
- ✅ Low gas cost (~250k for ZK proof)
- ✅ Fast verification

**Cons:**
- ❌ Single point of failure
- ❌ No social recovery
- ❌ All-or-nothing security model

---

## Multi-Sig Requirements

### Use Cases:

1. **Corporate Wallets:** 3-of-5 threshold for treasury management
2. **Social Recovery:** 2-of-3 guardians can recover lost key
3. **High-Value Transactions:** Require multiple approvals for large transfers
4. **Shared Custody:** Joint accounts requiring multiple parties

### Security Goals:

- **Threshold Signatures:** M-of-N signers required
- **Key Rotation:** Support adding/removing signers
- **Replay Protection:** Each signature valid for single use
- **Quantum Resistance:** All signatures must be PQ-safe

---

## Implementation Options

### Option 1: Naive Multi-Sig (Not Recommended)

**Architecture:**
```solidity
function verifyMultiSig(
    bytes memory message,
    bytes[] memory signatures, // Multiple PQ signatures
    bytes[] memory publicKeys  // Multiple PQ public keys
) external view returns (bool) {
    uint256 validCount = 0;
    for (uint256 i = 0; i < signatures.length; i++) {
        if (verifySignature(message, signatures[i], publicKeys[i])) {
            validCount++;
        }
    }
    return validCount >= threshold;
}
```

**Gas Cost Analysis:**
- Single Dilithium ZK proof: ~250k gas
- 3-of-5 multi-sig: ~1.25M gas (5 verifications)
- **PROHIBITIVE for on-chain use**

**Verdict:** ❌ Not viable due to gas costs

---

### Option 2: Aggregated ZK Proofs (Recommended)

**Architecture:**
```
Off-chain:
1. Each signer creates Dilithium signature
2. Generate ZK-SNARK proving "M valid signatures out of N"
3. Submit single aggregated proof on-chain

On-chain:
1. Verify single ZK proof (~250k gas)
2. Proof attests that M-of-N signatures are valid
```

**Circuit Requirements:**
```circom
template MultiSigVerifier(M, N) {
    // Inputs
    signal input messageHash;
    signal input publicKeys[N][KEY_SIZE];
    signal input signatures[N][SIG_SIZE];
    signal input signerMask[N]; // 1 if signed, 0 if not

    // Verify each signature
    signal validSigs[N];
    for (var i = 0; i < N; i++) {
        if (signerMask[i] == 1) {
            validSigs[i] <== verifyDilithium(
                messageHash,
                signatures[i],
                publicKeys[i]
            );
        } else {
            validSigs[i] <== 0;
        }
    }

    // Count valid signatures
    signal totalValid;
    totalValid <== sum(validSigs);

    // Require M-of-N
    totalValid >= M;
}
```

**Gas Cost:**
- Off-chain proof generation: ~10-20 seconds (acceptable)
- On-chain verification: ~350k gas (reasonable)
- **Scales to any M-of-N without gas increase**

**Pros:**
- ✅ Constant gas cost regardless of N
- ✅ Quantum-resistant
- ✅ Supports complex policies (M-of-N, weighted, hierarchical)

**Cons:**
- ⚠️ Requires trusted setup for circuit
- ⚠️ Complex off-chain infrastructure
- ⚠️ Larger circuit (more constraints)

**Verdict:** ✅ **RECOMMENDED** for production

---

### Option 3: Merkle Tree Multi-Sig

**Architecture:**
```
Setup:
1. Create Merkle tree of signer public keys
2. Store only root hash on-chain

Verification:
1. Submit M signatures + Merkle proofs
2. Verify each signature against tree
3. Check M valid signatures
```

**Contract:**
```solidity
struct MultiSigConfig {
    bytes32 signerRoot;      // Merkle root of signer keys
    uint8 threshold;         // M signatures required
    uint8 totalSigners;      // N total signers
}

function verifyMultiSigMerkle(
    bytes32 messageHash,
    bytes[] calldata signatures,
    bytes[] calldata publicKeys,
    bytes32[][] calldata merkleProofs
) external view returns (bool) {
    require(signatures.length >= threshold, "Insufficient signatures");

    uint256 validCount = 0;
    for (uint256 i = 0; i < signatures.length; i++) {
        // Verify key is in tree
        require(
            verifyMerkleProof(publicKeys[i], merkleProofs[i], signerRoot),
            "Invalid signer"
        );

        // Verify signature (using ZK proof)
        if (verifyDilithium(messageHash, signatures[i], publicKeys[i])) {
            validCount++;
        }
    }

    return validCount >= threshold;
}
```

**Gas Cost:**
- Merkle proof verification: ~3k gas per proof
- ZK signature verification: ~250k gas per signature
- 3-of-5 multi-sig: ~753k gas (acceptable)

**Pros:**
- ✅ More gas-efficient than naive approach
- ✅ Flexible signer management (update root)
- ✅ No circuit changes needed

**Cons:**
- ⚠️ Gas cost still scales with M
- ⚠️ Complex key rotation (new root)

**Verdict:** ✅ Good middle-ground solution

---

### Option 4: Schnorr-like Aggregation (Future Research)

**Concept:** Similar to BLS signatures, aggregate multiple PQ signatures into one

**Status:** ⚠️ **NOT YET AVAILABLE**
- No standardized PQ aggregation scheme
- Dilithium doesn't support native aggregation
- Active research area (e.g., Falcon aggregation proposals)

**Timeline:** 2-5 years for production-ready solution

**Verdict:** ⏳ Monitor research, not viable now

---

## Recommended Implementation Plan

### Phase 1: Merkle Tree Multi-Sig (Short-Term)

**Why:** Balance between gas costs and complexity

**Implementation:**
```solidity
contract PQValidator {
    struct MultiSigConfig {
        bytes32 signerRoot;
        uint8 threshold;
        uint8 totalSigners;
        uint256 nonce; // For key rotation
    }

    mapping(address => MultiSigConfig) public walletMultiSigConfig;

    function setupMultiSig(
        bytes32 signerRoot,
        uint8 threshold,
        uint8 totalSigners
    ) external onlyAuthorized {
        walletMultiSigConfig[msg.sender] = MultiSigConfig({
            signerRoot: signerRoot,
            threshold: threshold,
            totalSigners: totalSigners,
            nonce: 0
        });
    }

    function verifyMultiSig(
        bytes memory message,
        bytes[] memory signatures,
        bytes[] memory publicKeys,
        bytes32[][] memory merkleProofs
    ) external view onlyAuthorized returns (bool) {
        MultiSigConfig memory config = walletMultiSigConfig[msg.sender];
        require(config.threshold > 0, "Multi-sig not configured");
        require(signatures.length >= config.threshold, "Insufficient signatures");

        uint256 validCount = 0;
        for (uint256 i = 0; i < signatures.length; i++) {
            // Verify signer is authorized via Merkle proof
            bytes32 leaf = keccak256(abi.encodePacked(publicKeys[i]));
            require(
                MerkleProof.verify(merkleProofs[i], config.signerRoot, leaf),
                "Unauthorized signer"
            );

            // Verify signature using existing ZK infrastructure
            if (verifyDilithium(message, signatures[i], publicKeys[i])) {
                validCount++;
            }

            // Short-circuit once threshold reached
            if (validCount >= config.threshold) {
                return true;
            }
        }

        return false;
    }

    function rotateSigners(bytes32 newSignerRoot) external onlyAuthorized {
        walletMultiSigConfig[msg.sender].signerRoot = newSignerRoot;
        walletMultiSigConfig[msg.sender].nonce++;
    }
}
```

**Gas Estimate:** ~750k gas for 3-of-5
**Timeline:** 2-4 weeks implementation + testing

---

### Phase 2: Aggregated ZK Proofs (Long-Term)

**Why:** Optimal gas efficiency, unlimited scalability

**Requirements:**
1. Design multi-sig verification circuit
2. Trusted setup ceremony
3. Off-chain proof generation service
4. Update PQValidator to accept aggregated proofs

**Circuit Complexity:**
- Single sig: ~800 constraints
- 5-sig multi-sig: ~5,000 constraints (estimated)
- Still verifiable in ~350k gas

**Timeline:** 3-6 months (circuit design + audit)

---

## Security Considerations

### Key Management:

**Single-Sig (Current):**
- Private key loss = permanent loss
- Private key compromise = total compromise

**Multi-Sig (Proposed):**
- M-1 key loss = still secure
- Single key compromise ≠ total compromise
- Social recovery possible

### Attack Vectors:

1. **Collusion:** M malicious signers can compromise wallet
   - **Mitigation:** Choose diverse, trusted signers

2. **Denial of Service:** M-1 signers refuse to sign
   - **Mitigation:** Timelock + fallback mechanism

3. **Key Rotation Attacks:** Malicious root update
   - **Mitigation:** Require M-of-N approval for rotation

4. **Front-Running:** Attacker observes signatures, submits first
   - **Mitigation:** ERC-4337 mempool protection

---

## Gas Cost Comparison

| Configuration | Naive | Merkle Tree | ZK Aggregated |
|---------------|-------|-------------|---------------|
| 2-of-3        | ~750k | ~503k       | ~350k        |
| 3-of-5        | ~1.25M| ~753k       | ~350k        |
| 5-of-9        | ~2.25M| ~1.25M      | ~350k        |
| 7-of-15       | ~3.75M| ~1.75M      | ~350k        |

**Conclusion:** ZK aggregation provides constant cost, Merkle tree acceptable for < 5 signatures

---

## Operational Complexity

### Merkle Tree Approach:

**Setup:**
```bash
# 1. Generate signer keys
pq-keygen --algo dilithium3 --output signer1.key
pq-keygen --algo dilithium3 --output signer2.key
pq-keygen --algo dilithium3 --output signer3.key

# 2. Build Merkle tree
merkle-build --keys signer*.pub --output tree.json

# 3. Deploy config
cast send $VALIDATOR "setupMultiSig(bytes32,uint8,uint8)" \
  $(jq -r '.root' tree.json) 3 5
```

**Signing Flow:**
```bash
# 1. Each signer signs
pq-sign --key signer1.key --message tx.json --output sig1.bin
pq-sign --key signer2.key --message tx.json --output sig2.bin
pq-sign --key signer3.key --message tx.json --output sig3.bin

# 2. Generate Merkle proofs
merkle-proof --tree tree.json --key signer1.pub > proof1.json

# 3. Submit transaction
cast send $WALLET "executeMultiSig(...)" \
  --sigs sig1.bin,sig2.bin,sig3.bin \
  --proofs proof1.json,proof2.json,proof3.json
```

**Complexity:** Medium (tooling required)

---

### ZK Aggregation Approach:

**Setup:**
```bash
# 1. Download circuit parameters
wget https://zkproof.org/multisig-params.zkey

# 2. Configure validator
cast send $VALIDATOR "setupAggregatedMultiSig(uint8,uint8)" 3 5
```

**Signing Flow:**
```bash
# 1. Each signer signs (same as above)

# 2. Generate aggregated proof (oracle service)
curl -X POST https://zk-oracle.example.com/aggregate \
  -d '{"signatures": [...], "publicKeys": [...], "message": "..."}' \
  > proof.json

# 3. Submit single proof
cast send $WALLET "executeMultiSig(bytes)" \
  $(jq -r '.proof' proof.json)
```

**Complexity:** Low (oracle handles complexity)

---

## Recommendations

### Immediate (Now):
1. ✅ **Implement access controls** (DONE)
2. ✅ **Document multi-sig requirements** (THIS DOCUMENT)

### Short-Term (1-2 months):
1. **Implement Merkle Tree Multi-Sig**
   - Reasonable gas costs
   - No circuit changes needed
   - Good for up to 5-7 signers

2. **Create CLI tooling**
   - Key generation
   - Merkle tree building
   - Proof generation
   - Transaction submission

3. **Write comprehensive tests**
   - 2-of-3, 3-of-5, 5-of-9 scenarios
   - Key rotation
   - Attack vectors

### Long-Term (3-6 months):
1. **Design ZK aggregation circuit**
   - Work with ZK cryptography experts
   - Trusted setup ceremony
   - Circuit audit

2. **Build off-chain aggregation service**
   - Signature collection API
   - Proof generation workers
   - High availability infrastructure

3. **Production deployment**
   - Testnet validation
   - Security audit
   - Mainnet launch

---

## Cost Estimates

### Development:
- **Merkle Tree Multi-Sig:** $20k-$30k (4-6 weeks)
- **ZK Aggregation Circuit:** $50k-$80k (12-16 weeks)
- **Off-chain Infrastructure:** $30k-$50k (8-12 weeks)

### Ongoing:
- **ZK Oracle Service:** $2k-$5k/month (hosting + compute)
- **Maintenance:** $5k-$10k/month

### Total Phase 1 (Merkle):** $20k-$30k
**Total Phase 2 (ZK):** $100k-$160k

---

## Conclusion

Multi-signature support is **essential for production use** but adds significant complexity. The recommended approach is:

1. **Phase 1:** Implement Merkle Tree multi-sig (2-4 weeks)
   - Gas efficient enough for most use cases
   - No new cryptography required
   - Uses existing ZK infrastructure

2. **Phase 2:** Implement ZK aggregation (3-6 months)
   - Optimal gas efficiency
   - Scales to any N
   - Industry-leading solution

**Current Status:** Access controls added to PQValidator ✅
**Next Step:** Begin Phase 1 implementation or proceed with testnet deployment using single-sig

---

**Generated:** October 17, 2025
**Author:** Claude (Anthropic)
**Status:** Analysis Complete, Implementation Pending
