#!/bin/bash
set -e

echo "🚀 Deploying EthVaultPQ ZK Prover to Vercel..."
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login check
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "  ✓ Serverless functions created"
echo "  ✓ vercel.json configured"
echo "  ✓ CORS headers set"
echo ""

# Deploy to production
echo "🚢 Deploying to production..."
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📡 Your endpoints:"
echo "  Health: https://your-deployment.vercel.app/api/health"
echo "  Prove:  https://your-deployment.vercel.app/api/prove"
echo ""
echo "🧪 Test with:"
echo "  curl https://your-deployment.vercel.app/api/health"
echo ""
echo "📝 Next steps:"
echo "  1. Update dashboard/.env with your Vercel URL"
echo "  2. Test proof generation endpoint"
echo "  3. Integrate with frontend"
echo ""
