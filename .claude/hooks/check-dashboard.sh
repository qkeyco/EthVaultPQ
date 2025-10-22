#!/bin/bash
#
# Dashboard Health Check Hook
# Automatically checks for errors before displaying white screen
#

set -e

echo "🔍 Checking dashboard health..."

# Check if dashboard is running
if ! curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo "❌ Dashboard not running at http://localhost:5175"
    echo "💡 Starting dashboard..."
    cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/dashboard
    npm run dev &
    sleep 8
fi

# Check for TypeScript errors in critical files
echo "🔍 Checking TypeScript..."
cd /Users/jamestagg/Documents/GitHub/EthVaultPQ/dashboard

CRITICAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep -E "(SnapTab|App\.tsx)" | grep "error TS" | wc -l | tr -d ' ')

if [ "$CRITICAL_ERRORS" -gt 0 ]; then
    echo "❌ Found $CRITICAL_ERRORS critical TypeScript errors:"
    npx tsc --noEmit 2>&1 | grep -E "(SnapTab|App\.tsx)" | grep "error TS"
    exit 1
fi

# Check if page loads
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5175)

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ Dashboard returned HTTP $HTTP_STATUS"
    exit 1
fi

echo "✅ Dashboard health check passed!"
echo "🌐 http://localhost:5175"
exit 0
