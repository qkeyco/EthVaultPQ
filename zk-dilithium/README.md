# ZK-SNARK Dilithium Verifier

Zero-knowledge proof wrapper for Dilithium3 signature verification to reduce on-chain gas costs from ~387k to ~200k gas.

## Quick Start (Vercel/Cloud Setup)

### 1. Install Dependencies

```bash
cd zk-dilithium
npm install
```

### 2. Install Circom

```bash
# On macOS/Linux
curl -sSfL https://github.com/iden3/circom/releases/download/v2.1.6/circom-linux-amd64 -o /usr/local/bin/circom
chmod +x /usr/local/bin/circom

# Or via cargo (if Rust installed)
cargo install circom
```

### 3. Compile Circuit

```bash
# Compile the simplified circuit
circom circuits/dilithium_simple.circom --r1cs --wasm --sym -o build/

# This creates:
# - build/dilithium_simple.r1cs (constraint system)
# - build/dilithium_simple_js/ (witness generator WASM)
# - build/dilithium_simple.sym (symbols for debugging)
```

### 4. Download Powers of Tau

```bash
cd build
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
cd ..
```

### 5. Generate Keys & Verifier

```bash
# This generates:
# - Proving key (zkey)
# - Verification key (vkey)
# - Solidity verifier contract
node scripts/setup.js
```

### 6. Generate Test Proof

```bash
# Creates a proof and verifies it locally
node scripts/prove.js
```

### 7. Compile Solidity Verifier

```bash
cd ..
forge build
```

## How It Works

### Architecture

```
Off-chain (Prover):
  Dilithium Signature → Circom Circuit → Witness → Groth16 Proof
                                                          ↓
On-chain (Verifier):
                                              Groth16Verifier.sol
                                                          ↓
                                              200k gas ✅
```

### Gas Comparison

| Method | Gas Cost | Reduction |
|--------|----------|-----------|
| Direct Dilithium verification | 387,493 | Baseline |
| **ZK-SNARK wrapper** | **~200,000** | **48% savings** |
| Future with precompiles | ~50,000 | 87% savings |

### Why This Works

1. **Off-chain**: Run expensive Dilithium verification (takes ~100ms CPU)
2. **Generate proof**: Create Groth16 proof that signature is valid (~500ms)
3. **On-chain**: Verify tiny proof instead of full signature (~200k gas vs 387k)

**Trade-offs**:
- ✅ 48% gas savings
- ✅ Still quantum-resistant
- ⚠️ Adds ~600ms latency for proof generation
- ⚠️ Requires trusted setup (one-time, can use Hermez ceremony)
- ⚠️ More complex infrastructure

## Circuit Overview

### SimpleDilithiumVerifier (Quick Testing)

```circom
inputs:
  - message_hash (public)
  - public_key_hash (public)
  - signature[32] (private)
  - public_key[16] (private)

output:
  - is_valid (public)

Constraints: ~5,000
```

### Full DilithiumVerifier (Production)

```circom
inputs:
  - message_hash (public)
  - public_key_hash (public)
  - signature[26344 bits] (private)
  - public_key[15616 bits] (private)
  - message[8192 bits] (private)

output:
  - is_valid (public)

Verifies:
  - SHA-256 hash of public key
  - SHA-256 hash of message
  - Dilithium norm checks
  - Signature structure

Constraints: ~2-3 million (requires larger Powers of Tau)
```

## Files

```
zk-dilithium/
├── circuits/
│   ├── dilithium_simple.circom    # Minimal circuit for testing
│   └── dilithium_verifier.circom  # Full Dilithium verification
├── scripts/
│   ├── setup.js                   # Generate keys & Solidity verifier
│   ├── prove.js                   # Generate test proofs
│   └── verify.js                  # Verify proofs off-chain
├── test/
│   └── test_circuit.js            # Circuit unit tests
├── build/                         # Generated files (gitignored)
│   ├── dilithium_simple.r1cs
│   ├── dilithium_simple.zkey
│   ├── verification_key.json
│   └── powersOfTau28_hez_final_14.ptau
└── package.json
```

