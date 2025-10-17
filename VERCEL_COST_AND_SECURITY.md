# Vercel Cost & Security - Will You Get a Huge Bill?

## TL;DR

**Short answer:** Very unlikely to get a huge bill, but let's add protection to be safe.

**Why it's unlikely:**
1. Vercel **Hobby plan is FREE** with generous limits
2. You'll get warnings before hitting limits
3. We can add rate limiting easily
4. The API returns mock data (very fast, no expensive computation yet)

## Vercel Hobby Plan (FREE) Limits

| Resource | Hobby Limit | What This Means |
|----------|-------------|-----------------|
| **Bandwidth** | 100 GB/month | ~25 million API calls (4KB response each) |
| **Function Executions** | 100 hours/month | ~720,000 calls (0.5s each) |
| **Invocations** | Unlimited | No limit on number of calls |
| **Cost** | $0 | Completely free |

**Reality check:**
- Your mock API responds in ~50ms
- 100 hours = 7,200,000 calls per month
- **You'd need ~250 calls PER SECOND for a full month to hit limits**

## What Happens If You Hit Limits?

### Hobby Plan Behavior

1. **Warning emails** - Vercel warns you at 80% usage
2. **Function paused** - API stops working (returns 429 error)
3. **No surprise charges** - Hobby plan CANNOT charge you
4. **Notification** - Dashboard shows usage warnings

**Important:** Vercel Hobby plan **does not auto-upgrade** or charge you. It just stops working.

## Real Cost Calculation

### Current Setup (Mock Proofs)

**Per API call:**
- Response time: ~50ms
- Response size: ~1KB
- Memory: 1024MB (for /api/health) or 3008MB (for /api/prove)

**If you get 1000 spam calls:**
- Bandwidth: 1000 × 1KB = 1MB (0.001% of limit)
- Execution time: 1000 × 50ms = 50 seconds (0.01% of limit)
- Cost: **$0**

**If you get 100,000 spam calls:**
- Bandwidth: 100MB (0.1% of limit)
- Execution time: 5000 seconds = 1.4 hours (1.4% of limit)
- Cost: **$0**

**To actually hit limits, you'd need:**
- 25 million calls/month
- Or sustained 10 requests/second for a month

### Future (Real ZK Proofs)

**Per API call:**
- Response time: ~500ms (10x slower)
- Response size: ~2KB
- Memory: 3008MB

**If you get 100,000 spam calls:**
- Execution time: 50,000 seconds = 14 hours (14% of limit)
- Still free, but starting to matter

## Protection Strategies

### Strategy 1: Rate Limiting (Recommended - 5 minutes)

Add this to your `api/prove.js` and `api/health.js`:

```javascript
// Simple in-memory rate limiter
const rateLimitMap = new Map();

function rateLimit(req, maxRequests = 10, windowMs = 60000) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create request log for this IP
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);

  // Remove old requests outside the window
  const recentRequests = requests.filter(time => time > windowStart);

  // Check if over limit
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limited
  }

  // Add this request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return true; // Allow
}

// In your handler:
module.exports = async (req, res) => {
  // Rate limit: 10 requests per minute per IP
  if (!rateLimit(req, 10, 60000)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Try again in 60 seconds.',
      retryAfter: 60
    });
  }

  // ... rest of your code
};
```

**Protection:**
- Limits each IP to 10 calls/minute
- Prevents single attacker from spamming
- Legitimate users unaffected

### Strategy 2: API Key Authentication (More Secure)

Add environment variable in Vercel dashboard:

```bash
# In Vercel dashboard: Settings → Environment Variables
ZK_API_KEY=your-secret-key-here
```

Then in `api/prove.js`:

```javascript
module.exports = async (req, res) => {
  // Check API key
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.ZK_API_KEY;

  if (apiKey !== validKey) {
    return res.status(401).json({
      error: 'Invalid API key'
    });
  }

  // ... rest of your code
};
```

**Protection:**
- Only requests with valid API key work
- Share key only with your dashboard
- Zero spam possible

**Downside:**
- Need to manage keys
- Key could leak if committed to GitHub

### Strategy 3: CORS Restrictions (Easiest)

