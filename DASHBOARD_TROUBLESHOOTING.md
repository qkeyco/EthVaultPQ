# Dashboard White Screen - Troubleshooting Guide

## What I Just Fixed

1. ✅ Added `src/vite-env.d.ts` - TypeScript environment variable types
2. ✅ Fixed `zkProofApi.ts` - Changed `process.env` to `import.meta.env`
3. ✅ Added temporary WalletConnect project ID to `wagmi.ts`

## Try This Now

### Step 1: Hard Refresh Your Browser

The dashboard has hot-reloaded, but your browser might be caching the old broken version.

**On Chrome/Firefox:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Or:**
- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"

### Step 2: Check Browser Console for Errors

1. Open browser to `http://localhost:5175`
2. Press `F12` to open DevTools
3. Click **Console** tab
4. Look for red error messages
5. Share the error message with me if you see one

### Step 3: Restart the Dev Server

If hard refresh doesn't work:

```bash
# Kill the current server
# (In your terminal where it's running, press Ctrl+C)

# Then restart
cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/dashboard
npm run dev
```

Then try `http://localhost:5175` again.

## Common Issues & Fixes

### Issue 1: WalletConnect Project ID Error

**Error in console:**
```
projectId is required
```

**Fix:**
I've added a temporary public ID. For production, get your own:
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create free account
3. Create new project
4. Copy Project ID
5. Add to `dashboard/.env.local`:
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your_real_project_id
   ```

### Issue 2: Import.meta.env Not Defined

**Error in console:**
```
Cannot read property 'env' of undefined
```

**Fix:**
Already fixed by creating `src/vite-env.d.ts`

If still happening, restart dev server.

### Issue 3: Module Not Found Errors

**Error in console:**
```
Failed to resolve module
```

**Fix:**
```bash
cd dashboard
rm -rf node_modules
npm install
npm run dev
```

### Issue 4: Port Already in Use

**Error in terminal:**
```
Port 5175 is already in use
```

**Fix:**
```bash
# Find and kill process on port 5175
lsof -ti:5175 | xargs kill

# Then restart
npm run dev
```

## What Should You See?

When working correctly, the dashboard should show:

1. **Header:**
   - "PQ Wallet - Post-Quantum Secure Ethereum Wallet"

2. **Main Content:**
   - Verification Mode Configuration section
     - Three mode cards (On-Chain, ZK-SNARK Proof, Hybrid)
     - Gas savings comparison
   - Wallet Creator section
   - Vault Manager section

3. **Footer:**
   - "Built with ERC-4337, ERC-4626, and Post-Quantum Cryptography"
   - Warning message

## Debug Checklist

- [ ] Vite dev server is running (check terminal)
- [ ] Port 5175 is accessible
- [ ] Hard refreshed browser (Cmd+Shift+R / Ctrl+Shift+R)
- [ ] Checked browser console for errors (F12)
- [ ] `src/vite-env.d.ts` exists
- [ ] `.env.local` has correct values

## If Still White Screen

Run this diagnostic:

```bash
cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/dashboard

# Check if server is running
curl -s http://localhost:5175 | head -20

# Should show HTML with <title>PQ Wallet

# Check TypeScript
npx tsc --noEmit

# Should show no errors (or just warnings about unused variables)
```

## Current .env.local Contents

Your dashboard should have:

```bash
# dashboard/.env.local
VITE_ZK_API_URL=https://ethvaultpq-zk-prover-kq398y4jj-valis-quantum.vercel.app
VITE_ZK_API_KEY=fc32852cdb5cae755e3c722e4427ef5c
```

## Let Me Know

If the dashboard is still showing a white screen after:
1. Hard refresh (Cmd+Shift+R)
2. Checking browser console

**Share with me:**
- What error(s) you see in browser console (F12 → Console tab)
- Any errors in terminal where `npm run dev` is running

I'll help debug from there!
