# Fix Vercel Deployment Protection

## Issue

Your Vercel deployment has **Deployment Protection** enabled, which requires authentication to access the API endpoints.

Current URL: `https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app`

## Quick Fix (2 minutes)

### Option 1: Disable Protection via Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on project: **ethvaultpq-zk-prover**
3. Go to **Settings** tab
4. Click **Deployment Protection** in left sidebar
5. Set protection to **Disabled** or **Only Preview Deployments**
6. Click **Save**

**Result:** API will be publicly accessible (which is fine since it's stateless)

### Option 2: Use Vercel CLI

```bash
cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/zk-dilithium

# Disable deployment protection
vercel env rm VERCEL_DEPLOYMENT_PROTECTION
```

## After Disabling Protection

Test the API:

```bash
# Health check
curl https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app/api/health

# Should return:
# {
#   "status": "healthy",
#   "service": "EthVaultPQ ZK Prover",
#   "timestamp": "...",
#   "version": "1.0.0"
# }

# Test proof generation
curl -X POST https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app/api/prove \
  -H "Content-Type: application/json" \
  -d '{
    "message": "0x48656c6c6f",
    "signature": "0x1234567890",
    "publicKey": "0xabcdef"
  }'

# Should return mock proof with timing metrics
```

## Why Is Protection Enabled?

Vercel enables deployment protection by default on some plans to:
- Prevent unauthorized access during development
- Protect private APIs

**For this project:** Our ZK proof API is **stateless and public** - it's designed to be called by anyone, so protection isn't needed.

## Alternative: Keep Protection + Use Bypass Token

If you want to keep protection enabled:

1. Get bypass token from Vercel dashboard
2. Add to dashboard environment:
   ```bash
   # dashboard/.env.local
   VITE_VERCEL_BYPASS_TOKEN=your_bypass_token_here
   ```
3. Update API calls to include bypass token

**Not recommended** for this use case since the API should be public.

## Current Status

✅ **Deployment successful:** https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app
✅ **Dashboard configured:** .env.local created with API URL
⏳ **Needs:** Disable deployment protection to test

## After Fix

Once protection is disabled, the dashboard will be able to call the API and you can test the full flow!
