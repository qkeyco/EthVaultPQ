import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  res.status(200).json({
    ok: true,
    service: 'ethvaultpq-zk-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'ZK-SNARK proof generation API is healthy'
  });
}