Already in `vercel.json` - restrict which domains can call the API:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "http://localhost:5175"  // Only allow your dashboard
        }
      ]
    }
  ]
}
```

**Protection:**
- Only your dashboard can call the API (in browser)
- Direct curl/scripts can still call it
- Good first defense

### Strategy 4: Vercel Edge Config (Advanced)

Use Vercel's built-in rate limiting:

```bash
npm install @vercel/edge-config
```

Configure in Vercel dashboard with rate limits.

**Protection:**
- Built-in, scalable rate limiting
- No code changes needed
- Requires Pro plan ($20/month)

## Recommended Setup (For Now)

### Phase 1: Development (Now)

1. **Keep API public** (no auth)
2. **Add CORS** (only localhost:5175)
3. **Monitor usage** in Vercel dashboard
4. **Relax** - you won't hit limits during testing

### Phase 2: Before Public Launch

1. **Add rate limiting** (Strategy 1)
2. **Add API key** (Strategy 2) - for production dashboard
3. **Monitor usage** - set up email alerts
4. **Budget alert** - Vercel sends warnings

### Phase 3: Production Scale

1. **Upgrade to Pro plan** ($20/month) - if needed
2. **Use Edge Config** for enterprise rate limiting
3. **CDN caching** for repeated proofs
4. **Monitoring** - Datadog, Sentry, etc.

## Vercel Pro Plan Costs

If you eventually need to upgrade:

**Pro Plan ($20/month):**
- 1 TB bandwidth (10x more)
- 1000 hours execution (10x more)
- Better performance
- Team features

**Enterprise Plan (Custom):**
- Unlimited everything
- Custom pricing
- For large-scale apps

## Monitoring Your Usage

### Check Current Usage

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project
3. Click **Analytics** tab
4. See real-time usage:
   - Function invocations
   - Bandwidth
   - Errors
   - Response times

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable:
   - Usage warnings (80% threshold)
   - Budget alerts
   - Error alerts

You'll get emails if anything unusual happens.

## Real-World Scenarios

### Scenario 1: Casual Testing (You - Now)

**Usage:**
- 100 test calls/day
- 3,000 calls/month

**Cost:** $0 (0.04% of free limits)
**Risk:** Zero

### Scenario 2: Moderate Spam Attack

**Attack:**
- Bot makes 10,000 calls in 1 hour
- Then stops

**Without protection:**
- Bandwidth: 10MB (0.01% of limit)
- Execution: 8 minutes (0.13% of limit)
- Cost: $0
- Impact: None

**With rate limiting:**
- Bot makes 10 calls, then blocked
- Impact: None

### Scenario 3: Serious DDoS Attack

**Attack:**
- Botnet makes 1 million calls in 24 hours
- Sustained 11 requests/second

**Without protection:**
- You'd hit limits and API would stop
- Cost: Still $0 (Hobby plan can't charge)
- Impact: API down until next billing cycle

**With rate limiting:**
- Botnet makes ~1,000 calls (10/min limit)
- Rest blocked
- Impact: Minimal

### Scenario 4: Production App (1000 users)

**Usage:**
- 1000 users × 10 transactions/day
- 300,000 calls/month

**Cost:**
- Still free on Hobby plan!
- 4% of execution limit
- 12% of bandwidth limit

**When to upgrade to Pro:**
- >50,000 calls/month (to be safe)
- When you need >100 hours execution
- When you want better performance

## The Bottom Line

### Can You Get a Huge Bill?

**No, because:**

1. **Hobby plan is FREE** - Can't charge you
2. **Generous limits** - 100GB bandwidth, 100 hours execution
3. **Warnings before limits** - Email alerts at 80%
4. **Worst case** - API stops working, no charges

### Should You Add Protection?

**Yes, but not for cost reasons:**

1. **Add CORS** (2 min) - Prevent browser abuse
2. **Add rate limiting** (5 min) - Prevent spam
3. **Monitor usage** (1 min) - Set up alerts

**This is good practice, not urgent.**

### When to Worry About Costs

**Only when:**
- You're on Pro plan ($20/month)
- You have >1M requests/month
- You're compiling real ZK proofs (5-10s each)

**For now:** Don't worry. Test freely. Monitor usage.

## Quick Implementation

Want to add rate limiting right now? I can update your API files in 2 minutes.

Or just monitor and add it later when you see actual usage patterns.

**Your choice - both are fine for development!**
