# Simple Deployment Guide

## What You're Deploying

**One API endpoint:** `/api/prove`
- Generates ZK-SNARK proofs for Dilithium3 signatures
- No private keys needed
- No database needed
- Pure serverless function

## Deploy in 2 Minutes

### Step 1: Deploy to Vercel

```bash
cd api/zk-proof
vercel deploy --prod
```

**That's it!** No environment variables, no secrets, nothing else.

### Step 2: Test It

```bash
curl https://YOUR-DEPLOYMENT-URL/api/prove
```

Should return: Method not allowed (need POST)

```bash
curl -X POST https://YOUR-DEPLOYMENT-URL/api/prove \
  -H "Content-Type: application/json" \
  -d '{"message":"0x48656c6c6f","signature":"0x00...","publicKey":"0x00..."}'
```

Should return: Invalid signature (expected - we sent zeros)

**If you get these responses, it's working!** ✅

## Usage in Your dApp

User does everything from their browser:

```typescript
// 1. Request proof on-chain (user signs tx)
const tx = await oracle.requestProof(msg, sig, pk, { value: "0.001" });
const receipt = await tx.wait();
const requestId = receipt.logs[0].args.requestId;

// 2. Generate proof via Vercel (no signing needed!)
const res = await fetch('https://api.ethvault.qkey.co/api/prove', {
  method: 'POST',
  body: JSON.stringify({ message, signature, publicKey })
});
const { proof, publicSignals } = await res.json();

// 3. Submit proof on-chain (user signs tx)
await oracle.fulfillProof(requestId, proof.a, proof.b, proof.c, publicSignals);
```

## That's It!

No operator, no private keys, no complex setup.

Just deploy `/api/prove` and use it from your dApp.

**Total cost:** $0/month (Vercel Hobby plan)
