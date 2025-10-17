# Vercel Quick Start - 3 Simple Steps

## Your Current Situation

✅ **You have:** API deployed to Vercel (via CLI)
✅ **You have:** GitHub repo at https://github.com/qkeyco/EthVaultPQ
❌ **Missing:** GitHub ↔ Vercel connection
❌ **Missing:** Deployment protection disabled

## The Easiest Path Forward (3 Steps)

### Step 1: Access Your Vercel Project (30 seconds)

1. Open browser
2. Go to: [vercel.com/dashboard](https://vercel.com/dashboard)
3. You should see project: **ethvaultpq-zk-prover**
4. Click on it

### Step 2: Disable Deployment Protection (30 seconds)

**In your project dashboard:**

1. Click **Settings** tab (top navigation)
2. Scroll down left sidebar
3. Click **Deployment Protection**
4. You'll see a dropdown that says "Standard Protection" or similar
5. Change it to: **Disabled**
6. Click **Save** button

**That's it!** Your API is now publicly accessible.

### Step 3: (Optional) Connect to GitHub (1 minute)

Still in **Settings** tab:

1. Click **Git** in left sidebar
2. Click **Connect Git Repository** button
3. Select **GitHub**
4. Search for: `EthVaultPQ`
5. Select `qkeyco/EthVaultPQ`
6. **Important:** Set "Root Directory" to: `zk-dilithium`
7. Click **Connect**

**Done!** Now Vercel will auto-deploy when you push to GitHub.

## Test It Works

Open terminal and run:

```bash
curl https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "EthVaultPQ ZK Prover",
  "timestamp": "2025-10-17T00:15:48.000Z",
  "version": "1.0.0"
}
```

If you see JSON (not HTML), you're good! ✅

## Visual Guide

```
Browser
  ↓
vercel.com/dashboard
  ↓
Click "ethvaultpq-zk-prover"
  ↓
Settings → Deployment Protection → Disabled → Save
  ↓
Settings → Git → Connect Repository → qkeyco/EthVaultPQ
  ↓
Set Root Directory: zk-dilithium → Connect
  ↓
Done! 🎉
```

## What If...

**"I can't find my project in Vercel dashboard"**
- Log in with the same account you used for `vercel login`
- Check you're on the right team (dropdown in top-left)

**"I don't see 'Deployment Protection' in settings"**
- Look in left sidebar under "Security" or "General"
- Might be called "Protection" or "Access Control"

**"I don't see my GitHub repo"**
- Click "Add GitHub Account"
- Grant Vercel access to your repos
- Try again

**"What's my Vercel login?"**
- The account you used when you ran `vercel login` in terminal
- Check with: `vercel whoami`

## After This

Your stack will be:

```
Dashboard (localhost:5175)
    ↓
Vercel API (ethvaultpq-zk-prover...vercel.app) ← Publicly accessible
    ↓
Returns mock ZK proofs
    ↓
Smart Contracts (Tenderly)
```

Then you can test the full flow in your dashboard! 🚀

## Super Simple Version

1. Go to vercel.com/dashboard
2. Click your project
3. Settings → Deployment Protection → Disabled → Save
4. Test: `curl your-url/api/health`

That's all you need to get started!
