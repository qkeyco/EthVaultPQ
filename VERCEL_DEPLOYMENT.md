# Vercel Deployment Guide

This guide walks through deploying the ZK Proof API to Vercel.

## Overview

The EthVaultPQ project uses a Vercel serverless function to generate ZK-SNARK proofs for Dilithium signature verification. This reduces on-chain gas costs from ~10M to ~250k (97.5% savings).

**Architecture:**
```
User → Dashboard → Vercel API → ZK Proof Generation → Return Proof → Submit to Contract
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional): `npm install -g vercel`
3. **GitHub Repository**: Connect your repo to Vercel

## Project Structure

```
EthVaultPQ/
├── api/
│   └── zk-proof/
│       └── index.ts        # Serverless ZK proof generator
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies (@vercel/node, snarkjs, circomlib)
└── dashboard/
    └── src/
        └── lib/
            └── zkProofApi.ts  # Client library
```

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository: `EthVaultPQ`
   - Select the repository

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: Leave empty (no build needed for API-only)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Environment Variables**
   - No environment variables needed for the basic ZK proof API
   - (Optional) Add `NODE_ENV=production`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2-3 minutes)
   - Note your deployment URL: `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/EthVaultPQ
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? pq-wallet-vault
# - Directory? ./ (current directory)
# - Override settings? No

# For production deployment
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Dashboard Environment Variables

After deployment, update your dashboard to use the production API:

```bash
# dashboard/.env
VITE_ZK_API_URL=https://your-project.vercel.app
```

Or in `dashboard/.env.local`:
```bash
VITE_ZK_API_URL=https://your-actual-project-name.vercel.app
```

### 2. Rebuild Dashboard

```bash
cd dashboard
npm run build
```

### 3. Test API Endpoint

Test that your API is working:

```bash
curl https://your-project.vercel.app/api/zk-proof \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "message": "0x48656c6c6f",
    "signature": "0x1234...",
    "publicKey": "0xabcd..."
  }'
```

## API Endpoints

### POST /api/zk-proof

Generate a ZK-SNARK proof for Dilithium signature verification.

**Request:**
```json
{
  "message": "0x48656c6c6f20576f726c64",
  "signature": "0x<3293 bytes hex>",
  "publicKey": "0x<1952 bytes hex>",
  "userOpHash": "0x<32 bytes hex>" // optional
}
```

**Response:**
```json
{
  "proof": {
    "a": ["0x...", "0x..."],
    "b": [["0x...", "0x..."], ["0x...", "0x..."]],
    "c": ["0x...", "0x..."]
  },
  "publicSignals": ["0x...", "0x..."],
  "isValid": true,
  "timestamp": 1697654321000,
  "gasEstimate": 250000
}
```

## Configuration Files

### vercel.json

```json
{
  "version": 2,
  "name": "pq-wallet-vault",
  "functions": {
    "api/zk-proof/index.ts": {
      "memory": 3008,      // 3GB RAM for ZK proof generation
      "maxDuration": 60    // 60 seconds timeout
    }
  },
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/zk-proof/health"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

### package.json

```json
{
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    "snarkjs": "^0.7.0",
    "circomlib": "^2.0.5"
  }
}
```

## Dashboard Integration

The dashboard automatically uses the ZK proof API when:
1. Verification mode is set to `ZK_PROOF` or `HYBRID`
2. User submits a transaction requiring signature verification

**Client Code** (`dashboard/src/lib/zkProofApi.ts`):
```typescript
import { generateZKProof, encodeZKProof } from './zkProofApi';

// Generate proof
const proofResponse = await generateZKProof({
  message: messageHex,
  signature: signatureHex,
  publicKey: publicKeyHex,
});

// Encode for Solidity
const encodedProof = encodeZKProof(proofResponse.proof);

// Submit to contract
await walletClient.writeContract({
  address: validatorAddress,
  abi: pqValidatorAbi,
  functionName: 'verifyDilithium',
  args: [messageHex, encodedProof, publicKeyHex],
});
```

## Monitoring & Debugging

### View Logs

**Vercel Dashboard:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Logs" tab
4. Filter by function: `api/zk-proof/index`

**CLI:**
```bash
vercel logs your-project-name
```

### Common Issues

**Issue: 504 Timeout**
- **Cause**: ZK proof generation taking > 60 seconds
- **Solution**: Increase `maxDuration` in `vercel.json` (requires Pro plan for > 60s)

**Issue: 413 Payload Too Large**
- **Cause**: Dilithium signature too large (3293 bytes)
- **Solution**: Already configured with 3GB memory

**Issue: CORS Errors**
- **Cause**: Missing CORS headers
- **Solution**: Check `vercel.json` headers configuration

## Cost Estimation

### Vercel Pricing

**Hobby Plan (Free):**
- 100GB bandwidth/month
- 100 hours serverless function execution
- 60 second max duration
- **Best for**: Development & testing

**Pro Plan ($20/month):**
- 1TB bandwidth
- 1000 hours execution
- 300 second max duration
- **Best for**: Production with moderate usage

### Expected Usage

Assuming 1000 transactions/month:
- **Execution time**: ~2-5 seconds per proof
- **Total execution**: 2000-5000 seconds = ~1.4 hours/month
- **Bandwidth**: ~3KB request + ~1KB response = 4MB/month

**Recommendation**: Hobby plan sufficient for initial launch

## Production Checklist

Before going to production:

- [ ] Deploy to Vercel (stable URL)
- [ ] Update `VITE_ZK_API_URL` in dashboard `.env`
- [ ] Test API endpoint with real signatures
- [ ] Verify CORS headers work from dashboard domain
- [ ] Set up monitoring/alerts in Vercel dashboard
- [ ] Configure custom domain (optional)
- [ ] Enable deployment protection (optional)
- [ ] Set up GitHub integration for auto-deploy on push
- [ ] Test gas savings on testnet
- [ ] Document API rate limits

## Advanced Configuration

### Custom Domain

1. **Add Domain** in Vercel dashboard
2. **Update DNS** records as instructed
3. **Update** `VITE_ZK_API_URL` to custom domain

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// api/zk-proof/index.ts
import rateLimit from '@vercel/edge-rate-limit';

const limiter = rateLimit({
  limit: 10,
  duration: '1m',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await limiter.check(req, 10, 'CACHE_TOKEN');
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // ... rest of handler
}
```

### Caching

Enable caching for repeated proofs:

```typescript
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

## Security Considerations

1. **No Secrets Required**: API is stateless, no API keys needed
2. **Input Validation**: All inputs validated before processing
3. **Rate Limiting**: Recommended for production
4. **CORS**: Configure specific origins in production
5. **HTTPS Only**: Enforced by Vercel

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Serverless Functions**: [vercel.com/docs/functions](https://vercel.com/docs/functions)
- **Project Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## Next Steps

1. Deploy API to Vercel
2. Test with dashboard
3. Monitor gas savings on testnet
4. Optimize proof generation time
5. Consider implementing proof caching
6. Set up production monitoring
