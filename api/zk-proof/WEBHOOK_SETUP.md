# Simple Webhook Setup - No Watching Required!

The operator is just a **webhook endpoint**. When the oracle emits an event, the webhook is called. That's it.

## How It Actually Works

```
User → requestProof() → ProofRequested event → Webhook → /api/fulfill → Done
```

**No watching. No polling. No cron. Just webhooks.**

---

## Setup (5 minutes)

### Option 1: Tenderly Webhook (Recommended)

**1. Go to Tenderly Dashboard**
- https://dashboard.tenderly.co

**2. Create Web3 Action**
- Navigate to Web3 Actions
- Click "Add Action"

**3. Configure Trigger**
- Type: Event
- Network: Your Virtual TestNet
- Contract: `0x312D098B64e32ef04736662249bd57AEfe053750` (ZKProofOracle)
- Event: `ProofRequested`

**4. Set Webhook URL**
```
https://api.ethvault.qkey.co/api/fulfill
```

**5. Configure Payload**
```json
{
  "requestId": "{{event.args.requestId}}"
}
```

**Done!** Every time someone requests a proof, Tenderly calls your API.

---

### Option 2: Alchemy Notify

**1. Go to Alchemy Dashboard**
- https://dashboard.alchemy.com

**2. Create Webhook**
- Notify → Create Webhook
- Address Activity

**3. Configure**
- Address: `0x312D098B64e32ef04736662249bd57AEfe053750`
- Webhook URL: `https://api.ethvault.qkey.co/api/fulfill`

**Done!**

---

### Option 3: The Graph (Advanced)

If you want to index all requests:

**1. Create Subgraph**
```graphql
type ProofRequest @entity {
  id: ID!
  requestId: Bytes!
  requester: Bytes!
  fulfilled: Boolean!
}
```

**2. Add Webhook**
The Graph can trigger webhooks on new entities.

---

## Why This is Better

**Old (Wrong) Way:**
- Run a process that polls blockchain every second
- Wastes resources when nothing is happening
- Complex to deploy and maintain
- Costs money (VPS)

**New (Correct) Way:**
- Blockchain tells YOU when something happens
- Zero resources when idle
- Just an API endpoint
- Free (already on Vercel)

---

## Testing

### Manual Test
```bash
curl -X POST https://api.ethvault.qkey.co/api/fulfill \
  -H "Content-Type: application/json" \
  -d '{"requestId": "0x..."}'
```

### Automatic Test
1. Request a proof on-chain
2. Wait 2-3 seconds
3. Webhook automatically calls `/api/fulfill`
4. Proof is fulfilled!

---

## Environment Variables Needed

Just add these to Vercel:

```bash
TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_ID
ZK_ORACLE_ADDRESS=0x312D098B64e32ef04736662249bd57AEfe053750
OPERATOR_PRIVATE_KEY=0xYOUR_KEY
```

---

## Cost

**Tenderly Webhooks:** Free
**Alchemy Notify:** Free (25 webhooks)
**Vercel Function:** Free (Hobby plan)

**Total:** $0/month

---

## That's It!

No operator process. No watching. No complexity.

Just:
1. Deploy `/api/fulfill` to Vercel ✅ (already done!)
2. Set up webhook in Tenderly ✅ (5 minutes)
3. Done ✅

The "operator" is just a webhook endpoint. Simple!
