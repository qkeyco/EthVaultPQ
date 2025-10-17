/**
 * API Key Authentication for Vercel serverless functions
 *
 * Validates API key from request headers
 */

/**
 * Check if request has valid API key
 *
 * @param {Object} req - Vercel request object
 * @returns {boolean} - true if valid, false if invalid
 */
function checkApiKey(req) {
  // Get API key from environment variable
  const validApiKey = process.env.ZK_API_KEY;

  // If no API key is configured, allow all requests (dev mode)
  if (!validApiKey) {
    console.warn('Warning: ZK_API_KEY not configured. API is publicly accessible.');
    return true;
  }

  // Get API key from request headers
  const requestApiKey = req.headers['x-api-key'] ||
                        req.headers['authorization']?.replace('Bearer ', '');

  // Validate
  if (requestApiKey === validApiKey) {
    return true;
  }

  console.log('Invalid API key attempt from IP:',
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  );

  return false;
}

/**
 * Send authentication error response
 */
function sendAuthError(res) {
  res.setHeader('WWW-Authenticate', 'API-Key');

  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please provide a valid API key in the X-API-Key header',
    example: 'curl -H "X-API-Key: your-secret-key" ...'
  });
}

module.exports = {
  checkApiKey,
  sendAuthError
};
