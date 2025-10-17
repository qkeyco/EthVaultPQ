# Quick Start Guide - EthVaultPQ

## What You Have Now

✅ **Smart Contracts** - Deployed to Tenderly Virtual TestNet
✅ **Dashboard** - Running on http://localhost:5175
✅ **ZK Proof API** - Ready to deploy to Vercel

## Deploy ZK Proof API to Vercel

### Option A: Using the Script (Easiest)

```bash
# From project root
./deploy-vercel.sh

# Or directly from zk-dilithium directory
cd zk-dilithium
./deploy-vercel.sh
```

Follow the prompts and you'll get a URL like:
```
https://pq-wallet-vault.vercel.app
```

**Note**: The root `deploy-vercel.sh` automatically runs the `zk-dilithium/deploy-vercel.sh` script.

### Option B: Manual Deployment

1. **Go to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository: `EthVaultPQ`

2. **Configure**
   - Framework: Other
   - Root: `./`
   - Build Command: (leave empty)
   - Install Command: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your URL: `https://your-project.vercel.app`

## Update Dashboard to Use Vercel API

After deploying to Vercel, update your dashboard:

```bash
cd dashboard

# Create .env.local with your Vercel URL
echo 'VITE_ZK_API_URL=https://your-actual-url.vercel.app' > .env.local

# Restart dashboard
npm run dev
```

## Test Everything

### 1. Test Vercel API

```bash
curl https://your-project.vercel.app/api/zk-proof \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"0x48656c6c6f","signature":"0x1234","publicKey":"0xabcd"}'
```

### 2. Test Dashboard
- Open http://localhost:5175
- Connect wallet
- Try creating a wallet
- Try depositing to vault
- Check that ZK proof mode works

## Current Status

| Component | Status | URL/Location |
|-----------|--------|--------------|
| Smart Contracts | ✅ Deployed | Tenderly Virtual TestNet |
| PQValidator | ✅ Deployed | `0x...` (see contracts.ts) |
| PQWalletFactory | ✅ Deployed | `0x...` (see contracts.ts) |
| PQVault4626 | ✅ Deployed | `0x...` (see contracts.ts) |
| Dashboard | ✅ Running | http://localhost:5175 |
| ZK Proof API | ⏳ Ready to deploy | Vercel |

## What You Need

### For Vercel Deployment:
- **Vercel Account**: Free at [vercel.com](https://vercel.com)
- **No custom domain needed**: Vercel gives you `*.vercel.app` for free
- **No API keys needed**: The ZK proof API is stateless

### Already Have:
- ✅ Tenderly RPC URL
- ✅ Contract addresses
- ✅ Dashboard configured
- ✅ All dependencies installed

## Next Steps

1. **Deploy to Vercel** (5 minutes)
   ```bash
   ./deploy-vercel.sh
   ```

2. **Update Dashboard** (1 minute)
   ```bash
   cd dashboard
   echo 'VITE_ZK_API_URL=https://your-url.vercel.app' > .env.local
   npm run dev
   ```

3. **Test End-to-End** (10 minutes)
   - Create wallet
   - Deposit to vault
   - Verify ZK proof mode works
   - Check gas savings

4. **Deploy to Testnet** (optional)
   ```bash
   npm run deploy:testnet
   ```

## Cost Summary

| Service | Cost | What You Get |
|---------|------|--------------|
| Tenderly Virtual TestNet | FREE | Unlimited virtual ETH for testing |
| Vercel Hobby Plan | FREE | 100GB bandwidth, 100hrs execution |
| Base Sepolia Testnet | FREE | Real testnet deployment |
| Base Mainnet | GAS COSTS | Production deployment |

## Support

- **Vercel Issues**: Check `VERCEL_DEPLOYMENT.md`
- **Contract Issues**: Check `README.md` and `TENDERLY_SETUP.md`
- **ZK Proof Issues**: Check `ZK_SNARK_GUIDE.md`
- **Dashboard Issues**: Check browser console

## Files Overview

```
EthVaultPQ/
├── contracts/          # Solidity smart contracts
├── dashboard/          # React frontend (localhost:5175)
├── api/               # Vercel serverless functions
├── script/            # Deployment scripts
├── test/              # Contract tests
├── deploy-vercel.sh   # One-click Vercel deployment
├── QUICK_START.md     # This file
├── VERCEL_DEPLOYMENT.md  # Detailed Vercel guide
└── README.md          # Main documentation
```

## Verification Modes

Your contracts support 3 modes (switchable after deployment):

| Mode | Gas Cost | Speed | Requires API |
|------|----------|-------|--------------|
| ON_CHAIN | ~10M gas | Slow | No |
| ZK_PROOF | ~250k gas | Fast | Yes (Vercel) |
| HYBRID | Variable | Fast with fallback | Yes (Vercel) |

**Recommended**: Use `ZK_PROOF` for 97.5% gas savings

## Questions?

- **Do I need a custom domain?** No, Vercel gives you `*.vercel.app` for free
- **Do I need API keys?** No, the ZK proof API is stateless
- **How much does Vercel cost?** Free for development (Hobby plan)
- **Can I test locally?** Yes, dashboard already works locally
- **Do I need to redeploy contracts?** No, they're already on Tenderly

## Ready to Deploy?

```bash
# From project root
./deploy-vercel.sh
```

That's it! 🚀
