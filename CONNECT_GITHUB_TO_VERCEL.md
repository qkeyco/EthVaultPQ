# Connect GitHub Repository to Vercel

## Your Repository

GitHub URL: **https://github.com/qkeyco/EthVaultPQ**

## Option 1: Connect via Vercel Dashboard (Easiest - 3 minutes)

### Step 1: Go to Vercel Dashboard

1. Open [vercel.com/new](https://vercel.com/new)
2. You should see "Import Git Repository" section

### Step 2: Import Your Repository

**If you see a list of repositories:**
- Look for `qkeyco/EthVaultPQ`
- Click **Import**

**If you DON'T see your repository:**
1. Click **"Add GitHub Account"** or **"Adjust GitHub App Permissions"**
2. This will open GitHub authorization
3. Grant Vercel access to `qkeyco/EthVaultPQ` repository
4. Go back to Vercel, you should now see the repo
5. Click **Import**

### Step 3: Configure Project Settings

When you import, Vercel will ask:

**Project Name:**
```
ethvaultpq-zk-prover
```

**Framework Preset:**
```
Other
```

**Root Directory:**
```
zk-dilithium
```
⚠️ **Important:** Set root directory to `zk-dilithium` since that's where the API code is!

**Build Command:**
```
(leave empty - no build needed for serverless functions)
```

**Output Directory:**
```
(leave empty)
```

**Install Command:**
```
npm install
```

### Step 4: Deploy

1. Click **Deploy**
2. Wait ~2 minutes
3. You'll get a production URL like: `https://ethvaultpq-zk-prover.vercel.app`

### Step 5: Disable Deployment Protection

1. Once deployed, go to project settings
2. Click **Deployment Protection** in sidebar
3. Set to **Disabled** or **Only Preview Deployments**
4. Click **Save**

## Option 2: Link Existing Deployment to GitHub (Faster - 1 minute)

Since you already deployed via CLI, you can just link it:

### Step 1: Go to Your Project

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **ethvaultpq-zk-prover** project

### Step 2: Connect Git Repository

1. Go to **Settings** tab
2. Click **Git** in the left sidebar
3. Click **Connect Git Repository**
4. Select **GitHub**
5. Search for: `qkeyco/EthVaultPQ`
6. Select it
7. Set **Root Directory** to: `zk-dilithium`
8. Click **Connect**

### Step 3: Disable Deployment Protection

1. Still in Settings
2. Click **Deployment Protection** in sidebar
3. Set to **Disabled**
4. Click **Save**

## Option 3: Use Vercel CLI (Current Method - Already Done!)

You've already deployed using:
```bash
vercel --prod --yes
```

This created the deployment, but it's not linked to GitHub yet. Use **Option 2** above to link it.

## Why Link to GitHub?

**Benefits:**
1. **Auto-deploy on push** - Every time you push to GitHub, Vercel redeploys
2. **Preview deployments** - Each branch/PR gets its own URL
3. **Easier management** - See deployments in dashboard
4. **Rollbacks** - Easy to revert to previous versions

**Without GitHub:**
- You have to run `vercel --prod` manually every time
- No preview deployments
- Harder to track changes

## Current Status

✅ **Deployed via CLI:** https://ethvaultpq-zk-prover-oiyil02ir-valis-quantum.vercel.app
❌ **Not connected to GitHub yet**
⏳ **Next:** Link to GitHub using Option 2 above

## After Connecting to GitHub

Once connected, you can:

1. **Auto-deploy:** Push to GitHub → Vercel deploys automatically
2. **See deployments:** View all deployments in Vercel dashboard
3. **Branch previews:** Each git branch gets its own test URL

## Troubleshooting

### "I don't see my repository"

**Solution:** Grant Vercel access to your GitHub repos

1. Go to [github.com/settings/installations](https://github.com/settings/installations)
2. Find **Vercel**
3. Click **Configure**
4. Under "Repository access":
   - Select **Only select repositories**
   - Add `qkeyco/EthVaultPQ`
5. Click **Save**
6. Go back to Vercel, you should now see the repo

### "Root directory not found"

**Solution:** Make sure you set Root Directory to `zk-dilithium`

The API code is in the `zk-dilithium/` folder, not the project root.

### "Build failed"

**Solution:** Make sure Build Command is empty

Serverless functions don't need a build step - Vercel builds them automatically.

## Quick Reference

| Setting | Value |
|---------|-------|
| GitHub Repo | https://github.com/qkeyco/EthVaultPQ |
| Root Directory | `zk-dilithium` |
| Build Command | (empty) |
| Output Directory | (empty) |
| Install Command | `npm install` |
| Node Version | 18.x (default) |

## Next Steps

1. ✅ Connect GitHub repo using Option 2
2. ✅ Disable deployment protection
3. ✅ Test API endpoints
4. ✅ Test dashboard integration

Need help with any step? Just ask!
