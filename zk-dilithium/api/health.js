/**
 * Health check endpoint
 *
 * GET /api/health
 */

const { checkRateLimit, sendRateLimitError } = require('./rate-limit');

module.exports = async (req, res) => {
  // Rate limiting: 30 requests per minute per IP (more lenient for health checks)
  if (!checkRateLimit(req, 30, 60000)) {
    return sendRateLimitError(res, 60);
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    status: 'healthy',
    service: 'EthVaultPQ ZK Prover',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      prove: '/api/prove',
      health: '/api/health'
    }
  });
};
