# EthVaultPQ - Deployment Summary

## Current Status

### ✅ Completed
- Smart contracts deployed to Tenderly Virtual TestNet
- Dashboard running locally on http://localhost:5175
- ZK proof API ready to deploy to Vercel
- All documentation created

### ⏳ Ready to Deploy
- Vercel serverless functions for ZK proof generation

## Quick Answer: Do I Need a URL?

**No custom domain required!**

When you deploy to Vercel, you automatically get:
```
https://your-project-name.vercel.app
```

This is **completely free** and works perfectly. Custom domains are optional.

## How to Deploy (5 minutes)

### Step 1: Deploy to Vercel

```bash
# From project root
./deploy-vercel.sh
```

This will:
1. Install Vercel CLI (if needed)
2. Ask you to log in to Vercel
3. Deploy your ZK proof API
4. Give you a URL like: `https://pq-wallet-vault-xxxx.vercel.app`

### Step 2: Update Dashboard

```bash
cd dashboard

# Replace with your actual Vercel URL
echo 'VITE_ZK_API_URL=https://your-actual-url.vercel.app' > .env.local

# Restart dashboard
npm run dev
```

### Step 3: Test

Open http://localhost:5175 and:
1. Connect your wallet
2. Try creating a PQ wallet
3. Check verification mode selector
4. Verify ZK proof mode works

## What You Need

