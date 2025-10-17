/**
 * Simple in-memory rate limiter for Vercel serverless functions
 *
 * Limits requests per IP address to prevent spam and abuse
 */

const rateLimitMap = new Map();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, requests] of rateLimitMap.entries()) {
    // Remove IPs with no recent requests
    const recentRequests = requests.filter(time => time > now - 600000); // 10 min
    if (recentRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recentRequests);
    }
  }
}, 600000); // Run every 10 minutes

/**
 * Check if request should be rate limited
 *
 * @param {Object} req - Vercel request object
 * @param {number} maxRequests - Maximum requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - true if allowed, false if rate limited
 */
function checkRateLimit(req, maxRequests = 20, windowMs = 60000) {
  // Get IP address
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.connection?.remoteAddress ||
             'unknown';

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
    console.log(`Rate limit exceeded for IP: ${ip} (${recentRequests.length} requests in last ${windowMs}ms)`);
    return false; // Rate limited
  }

  // Add this request
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);

  return true; // Allow
}

/**
 * Send rate limit error response
 */
function sendRateLimitError(res, retryAfter = 60) {
  res.setHeader('Retry-After', retryAfter);
  res.setHeader('X-RateLimit-Limit', '20');
  res.setHeader('X-RateLimit-Reset', Date.now() + (retryAfter * 1000));

  return res.status(429).json({
    success: false,
    error: 'Rate limit exceeded',
    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    retryAfter: retryAfter
  });
}

module.exports = {
  checkRateLimit,
  sendRateLimitError
};