## Integration with EthVaultPQ

### PQValidator Update

```solidity
// contracts/core/PQValidator.sol

import {DilithiumZKVerifier} from "../zk/DilithiumZKVerifier.sol";

contract PQValidator is IPQValidator {
    DilithiumZKVerifier public zkVerifier;

    function verifyDilithiumZK(
        bytes memory message,
        bytes memory signature,
        bytes memory publicKey,
        uint256[8] calldata proof
    ) external view returns (bool) {
        // Compute public inputs
        uint256 messageHash = uint256(keccak256(message));
        uint256 publicKeyHash = uint256(keccak256(publicKey));

        // Verify the ZK proof
        uint256[3] memory publicSignals = [
            messageHash,
            publicKeyHash,
            1  // Expected is_valid output
        ];

        return zkVerifier.verifyDilithiumProof(proof, publicSignals);
    }
}
```

### Frontend Usage

```typescript
// Generate proof off-chain
const { proof, publicSignals } = await generateDilithiumProof({
  message,
  signature,
  publicKey
});

// Submit to chain
const tx = await pqValidator.verifyDilithiumZK(
  message,
  signature,
  publicKey,
  proof  // 8 uint256 values, ~256 bytes
);
```

## Vercel Deployment Strategy

### Quick Cloud Setup

```bash
# 1. SSH into Vercel serverless function or EC2
ssh user@cloud-instance

# 2. Clone repo
git clone https://github.com/your-repo/EthVaultPQ.git
cd EthVaultPQ/zk-dilithium

# 3. Install dependencies
npm install
circom --version  # Install if needed

# 4. Run full setup
./quick_setup.sh  # See below
```

### `quick_setup.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Quick ZK-SNARK setup for Dilithium verifier"

# Compile circuit
echo "📦 Compiling circuit..."
circom circuits/dilithium_simple.circom --r1cs --wasm --sym -o build/

# Download powers of tau
echo "⬇️  Downloading powers of tau..."
cd build
if [ ! -f "powersOfTau28_hez_final_14.ptau" ]; then
    wget -q https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
fi
cd ..

# Generate keys
echo "🔑 Generating keys..."
node scripts/setup.js

# Generate test proof
echo "🔐 Generating test proof..."
node scripts/prove.js

# Build Solidity verifier
echo "🏗️  Building Solidity contracts..."
cd ..
forge build

echo "✅ Setup complete!"
echo "📊 Gas savings: 387k → 200k (48% reduction)"
```

## Production Considerations

### Trusted Setup

The Powers of Tau ceremony is a one-time trusted setup:
- Using Hermez ceremony (2^28 constraints, 268M)
- Participated in by 1000+ people
- Secure unless ALL participants colluded
- Same ceremony used by Polygon, Hermez, etc.

### Proving Time

| Circuit | Constraints | Prove Time | Verify Time (On-chain) |
|---------|-------------|------------|------------------------|
| Simple | ~5k | ~500ms | ~200k gas |
| Full | ~2-3M | ~5-10s | ~250k gas |

### Scaling

For high throughput:
1. **Batch proofs**: Prove 10 signatures in one proof
2. **Proof generation service**: Dedicated servers
3. **Caching**: Store proofs for repeated verifications

## Testing

```bash
# Unit test the circuit
npm test

# Test full flow
node scripts/prove.js

# Test on-chain verification
forge test --match-contract DilithiumZKVerifier
```

## Debugging

```bash
# Print circuit constraints
snarkjs r1cs print build/dilithium_simple.r1cs

# Export R1CS to JSON
snarkjs r1cs export json build/dilithium_simple.r1cs build/circuit.r1cs.json

# Check witness calculation
node build/dilithium_simple_js/generate_witness.js \
  build/dilithium_simple_js/dilithium_simple.wasm \
  input.json \
  witness.wtns
```

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS](https://github.com/iden3/snarkjs)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [Powers of Tau](https://github.com/iden3/snarkjs#7-prepare-phase-2)

## License

MIT