### For Vercel:
- **Account**: Free at [vercel.com](https://vercel.com) (no credit card)
- **Domain**: NOT needed (Vercel provides `*.vercel.app` for free)
- **API Keys**: NOT needed (the API is stateless)

### Already Have:
- ✅ Tenderly RPC URL: `https://virtual.mainnet.eu.rpc.tenderly.co/b2790e5f-a59e-49d7-aed1-5f2e1ad28f3d`
- ✅ Contracts deployed
- ✅ Dashboard configured

## Project Structure

```
EthVaultPQ/
├── contracts/              # Smart contracts (Solidity)
│   ├── core/
│   │   ├── PQValidator.sol           # Post-quantum validator
│   │   ├── PQWallet.sol              # ERC-4337 wallet
│   │   ├── PQWalletFactory.sol       # Wallet factory
│   │   └── EntryPoint.sol            # ERC-4337 entrypoint
│   ├── vault/
│   │   └── PQVault4626.sol           # ERC-4626 vault with vesting
│   └── libraries/
│       ├── DilithiumVerifier.sol     # On-chain Dilithium (~10M gas)
│       └── ZKVerifier.sol            # ZK-SNARK verifier (~250k gas)
│
├── zk-dilithium/           # ZK proof generation (Vercel)
│   ├── api/
│   │   ├── health.js                 # Health check endpoint
│   │   └── prove.js                  # Proof generation endpoint
│   ├── circuits/                     # Circom circuits (TODO)
│   ├── deploy-vercel.sh              # Vercel deployment script
│   └── VERCEL_SETUP.md               # Detailed Vercel guide
│
├── dashboard/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletCreator.tsx            # Create PQ wallets
│   │   │   ├── VaultManager.tsx             # Manage vaults
│   │   │   ├── VerificationModeSelector.tsx # Switch ON_CHAIN/ZK_PROOF/HYBRID
│   │   │   ├── VestingTimeline.tsx          # Visual timeline
│   │   │   └── PaymentScheduleBuilder.tsx   # Custom schedules
│   │   ├── lib/
│   │   │   └── zkProofApi.ts                # Vercel API client
│   │   └── config/
│   │       ├── contracts.ts                 # Contract addresses
│   │       ├── networks.ts                  # Network configs
│   │       └── wagmi.ts                     # Wagmi setup
│   └── .env.local                           # Vercel URL (create after deploy)
│
├── script/                 # Deployment scripts
│   ├── DeployTenderly.s.sol          # Tenderly deployment ✅
│   ├── DeployTestnet.s.sol           # Base Sepolia
│   └── Deploy.s.sol                  # Base Mainnet
│
├── deploy-vercel.sh        # Root deployment script
├── QUICK_START.md          # Quick start guide
├── VERCEL_DEPLOYMENT.md    # Detailed Vercel guide
└── DEPLOYMENT_SUMMARY.md   # This file
```

## Deployed Contracts (Tenderly)

All contracts deployed to: **Tenderly Virtual TestNet**

| Contract | Address | Purpose |
|----------|---------|---------|
| PQValidator | (see dashboard/src/config/contracts.ts) | Post-quantum signature verification |
| PQWalletFactory | (see dashboard/src/config/contracts.ts) | Create PQ wallets |
| PQVault4626 | (see dashboard/src/config/contracts.ts) | Tokenized vaults with vesting |
| EntryPoint | (see dashboard/src/config/contracts.ts) | ERC-4337 entry point |

## API Endpoints (After Vercel Deploy)

### Health Check
```bash
GET https://your-project.vercel.app/api/health
```

### Generate ZK Proof
```bash
POST https://your-project.vercel.app/api/prove
Content-Type: application/json

{
  "message": "0x48656c6c6f",
  "signature": "0x1234...",
  "publicKey": "0xabcd..."
}
```

## Verification Modes

Your PQValidator contract supports 3 modes (switchable on-chain):

| Mode | Gas Cost | API Required | Use Case |
|------|----------|--------------|----------|
| **ON_CHAIN** | ~10M gas | No | Full decentralization, very expensive |
| **ZK_PROOF** | ~250k gas | Yes (Vercel) | 97.5% cheaper, requires API |
| **HYBRID** | Variable | Yes (Vercel) | ZK first, fallback to on-chain |

**Default**: ZK_PROOF (best for production)

To change mode (admin only):
```solidity
pqValidator.setVerificationMode(VerificationMode.ZK_PROOF);
```

## Cost Breakdown

| Service | Tier | Cost | What You Get |
|---------|------|------|--------------|
| **Vercel** | Hobby (Free) | $0 | 100GB bandwidth, 100hrs execution |
| **Vercel** | Pro | $20/month | 1TB bandwidth, 1000hrs, 60s timeout |
| **Tenderly** | Virtual TestNet | $0 | Unlimited virtual ETH for testing |
| **Base Sepolia** | Testnet | $0 | Real testnet (faucet ETH) |
| **Base Mainnet** | Production | Gas only | Real deployment |

**Recommended for now**: Vercel Hobby (Free) + Tenderly (Free)

## Gas Savings

With ZK proofs:
- **On-chain Dilithium**: ~10,000,000 gas (~$50-200)
- **ZK-SNARK Proof**: ~250,000 gas (~$1.25-5)
- **Savings**: 97.5% cheaper, 40x reduction

## Important Notes

### 1. Current ZK Proof Implementation
The current `/api/prove` endpoint returns **mock data** because:
- Circom circuits need to be compiled (requires heavy computation)
- .wasm and .zkey files need to be generated
- These files are large (~50MB+) and take time to compile

**For now**: The API is deployed but returns placeholder proofs.

**For production**: You'll need to:
1. Compile circuits locally (`cd zk-dilithium && npm run build:circuits`)
2. Upload .wasm and .zkey files to Vercel
3. Update `api/prove.js` to use real snarkjs

### 2. Tenderly vs Production
- **Tenderly**: Virtual testnet, unlimited free ETH, perfect for development
- **Base Sepolia**: Real testnet, requires faucet ETH, more realistic
- **Base Mainnet**: Production, real money

### 3. Security
Current setup is for **development/testing only**:
- No rate limiting
- No API key protection
- No input sanitization beyond basic validation

Before production, add:
- Rate limiting
- API key authentication
- Input validation
- Monitoring/alerting

## Next Steps

### Immediate (Now)
```bash
# 1. Deploy to Vercel (5 minutes)
./deploy-vercel.sh

# 2. Update dashboard with Vercel URL
cd dashboard
echo 'VITE_ZK_API_URL=https://your-url.vercel.app' > .env.local
npm run dev

# 3. Test everything
# Open http://localhost:5175
# Connect wallet, create PQ wallet, test verification modes
```

### Soon (Optional)
- Deploy to Base Sepolia testnet for public testing
- Compile Circom circuits for real ZK proofs
- Add monitoring and alerting
- Add rate limiting to API

### Later (Production)
- Security audit
- Deploy to Base Mainnet
- Set up custom domain (optional)
- Add advanced features (multi-sig, recovery, etc.)

## Documentation

| File | Description |
|------|-------------|
| **QUICK_START.md** | Quick reference guide |
| **DEPLOYMENT_SUMMARY.md** | This file - overview |
| **VERCEL_DEPLOYMENT.md** | Detailed Vercel deployment |
| **zk-dilithium/VERCEL_SETUP.md** | ZK prover Vercel setup |
| **TENDERLY_SETUP.md** | Tenderly integration guide |
| **ZK_SNARK_GUIDE.md** | ZK-SNARK technical details |
| **README.md** | Main project documentation |

## Support

- **Quick questions**: Check `QUICK_START.md`
- **Vercel issues**: Check `VERCEL_DEPLOYMENT.md` or `zk-dilithium/VERCEL_SETUP.md`
- **Contract issues**: Check `README.md` and `TENDERLY_SETUP.md`
- **ZK proof issues**: Check `ZK_SNARK_GUIDE.md`

## TL;DR

```bash
# Deploy ZK proof API to Vercel (gives you free URL)
./deploy-vercel.sh

# Update dashboard with that URL
cd dashboard
echo 'VITE_ZK_API_URL=https://your-url-from-above.vercel.app' > .env.local

# Test
npm run dev
# Open http://localhost:5175
```

**No custom domain needed** - Vercel gives you `*.vercel.app` for free! 🚀
