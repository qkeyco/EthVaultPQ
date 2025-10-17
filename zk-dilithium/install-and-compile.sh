#!/bin/bash
set -e

echo "🚀 EthVaultPQ - Circuit Compilation Script"
echo "==========================================="
echo ""
echo "This will:"
echo "  1. Install Circom compiler (requires sudo)"
echo "  2. Compile dilithium_simple circuit (~30s)"
echo "  3. Download Powers of Tau (~200MB, 2 min)"
echo "  4. Generate proving keys (~5 min)"
echo "  5. Generate test proof (~30s)"
echo ""
echo "Total time: ~6-8 minutes"
echo ""
read -p "Press Enter to continue..."

# Step 1: Install Circom
echo ""
echo "📦 Step 1/5: Installing Circom compiler..."
if ! command -v circom &> /dev/null; then
    echo "Downloading Circom v2.1.6..."
    cd /tmp
    curl -sSfL https://github.com/iden3/circom/releases/download/v2.1.6/circom-macos-amd64 -o circom
    chmod +x circom

    echo "Installing to /usr/local/bin (requires sudo password)..."
    sudo mv circom /usr/local/bin/circom

    echo "✅ Circom installed: $(circom --version)"
else
    echo "✅ Circom already installed: $(circom --version)"
fi

# Navigate to zk-dilithium directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo ""
echo "📍 Working directory: $(pwd)"

# Step 2: Compile Circuit
echo ""
echo "🔨 Step 2/5: Compiling circuit..."
mkdir -p build

circom circuits/dilithium_simple.circom \
  --r1cs \
  --wasm \
  --sym \
  -o build/ \
  -l node_modules

echo "✅ Circuit compiled!"
echo "   - Constraints: $(snarkjs r1cs info build/dilithium_simple.r1cs 2>/dev/null | grep 'Constraints:' || echo 'N/A')"
echo "   - Files: build/dilithium_simple.r1cs, build/dilithium_simple_js/"

# Step 3: Download Powers of Tau
echo ""
echo "⬇️  Step 3/5: Downloading Powers of Tau ceremony file..."
cd build

if [ ! -f "powersOfTau28_hez_final_14.ptau" ]; then
    echo "Downloading 200MB file (this may take 2-3 minutes)..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau \
      --progress-bar \
      -o powersOfTau28_hez_final_14.ptau

    echo "✅ Powers of Tau downloaded ($(du -h powersOfTau28_hez_final_14.ptau | cut -f1))"
else
    echo "✅ Powers of Tau already downloaded"
fi

cd ..

# Step 4: Generate Keys
echo ""
echo "🔑 Step 4/5: Generating proving & verification keys..."
echo "This is the slow part (~5 minutes)..."
echo "Time started: $(date '+%H:%M:%S')"

snarkjs groth16 setup \
  build/dilithium_simple.r1cs \
  build/powersOfTau28_hez_final_14.ptau \
  build/dilithium_simple.zkey

echo "✅ Proving key generated ($(du -h build/dilithium_simple.zkey | cut -f1))"

echo ""
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey \
  build/dilithium_simple.zkey \
  build/verification_key.json

echo "✅ Verification key exported"
echo "Time completed: $(date '+%H:%M:%S')"

# Step 5: Generate Test Proof
echo ""
echo "🧪 Step 5/5: Generating test proof..."

# Create test input
cat > build/test_input.json << 'EOF'
{
  "message_hash": "12345678901234567890123456789012345678901234567890123456789012345",
  "public_key_hash": "98765432109876543210987654321098765432109876543210987654321098765",
  "signature": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32"],
  "public_key": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16"]
}
EOF

echo "Generating witness..."
node build/dilithium_simple_js/generate_witness.js \
  build/dilithium_simple_js/dilithium_simple.wasm \
  build/test_input.json \
  build/witness.wtns

echo "Generating proof..."
PROOF_START=$(date +%s)

snarkjs groth16 prove \
  build/dilithium_simple.zkey \
  build/witness.wtns \
  build/proof.json \
  build/public.json

PROOF_END=$(date +%s)
PROOF_TIME=$((PROOF_END - PROOF_START))

echo "✅ Proof generated in ${PROOF_TIME} seconds"

echo ""
echo "Verifying proof..."
snarkjs groth16 verify \
  build/verification_key.json \
  build/public.json \
  build/proof.json

echo ""
echo "🎉 SUCCESS! Circuit compilation complete!"
echo ""
echo "📊 Summary:"
echo "=========="
echo "Circuit file:      build/dilithium_simple.r1cs"
echo "Witness generator: build/dilithium_simple_js/dilithium_simple.wasm ($(du -h build/dilithium_simple_js/dilithium_simple.wasm | cut -f1))"
echo "Proving key:       build/dilithium_simple.zkey ($(du -h build/dilithium_simple.zkey | cut -f1))"
echo "Verification key:  build/verification_key.json"
echo "Test proof:        build/proof.json"
echo ""
echo "⏱️  Proof generation time: ${PROOF_TIME} seconds"
echo ""
echo "📋 Next Steps:"
echo "============="
echo "1. Deploy circuit files to Vercel:"
echo "   cd zk-dilithium"
echo "   mkdir -p public/circuits public/keys"
echo "   cp build/dilithium_simple_js/dilithium_simple.wasm public/circuits/"
echo "   cp build/dilithium_simple.zkey public/keys/"
echo "   vercel --prod --yes"
echo ""
echo "2. Update api/prove.js to use real proofs (uncomment lines 123-127)"
echo ""
echo "3. Test with real proofs!"
echo ""
