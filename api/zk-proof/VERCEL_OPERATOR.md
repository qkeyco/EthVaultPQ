# Vercel-Only Operator Solution

**NO SEPARATE PROCESS NEEDED!** Everything runs on Vercel.

## How It Works

### Old Way (Separate Operator) ❌
```
User → Oracle → Event → Operator Process (VPS) → API → Back to Oracle
```
**Problem:** Need to run a separate server 24/7

### New Way (Vercel Only) ✅
```
User → Oracle → Event → Vercel Cron (every minute) → API → Back to Oracle
```
**Benefit:** Everything in one place, no extra servers!

---

## Architecture

**Two Vercel API Endpoints:**

### 1. `/api/prove` - Generate Proofs
Already exists! Takes (message, signature, publicKey) → Returns ZK proof

### 2. `/api/fulfill` - Auto-Fulfill Requests (NEW!)
- Runs every minute via Vercel Cron
- Checks for unfulfilled requests
- Calls `/api/prove` internally
- Submits proofs to oracle

---

## Setup

### 1. Add Environment Variables to Vercel

```bash
# Required for /api/fulfill
TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_ID
ZK_ORACLE_ADDRESS=0x312D098B64e32ef04736662249bd57AEfe053750
OPERATOR_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Existing (already set)
# ...other vars...
```

**How to add:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add the 3 new variables above

### 2. Deploy to Vercel

```bash
cd api/zk-proof
vercel deploy --prod
```

**That's it!** The cron job automatically starts running.

---

## How It Operates

### Automatic (Cron - Every Minute)
Vercel automatically calls `/api/fulfill` every minute:
- Checks last 100 blocks for ProofRequested events
- Finds unfulfilled requests
- Generates and submits proofs
- **Max delay:** 1 minute

### Manual (On-Demand)
You can also trigger fulfillment manually:

```bash
# Fulfill all pending requests
curl -X POST https://api.ethvault.qkey.co/api/fulfill

# Fulfill specific request
curl -X POST https://api.ethvault.qkey.co/api/fulfill \
  -H "Content-Type: application/json" \
  -d '{"requestId": "0x..."}'
```

### Webhook (Instant - Future)
For instant fulfillment, set up a webhook from Tenderly:
1. Tenderly Dashboard → Alerts
2. Create alert for ProofRequested event
3. Webhook URL: `https://api.ethvault.qkey.co/api/fulfill`
4. **Result:** Instant fulfillment (< 1 second)

---

## Comparison

| Feature | Separate Operator | Vercel Cron | Vercel Webhook |
|---------|------------------|-------------|----------------|
| **Extra Server** | ❌ Required ($5/mo) | ✅ Not needed | ✅ Not needed |
| **Latency** | ~2 seconds | ~30 seconds | ~2 seconds |
| **Reliability** | Depends on VPS | ✅ Vercel SLA | ✅ Vercel SLA |
| **Cost** | $5/month | ✅ Free* | ✅ Free* |
| **Setup** | Complex | ✅ Simple | Medium |

*Free on Hobby plan, included on Pro plan

---

## Vercel Cron Limits

**Hobby Plan (Free):**
- ✅ 1 cron job
- ✅ Runs every minute
- ✅ Free forever
- **Perfect for testing!**

**Pro Plan ($20/month):**
- ✅ Multiple cron jobs
- ✅ More invocations
- ✅ Better for production

---

## Response Format

### Success (Single Request)
```json
{
  "requestId": "0xaeb1...",
  "status": "fulfilled",
  "transactionHash": "0x123...",
  "gasUsed": "285432",
  "proofGenerationTime": 1234,
  "totalTime": 2567,
  "blockNumber": 12345
}
```

### Success (Batch)
```json
{
  "checked": 5,
  "fulfilled": 2,
  "results": [
    { "requestId": "0x...", "status": "fulfilled", ... },
    { "requestId": "0x...", "status": "fulfilled", ... }
  ]
}
```

### Already Fulfilled
```json
{
  "requestId": "0x...",
  "status": "skipped",
  "reason": "Already fulfilled"
}
```

### Error
```json
{
  "requestId": "0x...",
  "status": "failed",
  "error": "Proof generation failed: Invalid signature",
  "time": 123
}
```

---

## Monitoring

