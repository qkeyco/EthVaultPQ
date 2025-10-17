# Using Vercel Bypass Secret

## What You Did

You set a **bypass secret** in Vercel deployment protection settings. This allows programmatic access to your protected API.

## How to Use the Bypass Secret

### Option 1: Query Parameter (Easiest for Dashboard)

Add the bypass secret to your API URL as a query parameter:

```
https://ethvaultpq-zk-prover-kq398y4jj-valis-quantum.vercel.app/api/health?x-vercel-protection-bypass=YOUR_SECRET
```

### Option 2: Set Cookie First

Make a one-time request to set a cookie, then subsequent requests work:

```
https://ethvaultpq-zk-prover-kq398y4jj-valis-quantum.vercel.app/api/health?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_SECRET
```

This sets a cookie in your browser, then you can access the API normally.

### Option 3: HTTP Header

Send the bypass secret as an HTTP header:

```bash
curl https://ethvaultpq-zk-prover-kq398y4jj-valis-quantum.vercel.app/api/health \
  -H "x-vercel-protection-bypass: YOUR_SECRET"
```

## For Your Dashboard

Update the dashboard to include the bypass secret in API calls.

### Get Your Bypass Secret

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **ethvaultpq-zk-prover**
3. **Settings** → **Deployment Protection**
4. Copy the **Bypass Secret**

### Add to Dashboard Environment

```bash
cd dashboard

# Add bypass secret to .env.local
echo 'VITE_VERCEL_BYPASS_SECRET=your_secret_here' >> .env.local
```

### Update API Client

Edit `dashboard/src/lib/zkProofApi.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_ZK_API_URL;
const BYPASS_SECRET = import.meta.env.VITE_VERCEL_BYPASS_SECRET;

export async function generateZKProof(request: ZKProofRequest): Promise<ZKProofResponse> {
  // Add bypass secret to URL
  const url = BYPASS_SECRET
    ? `${API_BASE_URL}/api/zk-proof?x-vercel-protection-bypass=${BYPASS_SECRET}`
    : `${API_BASE_URL}/api/zk-proof`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate ZK proof');
  }

  return response.json();
}
```

## Alternative: Just Disable Protection

Since your API is:
- ✅ Protected by rate limiting (20 req/min)
- ✅ Stateless (no sensitive data)
- ✅ Public by design

**You can safely disable deployment protection entirely:**

1. Go to Vercel dashboard
2. **Settings** → **Deployment Protection**
3. Change to **Disabled**
4. No bypass secret needed!

## Which Should You Choose?

### Keep Protection + Use Bypass Secret
**Pros:**
- Extra layer of security
- Only dashboard can access (has the secret)
- Can revoke/rotate secret if leaked

**Cons:**
- More complex setup
- Need to manage secrets
- Could leak if committed to GitHub

### Disable Protection + Use Rate Limiting
**Pros:**
- Simple setup
- No secrets to manage
- Still protected by rate limiting
- API is public by design anyway

**Cons:**
- Anyone can call the API (but limited to 20 req/min)

## My Recommendation

**Disable deployment protection.**

**Why:**
1. Your API is designed to be public (like a calculator)
2. Rate limiting already protects against abuse
3. Simpler development workflow
4. No secrets to leak

**The bypass secret is more useful for:**
- Private admin APIs
- Internal tools
- APIs with sensitive data

**Your ZK proof API is:**
- Public service (anyone can verify signatures)
- Stateless (no user data)
- Protected by rate limiting already

## Quick Test

Want to test if your bypass secret works?

Share it with me (or just tell me the first 4 characters to verify format) and I can test it, or you can test in your browser:

```
https://ethvaultpq-zk-prover-kq398y4jj-valis-quantum.vercel.app/api/health?x-vercel-protection-bypass=YOUR_SECRET
```

Should return JSON instead of HTML.
