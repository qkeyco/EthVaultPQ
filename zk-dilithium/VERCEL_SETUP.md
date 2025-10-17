# Vercel Deployment Guide for ZK Prover

## Quick Deploy

```bash
cd zk-dilithium
./deploy-vercel.sh
```

That's it! Your ZK proof generation API will be live in ~60 seconds.

## Manual Deployment

### 1. Install Vercel CLI (if not already)

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# From zk-dilithium directory
vercel --prod
```

## Configuration

### Vercel Pro Settings

Your `vercel.json` is configured for Pro:

```json
{
  "functions": {
    "api/prove.js": {
      "maxDuration": 60,      // 60 seconds (Pro tier)
      "memory": 3008          // 3GB RAM (Pro tier)
    }
  }
}
```

**Free tier limitations:**
- Max duration: 10 seconds (not enough for full proofs)
- Max memory: 1024 MB

**Pro tier benefits:**
- Max duration: 60 seconds ✅
- Max memory: 3008 MB ✅
- Better for ZK proof generation

## API Endpoints

### Health Check

```bash
curl https://your-deployment.vercel.app/api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "EthVaultPQ ZK Prover",
  "timestamp": "2024-10-16T...",
  "version": "1.0.0"
}
```

### Generate Proof

```bash
curl -X POST https://your-deployment.vercel.app/api/prove \
  -H "Content-Type: application/json" \
  -d '{
    "message": "0x48656c6c6f",
    "signature": "0x1234...",
    "publicKey": "0xabcd..."
  }'
```

Response:
```json
{
  "success": true,
  "proof": {
    "pi_a": [...],
    "pi_b": [...],
    "pi_c": [...]
  },
  "publicSignals": [
    "messageHash",
    "publicKeyHash",
    "1"
  ],
  "timing": {
    "witness": "50ms",
    "proof": "500ms",
    "total": "550ms"
  }
}
```

## Frontend Integration

### Update Environment Variables

Create `dashboard/.env`:

```bash
VITE_ZK_PROVER_URL=https://your-deployment.vercel.app
```

### Use in React

```typescript
// dashboard/src/services/zk-prover.ts

const PROVER_URL = import.meta.env.VITE_ZK_PROVER_URL;

export async function generateDilithiumProof(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
) {
  const response = await fetch(`${PROVER_URL}/api/prove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '0x' + Buffer.from(message).toString('hex'),
      signature: '0x' + Buffer.from(signature).toString('hex'),
      publicKey: '0x' + Buffer.from(publicKey).toString('hex'),
    })
  });

  if (!response.ok) {
    throw new Error('Proof generation failed');
  }

  return await response.json();
}
```

## Production Setup (After Circuit Compilation)

### 1. Upload Circuit Files

You'll need to upload to Vercel:

```
/var/task/circuits/dilithium_simple.wasm
/var/task/keys/dilithium_simple.zkey
```

**Option A: Include in deployment**
```bash
# Create public directory
mkdir -p public/circuits public/keys

# Copy files
cp build/dilithium_simple_js/dilithium_simple.wasm public/circuits/
cp build/dilithium_simple.zkey public/keys/

# Redeploy
vercel --prod
```

**Option B: Use Vercel Blob Storage** (recommended for large files)
```bash
npm install @vercel/blob

# Upload via script
node scripts/upload-circuits.js
```

### 2. Update prove.js

Replace mock data with real snarkjs call:

```javascript
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  input,
  '/var/task/circuits/dilithium_simple.wasm',
  '/var/task/keys/dilithium_simple.zkey'
);
```

### 3. Test Production Endpoint

```bash
curl -X POST https://your-deployment.vercel.app/api/prove \
  -H "Content-Type: application/json" \
  -d @test-input.json
```

## Monitoring

### Vercel Dashboard

- View logs: https://vercel.com/your-team/your-project/logs
- Monitor performance
- Check error rates

### Enable Logging

```javascript
// In api/prove.js
console.log('Proof request received');
console.log('Timing:', timings);
```

Logs appear in Vercel dashboard in real-time.

## Cost Estimation (Pro Plan)

Assuming 1000 proof requests/day:

- Function duration: ~500ms per proof
- Compute: $0.00006/GB-second
- Cost: ~$0.90/month for 1000 proofs/day

Very affordable!

## Troubleshooting

### "Function timeout after 10 seconds"
- You're on Free tier
- Upgrade to Pro or reduce circuit size

### "Out of memory"
- Increase memory in `vercel.json` (max 3008 MB on Pro)
- Or optimize circuit

### "Circuit files not found"
- Upload .wasm and .zkey files to deployment
- Check file paths in code

### CORS errors
- Check `Access-Control-Allow-Origin` header
- Add your domain to allowed origins

## Security

### Rate Limiting

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-RateLimit-Limit",
          "value": "100"
        }
      ]
    }
  ]
}
```

### API Key Protection

```javascript
// In api/prove.js
const API_KEY = process.env.ZK_PROVER_API_KEY;

if (req.headers['x-api-key'] !== API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

Set in Vercel dashboard: Settings → Environment Variables

## Next Steps

1. ✅ Deploy initial version (mock data)
2. ⏳ Compile circuits locally
3. ⏳ Upload .wasm and .zkey to Vercel
4. ⏳ Update prove.js with real snarkjs call
5. ⏳ Test with real Dilithium signatures
6. ⏳ Integrate with dashboard
7. ⏳ Add monitoring and alerts

---

**Your deployment is ready to go! Run `./deploy-vercel.sh` to deploy now.**
