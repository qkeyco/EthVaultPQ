# EthVaultPQ Snap Deployment Guide

## Overview

This guide covers deploying the EthVaultPQ MetaMask Snap to NPM and updating the dashboard to use the published version.

## Prerequisites

- NPM account with publish access to `@ethvaultpq` scope
- GitHub repository access
- Vercel account with `ethvaultpq` project access

## Deployment Methods

### Method 1: Automated Script (Recommended)

```bash
cd metamask-snap
npm run publish:snap
```

The script will:
1. ✅ Verify NPM authentication
2. ✅ Check for uncommitted changes
3. ✅ Clean and rebuild the Snap
4. ✅ Prompt for version bump (patch/minor/major/custom)
5. ✅ Run publish dry-run for verification
6. ✅ Publish to NPM with confirmation
7. ✅ Create git tag and commit

### Method 2: GitHub Actions

1. Go to GitHub Actions tab
2. Select "Publish Snap to NPM" workflow
3. Click "Run workflow"
4. Choose version bump type
5. Click "Run"

The workflow will:
- Build and publish to NPM
- Create GitHub release
- Tag the commit

### Method 3: Manual Publishing

```bash
cd metamask-snap

# 1. Clean build
rm -rf dist/
npm install
npm run build

# 2. Update version
npm version patch  # or minor/major

# 3. Publish
npm publish --access public

# 4. Tag and push
git push --tags
git push
```

## Post-Deployment Steps

### 1. Verify NPM Publication

Check that the package is available:
```bash
npm info @qkey/ethvaultpq-snap
```

Visit: https://www.npmjs.com/package/@qkey/ethvaultpq-snap

### 2. Test Installation

In a test project:
```bash
# Users will install with:
npm:@qkey/ethvaultpq-snap
```

### 3. Update Dashboard

The dashboard automatically uses `npm:@qkey/ethvaultpq-snap` in production.

To deploy dashboard:
```bash
cd dashboard
vercel --prod --yes
```

Or use Vercel GitHub integration (automatic on push to main).

### 4. Update Documentation

Update any references to the Snap ID in:
- README.md
- User guides
- Integration docs

## Environment Configuration

### Local Development
- Snap ID: `local:http://localhost:8080`
- Dashboard: `http://localhost:5175`
- Snap server: `npm run serve`

### Production
- Snap ID: `npm:@qkey/ethvaultpq-snap`
- Dashboard: `https://ethvault.qkey.co`
- No Snap server needed (served from NPM)

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes, no breaking changes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

## Troubleshooting

### NPM Authentication Failed
```bash
npm login
# Enter credentials
npm whoami  # Verify
```

### Build Fails
```bash
rm -rf dist/ node_modules/
npm install
npm run build
```

### Snap Not Loading in MetaMask
- Clear MetaMask Snap cache
- Remove and reinstall Snap
- Check NPM package is published
- Verify Snap ID is correct

### Version Conflicts
```bash
# Revert version change
git checkout package.json snap.manifest.json
# Try again with correct version
```

## Security Notes

- Never publish with uncommitted changes
- Always run dry-run first
- Verify shasum matches in snap.manifest.json
- Test in local environment before publishing
- Use scoped package (`@qkey/ethvaultpq-snap`) for namespacing

## Automation Setup

### GitHub Secrets Required

Add to GitHub repository secrets:
- `NPM_TOKEN`: NPM automation token with publish access

To create NPM token:
1. Login to npmjs.com
2. Access Tokens → Generate New Token
3. Choose "Automation" type
4. Copy token to GitHub secrets

### Vercel Integration

Vercel automatically deploys on push to main branch. No additional setup needed if already configured.

## Rollback Procedure

If a published version has critical bugs:

1. **Publish hotfix**:
   ```bash
   # Fix the bug
   npm version patch
   npm publish
   ```

2. **Deprecate broken version** (if needed):
   ```bash
   npm deprecate @qkey/ethvaultpq-snap@0.1.1 "Critical bug, use 0.1.2+"
   ```

3. **Never unpublish** (breaks existing users):
   NPM policy prevents unpublishing after 24 hours.

## Support

- Issues: https://github.com/ethvaultpq/ethvaultpq-snap/issues
- Docs: https://docs.ethvault.qkey.co
- Discord: https://discord.gg/ethvaultpq

