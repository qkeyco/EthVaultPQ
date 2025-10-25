# Installing EthVaultPQ Snap in Production MetaMask

## Current Status

✅ **Published to NPM**: `@qkey/ethvaultpq-snap@0.1.1`
⚠️ **Works with**: MetaMask Flask (developer version)
🔴 **Not yet available**: Production MetaMask (requires directory listing)

## Why It Only Works with Flask

MetaMask has two versions:
1. **MetaMask Flask** - Developer preview with experimental features
   - Allows installing any Snap from NPM
   - No approval needed
   - Used for testing

2. **MetaMask (Production)** - Regular version used by millions
   - Requires Snaps to be listed in official directory
   - Needs MetaMask team review/approval
   - Protects users from unvetted Snaps

## How to Get Listed in MetaMask Snaps Directory

### Step 1: Prepare Your Snap

**Requirements:**
- ✅ Published to NPM (done!)
- ✅ Working Snap manifest (done!)
- ✅ README with clear description (done!)
- ⚠️ Icon/logo for Snap (recommended)
- ⚠️ Audit report (recommended for security Snaps)
- ✅ Open source repository (done!)

### Step 2: Create Snap Metadata

Create a file at root of your repo: `snap.manifest.json` should include:

```json
{
  "proposedName": "EthVaultPQ",
  "description": "Post-quantum secure wallet with Dilithium3 signatures and ZK-SNARK proofs",
  "repository": {
    "type": "git",
    "url": "https://github.com/qkeyco/EthVaultPQ.git"
  },
  "source": {
    "shasum": "...",
    "location": {
      "npm": {
        "packageName": "@qkey/ethvaultpq-snap"
      }
    }
  }
}
```

### Step 3: Submit to Directory

1. **Visit**: https://snaps.metamask.io/submit
2. **Fill in details**:
   - Snap name: EthVaultPQ
   - NPM package: `@qkey/ethvaultpq-snap`
   - Description: Post-quantum secure Ethereum wallet
   - Category: Security / Wallet Management
   - GitHub repo: https://github.com/qkeyco/EthVaultPQ
   - Website: https://ethvault.qkey.co
   - Support email: Your support email

3. **Review process**: MetaMask team will:
   - Review code for security
   - Test functionality
   - Check permissions usage
   - Verify description accuracy
   - Approve or request changes

### Step 4: Wait for Approval

- **Timeline**: Usually 1-4 weeks
- **Status**: Check email for updates
- **Questions**: MetaMask team may ask for clarifications

### Step 5: Go Live!

Once approved:
- ✅ Snap appears in MetaMask Snaps directory
- ✅ Works with production MetaMask
- ✅ Millions of potential users
- ✅ Official MetaMask branding/trust

## Alternative: Beta Testing with Flask

**For now, your users can:**

1. **Install MetaMask Flask**:
   - Visit: https://metamask.io/flask/
   - Download and install alongside regular MetaMask
   - Use for testing/early access

2. **Install your Snap**:
   - Visit: https://ethvault.qkey.co
   - Click "Install Snap"
   - Approve installation
   - Start using post-quantum wallet!

3. **Provide feedback**:
   - Test all features
   - Report bugs
   - Help improve before production launch

## Recommended Path Forward

### Phase 1: Beta Testing (Current)
- ✅ NPM published
- ✅ Works with Flask
- ✅ Dashboard live
- **Action**: Gather beta testers with Flask
- **Goal**: Test thoroughly, fix bugs

### Phase 2: Security Audit
- **Action**: Get professional security audit
- **Why**: Required for production crypto wallet
- **Cost**: $5,000-$20,000 (varies)
- **Benefit**: Increases trust, required by MetaMask

### Phase 3: Directory Submission
- **Action**: Submit to MetaMask directory
- **When**: After audit and thorough testing
- **Timeline**: 1-4 weeks review
- **Outcome**: Production MetaMask support

### Phase 4: Production Launch
- ✅ Listed in directory
- ✅ Audited and secure
- ✅ Works with regular MetaMask
- ✅ Ready for millions of users

## Marketing Your Snap to Flask Users

While waiting for directory approval, promote to Flask users:

**Messaging:**
```
🚀 Early Access: EthVaultPQ Snap
Post-quantum secure wallet - Now in beta!

Install MetaMask Flask to try it:
1. Get Flask: https://metamask.io/flask/
2. Visit: https://ethvault.qkey.co
3. Install the Snap
4. Create your quantum-resistant wallet!

Beta testers get priority support and contribute to making 
Ethereum quantum-safe. Join us!
```

## FAQ

**Q: Can I use both Flask and regular MetaMask?**
A: Yes! They run side-by-side. Flask for testing, regular for daily use.

**Q: Will my Snap work after directory approval?**
A: Yes! Same NPM package, just unlocked for production users.

**Q: Do I need to resubmit for updates?**
A: No. Once approved, you can publish updates to NPM. Major changes may need re-review.

**Q: Is Flask safe to use?**
A: Flask is safe but experimental. Don't use with large funds during testing.

**Q: How long until production?**
A: Realistically 2-4 months (audit + review + testing)

## Support Resources

- MetaMask Snaps Docs: https://docs.metamask.io/snaps/
- Directory Submission: https://snaps.metamask.io/submit
- Flask Download: https://metamask.io/flask/
- Your Dashboard: https://ethvault.qkey.co

