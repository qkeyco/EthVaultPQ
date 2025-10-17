#!/bin/bash
# Fully automated circuit compilation - no user interaction needed
set -e

echo "🚀 Starting Circuit Compilation..."
echo "=================================="
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $(pwd)"
echo ""

# Check Circom installation
if ! command -v circom &> /dev/null; then
    echo "❌ ERROR: Circom not installed!"
    echo "Please run: sudo cp /tmp/circom /usr/local/bin/circom"
    echo "Or install manually from: https://github.com/iden3/circom/releases"
    exit 1
fi

echo "✅ Circom installed: $(circom --version)"
echo ""

# Step 2: Compile Circuit
echo "🔨 Step 1/4: Compiling circuit..."
mkdir -p build

circom circuits/dilithium_simple.circom \
  --r1cs \
  --wasm \
  --sym \
  -o build/ \
  2>&1 | grep -E "(template|Constraints|Written)" || true

echo "✅ Circuit compiled!"
echo ""

# Step 3: Download Powers of Tau
echo "⬇️  Step 2/4: Checking Powers of Tau..."
cd build

if [ ! -f "powersOfTau28_hez_final_14.ptau" ]; then
    echo "Downloading 200MB file..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau \
      --progress-bar \
      -o powersOfTau28_hez_final_14.ptau
    echo "✅ Downloaded: $(du -h powersOfTau28_hez_final_14.ptau | cut -f1)"
else
    echo "✅ Already exists: $(du -h powersOfTau28_hez_final_14.ptau | cut -f1)"
fi

cd ..
echo ""

# Step 4: Generate Keys
echo "🔑 Step 3/4: Generating keys (this takes ~5 minutes)..."
echo "Started: $(date '+%H:%M:%S')"

snarkjs groth16 setup \
  build/dilithium_simple.r1cs \
  build/powersOfTau28_hez_final_14.ptau \
  build/dilithium_simple.zkey \
  2>&1 | grep -E "(Contribution|Section)" || true

echo "✅ Proving key: $(du -h build/dilithium_simple.zkey | cut -f1)"

snarkjs zkey export verificationkey \
  build/dilithium_simple.zkey \
  build/verification_key.json \
  2>&1 | grep -v "zkey" || true

echo "✅ Verification key: $(du -h build/verification_key.json | cut -f1)"
echo "Completed: $(date '+%H:%M:%S')"
echo ""

# Step 5: Test Proof
echo "🧪 Step 4/4: Testing proof generation..."

# Create test input
cat > build/test_input.json << 'EOF'
{
  "message_hash": "12345678901234567890123456789012345678901234567890123456789012345",
  "public_key_hash": "98765432109876543210987654321098765432109876543210987654321098765",
  "signature": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32"],
  "public_key": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"]
}
EOF

node build/dilithium_simple_js/generate_witness.js \
  build/dilithium_simple_js/dilithium_simple.wasm \
  build/test_input.json \
  build/witness.wtns \
  > /dev/null 2>&1

PROOF_START=$(date +%s)

snarkjs groth16 prove \
  build/dilithium_simple.zkey \
  build/witness.wtns \
  build/proof.json \
  build/public.json \
  > /dev/null 2>&1

PROOF_END=$(date +%s)
PROOF_TIME=$((PROOF_END - PROOF_START))

VERIFY_RESULT=$(snarkjs groth16 verify \
  build/verification_key.json \
  build/public.json \
  build/proof.json 2>&1)

if echo "$VERIFY_RESULT" | grep -q "OK"; then
    echo "✅ Test proof verified successfully!"
    echo "⏱️  Proof generation time: ${PROOF_TIME} seconds"
else
    echo "❌ Proof verification failed!"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! All circuits compiled and tested!"
echo ""
echo "📊 Generated Files:"
echo "==================="
echo "Circuit:           build/dilithium_simple.r1cs"
echo "Witness generator: build/dilithium_simple_js/dilithium_simple.wasm ($(du -h build/dilithium_simple_js/dilithium_simple.wasm 2>/dev/null | cut -f1 || echo 'N/A'))"
echo "Proving key:       build/dilithium_simple.zkey ($(du -h build/dilithium_simple.zkey 2>/dev/null | cut -f1 || echo 'N/A'))"
echo "Verification key:  build/verification_key.json"
echo "Powers of Tau:     build/powersOfTau28_hez_final_14.ptau ($(du -h build/powersOfTau28_hez_final_14.ptau 2>/dev/null | cut -f1 || echo 'N/A'))"
echo ""
echo "⏱️  Performance:"
echo "==============="
echo "Proof generation: ${PROOF_TIME} seconds per proof"
echo ""
echo "📋 Next: Deploy to Vercel"
echo "========================="
echo "See CIRCUIT_DEPLOYMENT_PLAN.md for deployment options"
echo ""
