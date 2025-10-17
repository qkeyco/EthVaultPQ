# Overnight Circuit Compilation - Status

## What's Running Now

**Script:** `zk-dilithium/compile-circuits.sh`
**Background Process ID:** Check with `ps aux | grep compile`
**Log File:** Will be saved to terminal output

## Timeline (Approximately 6-8 minutes total)

### Step 1: Circuit Compilation (~30 seconds) ✅
- Compiling `dilithium_simple.circom`
- Generating `.r1cs` constraint system
- Creating `.wasm` witness generator

### Step 2: Download Powers of Tau (~2 minutes)
- Downloading 200MB file from Hermez
- One-time download (reused for future compilations)
- Trusted setup ceremony result

### Step 3: Key Generation (~5 minutes) ⏰ **LONGEST STEP**
- Creating proving key (`.zkey` file, ~50MB)
- Exporting verification key (`.json` file, 1KB)
- **This is where most time is spent**

### Step 4: Test Proof (~30 seconds)
- Generating test witness
- Creating sample proof
- Verifying proof works
- Measuring proof generation time

## How to Monitor Progress

### Check if still running:
```bash
ps aux | grep -E "(circom|snarkjs)" | grep -v grep
```

### Check compilation log:
```bash
cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/zk-dilithium
tail -f compilation.log
```

### Check what files have been created:
```bash
ls -lh build/
```

## Expected Output Files

When complete, you'll have:

```
zk-dilithium/build/
├── dilithium_simple.r1cs              # Constraint system
├── dilithium_simple.sym               # Debug symbols
├── dilithium_simple_js/
│   ├── dilithium_simple.wasm          # ~5MB - Witness generator
│   ├── witness_calculator.js
│   └── generate_witness.js
├── dilithium_simple.zkey              # ~50MB - Proving key
├── verification_key.json              # ~1KB - Verification key
├── powersOfTau28_hez_final_14.ptau    # ~200MB - Trusted setup
├── test_input.json                    # Test data
├── witness.wtns                       # Test witness
├── proof.json                         # Test proof
└── public.json                        # Public signals
```

## What Happens Next (Tomorrow)

### Option 1: Deploy to Vercel (Simple)

```bash
cd zk-dilithium

# Create deployment directories
mkdir -p public/circuits public/keys

# Copy compiled files
cp build/dilithium_simple_js/dilithium_simple.wasm public/circuits/
cp build/dilithium_simple.zkey public/keys/

# Deploy
vercel --prod --yes
```

**Upload size:** ~55MB (one-time)
**Deploy time:** ~2 minutes

### Option 2: Use Vercel Blob Storage (Better)

Upload files once to CDN, reference by URL.

**Advantages:**
- Faster deployments (don't re-upload 55MB each time)
- CDN distribution (faster downloads)
- Cleaner git repo

See `CIRCUIT_DEPLOYMENT_PLAN.md` for detailed instructions.

### Option 3: Update api/prove.js

Change from mock proofs to real proofs:

**Find this section (lines 122-140):**
```javascript
// MOCK: In production, this would call snarkjs
// const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//   input,
//   '/var/task/circuits/dilithium_simple.wasm',
//   '/var/task/keys/dilithium_simple.zkey'
// );

const mockProof = { ... };
```

**Replace with:**
```javascript
// Real ZK-SNARK proof generation
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  '/var/task/circuits/dilithium_simple.wasm',  // From deployed files
  '/var/task/keys/dilithium_simple.zkey'
);

// Delete mock proof section
```

## Success Indicators

### Script completed successfully if you see:
```
🎉 SUCCESS! All circuits compiled and tested!
✅ Test proof verified successfully!
⏱️  Proof generation time: X seconds
```

### Files to check:
```bash
# Should all exist and have reasonable sizes
ls -lh build/dilithium_simple.zkey        # ~50MB
ls -lh build/dilithium_simple_js/dilithium_simple.wasm  # ~5MB
ls -lh build/verification_key.json        # ~1KB
```

### Test command:
```bash
cd zk-dilithium/build
snarkjs groth16 verify \
  verification_key.json \
  public.json \
  proof.json

# Should output: [INFO]  snarkJS: OK!
```

## If Something Goes Wrong

### Circuit compilation failed:
- Check `circom --version` (should be 2.1.6)
- Check `circuits/dilithium_simple.circom` exists
- Try manual compilation:
  ```bash
  cd zk-dilithium
  circom circuits/dilithium_simple.circom --r1cs --wasm -o build/
  ```

### Powers of Tau download failed:
- Check internet connection
- Try manual download:
  ```bash
  cd zk-dilithium/build
  curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau -o powersOfTau28_hez_final_14.ptau
  ```

### Key generation failed:
- Check if `snarkjs` is installed: `npm list snarkjs`
- Check RAM usage (need ~2GB free)
- Try manual setup:
  ```bash
  cd zk-dilithium
  npx snarkjs groth16 setup \
    build/dilithium_simple.r1cs \
    build/powersOfTau28_hez_final_14.ptau \
    build/dilithium_simple.zkey
  ```

### Proof verification failed:
- Circuit has a bug (unlikely - it's been tested)
- Check test input format in `build/test_input.json`

## Morning Checklist

When you wake up:

- [ ] Check if compilation completed: `cat zk-dilithium/compilation.log`
- [ ] Verify files exist: `ls -lh zk-dilithium/build/`
- [ ] Test proof generation time (should be in log)
- [ ] Review deployment options
- [ ] Decide: Quick deploy (Option 1) or Blob storage (Option 2)
- [ ] Deploy to Vercel
- [ ] Update api/prove.js
- [ ] Test real ZK proofs from dashboard!

## Current Status

**Started:** Now
**Expected completion:** 6-8 minutes from start
**Running in:** Background process
**Log output:** Terminal where you ran the script

**The compilation is running now! It will complete in about 6-8 minutes.**

**Tomorrow morning, you'll have real ZK-SNARK circuits ready to deploy!** 🚀

---

*See also:*
- `CIRCUIT_DEPLOYMENT_PLAN.md` - Detailed deployment instructions
- `CIRCOM_EXPLAINED.md` - Understanding circuit compilation
- `ZK_SNARK_GUIDE.md` - Technical ZK-SNARK details
