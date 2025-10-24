#!/bin/bash

# Automated Snap Publishing Script for EthVaultPQ
# This script handles building, testing, and publishing the MetaMask Snap to NPM

set -e  # Exit on error

echo "🚀 EthVaultPQ Snap Publishing Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if logged in to NPM
echo -e "${BLUE}📦 Checking NPM authentication...${NC}"
if ! npm whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to NPM. Please run: npm login${NC}"
    exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}✅ Logged in as: ${NPM_USER}${NC}"

# Step 2: Check for uncommitted changes
echo -e "${BLUE}🔍 Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: Uncommitted changes detected${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 3: Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📌 Current version: ${CURRENT_VERSION}${NC}"

# Step 4: Ask for new version
echo -e "${BLUE}🔢 Select version bump type:${NC}"
echo "  1) patch (0.1.0 → 0.1.1) - bug fixes"
echo "  2) minor (0.1.0 → 0.2.0) - new features"
echo "  3) major (0.1.0 → 1.0.0) - breaking changes"
echo "  4) custom - specify version manually"
read -p "Choice (1-4): " VERSION_CHOICE

case $VERSION_CHOICE in
    1) VERSION_TYPE="patch" ;;
    2) VERSION_TYPE="minor" ;;
    3) VERSION_TYPE="major" ;;
    4)
        read -p "Enter version (e.g., 0.2.0): " CUSTOM_VERSION
        VERSION_TYPE="$CUSTOM_VERSION"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Step 5: Clean build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist/
echo -e "${GREEN}✅ Clean complete${NC}"

# Step 6: Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 7: Build the Snap
echo -e "${BLUE}🔨 Building Snap...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# Step 8: Verify build artifacts
echo -e "${BLUE}🔍 Verifying build artifacts...${NC}"
if [ ! -f "dist/bundle.js" ]; then
    echo -e "${RED}❌ Build failed: dist/bundle.js not found${NC}"
    exit 1
fi
if [ ! -f "snap.manifest.json" ]; then
    echo -e "${RED}❌ snap.manifest.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build artifacts verified${NC}"

# Step 9: Update version
echo -e "${BLUE}📝 Updating version...${NC}"
if [ "$VERSION_CHOICE" == "4" ]; then
    npm version "$CUSTOM_VERSION" --no-git-tag-version
else
    npm version "$VERSION_TYPE" --no-git-tag-version
fi
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Version updated: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"

# Step 10: Dry run (optional)
echo -e "${BLUE}🔍 Running publish dry-run...${NC}"
npm publish --dry-run
echo -e "${GREEN}✅ Dry-run successful${NC}"

# Step 11: Confirm publication
echo ""
echo -e "${YELLOW}⚠️  Ready to publish ${NC}@qkey/ethvaultpq-snap@${NEW_VERSION}${YELLOW} to NPM${NC}"
echo -e "${YELLOW}   This action cannot be undone!${NC}"
read -p "Proceed with publication? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Publication cancelled${NC}"
    # Revert version change
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 1
fi

# Step 12: Publish to NPM
echo -e "${BLUE}🚀 Publishing to NPM...${NC}"
npm publish --access public
echo -e "${GREEN}✅ Published to NPM!${NC}"

# Step 13: Create git tag
echo -e "${BLUE}🏷️  Creating git tag...${NC}"
git add package.json snap.manifest.json
git commit -m "chore: release v${NEW_VERSION}" || true
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
echo -e "${GREEN}✅ Git tag created${NC}"

# Step 14: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Publication Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📦 Package: ${BLUE}@qkey/ethvaultpq-snap${NC}"
echo -e "🔢 Version: ${BLUE}v${NEW_VERSION}${NC}"
echo -e "👤 Published by: ${BLUE}${NPM_USER}${NC}"
echo -e "🔗 NPM: ${BLUE}https://www.npmjs.com/package/@qkey/ethvaultpq-snap${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Push git tag: git push origin v${NEW_VERSION}"
echo "  2. Push commits: git push"
echo "  3. Update dashboard SNAP_ID to: npm:@qkey/ethvaultpq-snap"
echo "  4. Deploy dashboard to Vercel"
echo ""