### Check Cron Job Status
1. Vercel Dashboard → Your Project
2. Deployments → Select latest
3. Functions → `/api/fulfill`
4. See invocation logs

### Manual Check
```bash
# See recent fulfillments
curl https://api.ethvault.qkey.co/api/fulfill
```

### Tenderly Monitoring
1. Tenderly Dashboard
2. View ZKProofOracle transactions
3. Filter by `fulfillProof` function

---

## Advantages Over Separate Operator

✅ **No Extra Infrastructure** - Everything on Vercel
✅ **Lower Cost** - No VPS needed ($5/month saved)
✅ **Simpler Deployment** - Just `vercel deploy`
✅ **Better Monitoring** - Vercel dashboard shows everything
✅ **Automatic Scaling** - Vercel handles load
✅ **More Reliable** - Vercel SLA vs DIY VPS

---

## Disadvantages

⚠️ **Latency** - Up to 1 minute delay (cron interval)
⚠️ **Cold Starts** - First request may be slower
⚠️ **Execution Limit** - 10 seconds (Hobby) or 60 seconds (Pro)

**Solutions:**
- Use webhooks for instant fulfillment
- Upgrade to Pro for longer timeouts
- Cron runs every minute so delays are minimal

---

## Migration from Separate Operator

If you were using the separate operator service:

### Old Setup
```bash
# On VPS
cd operator
npm install
pm2 start index.js
```

### New Setup
```bash
# Just deploy to Vercel
cd api/zk-proof
vercel deploy --prod

# Add environment variables in Vercel Dashboard
# - TENDERLY_RPC_URL
# - ZK_ORACLE_ADDRESS
# - OPERATOR_PRIVATE_KEY
```

**That's it!** Stop your VPS, cancel subscription, save $5/month.

---

## Cost Comparison

### Separate Operator
- VPS: $5/month
- Total: **$5/month**

### Vercel Only
- Hobby plan: $0/month ✅
- Pro plan (if needed): $20/month
- **But you're already on Vercel for the API!**
- Extra cost: **$0/month** ✅

---

## Testing Locally

```bash
# Terminal 1: Start Vercel dev server
cd api/zk-proof
vercel dev

# Terminal 2: Trigger fulfillment
curl -X POST http://localhost:3000/api/fulfill
```

---

## Production Checklist

- [ ] Add environment variables to Vercel
- [ ] Deploy: `vercel deploy --prod`
- [ ] Verify cron is running (check Vercel logs)
- [ ] Test with a proof request
- [ ] Monitor for 24 hours
- [ ] (Optional) Set up Tenderly webhook for instant fulfillment

---

## Troubleshooting

### Cron Not Running
**Check:** Vercel Dashboard → Deployments → Functions → Cron Jobs
**Fix:** Redeploy: `vercel deploy --prod`

### Function Timeout
**Error:** "Function execution timeout"
**Fix:**
- Upgrade to Pro (60s timeout)
- Or optimize proof generation

### Environment Variables Missing
**Error:** "Missing environment variables"
**Fix:** Add variables in Vercel Dashboard → Settings → Environment Variables

### Operator Not Authorized
**Error:** "Operator not authorized"
**Fix:** Run on oracle contract:
```bash
cast send $ZK_ORACLE_ADDRESS \
  "addOperator(address)" \
  $OPERATOR_ADDRESS \
  --private-key $OWNER_KEY
```

---

## Future Enhancements

### Instant Fulfillment (Webhook)
Set up Tenderly webhook:
1. Tenderly → Alerts → New Alert
2. Trigger: ProofRequested event
3. Webhook: https://api.ethvault.qkey.co/api/fulfill
4. Latency: < 2 seconds!

### Multiple Operators
Deploy to multiple Vercel accounts for redundancy

### Dashboard Integration
Add fulfillment status to your dashboard UI

---

## Conclusion

**Simpler is Better!**

The Vercel-only approach eliminates unnecessary complexity:
- ❌ No VPS to manage
- ❌ No PM2/systemd/Docker
- ❌ No SSH access needed
- ❌ No server monitoring
- ✅ Just deploy and forget!

**Everything in one place:** Proof generation + Fulfillment = Vercel

---

**Status:** ✅ Production-ready
**Cost:** $0/month (Hobby) or included in Pro
**Setup Time:** 5 minutes
**Maintenance:** Zero

Perfect for EthVaultPQ! 🎉
