# ZK Circuit Deployment Plan

## Where Circuits Will Be Deployed

### Build Artifacts (Generated Locally)

**Location on your machine:**
```
zk-dilithium/build/
├── dilithium_simple.r1cs           # Constraint system (~5MB)
├── dilithium_simple.wasm           # Witness generator (~5MB)
├── dilithium_simple.zkey           # Proving key (~50MB)
├── verification_key.json           # Verification key (1KB)
└── powersOfTau28_hez_final_14.ptau # Trusted setup (200MB, one-time download)
```

**Time to generate:**
- Simple circuit: ~6 minutes
- Full circuit: ~2-4 hours

### Deployment Destinations

#### 1. Vercel (Serverless Function)

**Files needed:**
```
zk-dilithium/
├── api/prove.js                    # Already deployed ✅
└── (Need to add circuit files)
```

**Two options for large files:**

**Option A: Include in deployment (Simpler)**
```
zk-dilithium/
└── public/
    ├── circuits/
    │   └── dilithium_simple.wasm   # 5MB
    └── keys/
        └── dilithium_simple.zkey   # 50MB
```

**Pros:** Simple, works immediately
**Cons:** Slow deployments (55MB upload each time)

**Option B: Vercel Blob Storage (Recommended)**
```
Upload once to Blob Storage:
- https://your-project.blob.vercel-storage.com/circuits/dilithium_simple.wasm
- https://your-project.blob.vercel-storage.com/keys/dilithium_simple.zkey

Then reference URLs in prove.js
```

**Pros:** Fast deployments, CDN distribution
**Cons:** Small storage cost (~$0.01/month for 55MB)

#### 2. Smart Contract (On-Chain Verifier)

**Already deployed to Tenderly:**
```
contracts/libraries/ZKVerifier.sol  # Groth16 verifier
```

**Will update with verification key:**
- Extract from `verification_key.json`
- Update contract constructor or setter
- Already supports verifyProof() function

**No redeployment needed** - contract is generic Groth16 verifier!

## Compilation Process (What Happens)

### Step 1: Compile Circuit (30 seconds)
```bash
circom circuits/dilithium_simple.circom --r1cs --wasm --sym -o build/
```

**Creates:**
- `.r1cs` file (constraint system)
- `.wasm` file (witness generator)
- `.sym` file (debugging symbols)

### Step 2: Download Powers of Tau (2 minutes, one-time)
```bash
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
```

**What it is:**
- Trusted setup ceremony result
- Used by thousands of ZK projects
- 1000+ participants
- 200MB file

### Step 3: Generate Proving Key (5 minutes)
```bash
snarkjs groth16 setup \
  dilithium_simple.r1cs \
  powersOfTau28_hez_final_14.ptau \
  dilithium_simple.zkey
```

**Creates:**
- `.zkey` file (proving key, ~50MB)

**Most time-consuming step!**

### Step 4: Export Verification Key (5 seconds)
```bash
snarkjs zkey export verificationkey \
  dilithium_simple.zkey \
  verification_key.json
```

**Creates:**
- `verification_key.json` (small, 1KB)

### Step 5: Generate Test Proof (30 seconds)
```bash
node scripts/prove.js
```

**Verifies everything works**

## Total Time Estimate

**Simple Circuit (dilithium_simple.circom):**
- ⏱️ **Total: ~6 minutes**
- Constraints: ~5,000
- Proof generation: ~500ms per proof

**Full Circuit (dilithium_verifier.circom):**
- ⏱️ **Total: ~2-4 hours**
- Constraints: ~2-3 million
- Proof generation: ~5-10 seconds per proof
- Requires 8GB+ RAM

## Deployment After Compilation

### Quick Deploy (Option A - Include Files)

```bash
cd zk-dilithium

# Create public directories
mkdir -p public/circuits public/keys

# Copy built files
cp build/dilithium_simple_js/dilithium_simple.wasm public/circuits/
cp build/dilithium_simple.zkey public/keys/

# Update api/prove.js to use files
# (Already configured!)

# Deploy to Vercel
vercel --prod --yes
```

**Deploy time:** ~2 minutes (uploading 55MB)

### Better Deploy (Option B - Blob Storage)

```bash
# Install Vercel Blob CLI
npm install -g @vercel/blob

# Upload files
vercel blob upload build/dilithium_simple_js/dilithium_simple.wasm --token YOUR_TOKEN
vercel blob upload build/dilithium_simple.zkey --token YOUR_TOKEN

# Update api/prove.js with blob URLs
# Redeploy
vercel --prod --yes
```

**Deploy time:** ~10 seconds (no large files)
**Runtime:** Downloads from CDN (fast)

## What Changes in api/prove.js

### Currently (Mock Data):
```javascript
// Lines 122-140
const mockProof = {
  pi_a: ['0x1234', '0x5678', '0x9abc'],
  // ... hard-coded
};
```

### After Compilation (Real Proofs):
```javascript
// Uncomment this:
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  '/var/task/circuits/dilithium_simple.wasm',  // ← Need this file
  '/var/task/keys/dilithium_simple.zkey'       // ← Need this file
);

// Delete mock data section
```

## Resource Requirements

### For Simple Circuit (Recommended):
- **CPU:** Any modern CPU
- **RAM:** 2GB
- **Disk:** 300MB
- **Time:** 6 minutes
- **Machine:** Your Mac is fine!

### For Full Circuit:
- **CPU:** 4+ cores recommended
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 500MB
- **Time:** 2-4 hours
- **Machine:** Beefy desktop or cloud VM

## Let's Start with Simple Circuit

I recommend starting with the **simple circuit** because:
1. ✅ Quick (6 minutes)
2. ✅ Runs on your Mac
3. ✅ Proves the infrastructure works
4. ✅ Good enough for testing
5. ✅ Can upgrade to full circuit later

Then if you want real production Dilithium verification, compile the full circuit later on a cloud VM.

## Ready to Start?

I'll kick off the compilation process now. It will:
1. Check if Circom is installed (install if needed)
2. Compile the circuit
3. Download Powers of Tau
4. Generate keys
5. Test proof generation
6. Show you how to deploy

**This will take about 6 minutes to complete.**

Sound good?
