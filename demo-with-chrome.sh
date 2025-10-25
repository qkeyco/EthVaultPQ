#!/bin/bash

# Demo launcher using your existing Chrome
# This connects to your already-open Chrome browser

echo "🎬 EthVaultPQ Demo with Your Chrome"
echo "====================================="
echo ""
echo "📋 Setup Instructions:"
echo "1. Make sure Chrome is OPEN with your james.tagg@valiscorp.com profile"
echo "2. Make sure MetaMask extension is visible"
echo "3. Make sure you're on localhost:5175 (or will navigate there)"
echo ""
echo "Press Enter to start the automated demo..."
read

# Launch Chrome in remote debugging mode
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/Library/Application Support/Google/Chrome" \
  http://localhost:5175 &

CHROME_PID=$!

echo "✅ Chrome launched with remote debugging"
echo "🔌 Playwright will connect on port 9222"
echo ""

sleep 3

# Run Playwright connected to Chrome
echo "🚀 Starting automated demo..."
npx playwright test demo-automation-simple.ts --headed

echo ""
echo "✅ Demo complete!"
echo "📸 Check current directory for demo-*.png screenshots"
