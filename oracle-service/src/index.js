/**
 * Oracle Service for EthVaultPQ
 *
 * Monitors blockchain for:
 * 1. ZK Proof requests -> Generates proofs via Vercel API
 * 2. QRNG requests -> Fetches quantum random from ANU API
 *
 * Submits fulfilled results back on-chain
 */

import { ethers } from 'ethers';
import axios from 'axios';
import pino from 'pino';
import dotenv from 'dotenv';
import { ZKProofListener } from './listeners/zkProofListener.js';
import { QRNGListener } from './listeners/qrngListener.js';

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

// Configuration
const config = {
  rpcUrl: process.env.TENDERLY_RPC_URL || process.env.RPC_URL,
  privateKey: process.env.ORACLE_PRIVATE_KEY,
  zkOracleAddress: process.env.ZK_ORACLE_ADDRESS,
  qrngOracleAddress: process.env.QRNG_ORACLE_ADDRESS,
  vercelApiUrl: process.env.VERCEL_API_URL || 'https://ethvaultpq-zk-prover-70d98cmob-valis-quantum.vercel.app',
  vercelApiKey: process.env.VERCEL_API_KEY || 'test-key-12345',
  anuQrngUrl: 'https://qrng.anu.edu.au/API/jsonI.php',
  pollingInterval: process.env.POLLING_INTERVAL || 12000, // 12 seconds (Ethereum block time)
};

// Validate configuration
function validateConfig() {
  const required = ['privateKey', 'zkOracleAddress', 'qrngOracleAddress'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    logger.error({ missing }, 'Missing required configuration');
    process.exit(1);
  }

  logger.info('Configuration validated');
}

// Initialize provider and wallet
function initializeEthers() {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  logger.info({
    address: wallet.address,
    network: config.rpcUrl
  }, 'Wallet initialized');

  return { provider, wallet };
}

// Main application
async function main() {
  logger.info('🚀 Starting EthVaultPQ Oracle Service...');

  validateConfig();
  const { provider, wallet } = initializeEthers();

  // Initialize listeners
  const zkListener = new ZKProofListener(
    wallet,
    config.zkOracleAddress,
    config.vercelApiUrl,
    config.vercelApiKey,
    logger
  );

  const qrngListener = new QRNGListener(
    wallet,
    config.qrngOracleAddress,
    config.anuQrngUrl,
    logger
  );

  // Start listening
  logger.info('📡 Starting event listeners...');

  await zkListener.start();
  await qrngListener.start();

  logger.info('✅ Oracle service running');

  // Health check endpoint (if running in Express later)
  const stats = {
    zkProofsProcessed: 0,
    qrngRequests: 0,
    startTime: new Date().toISOString()
  };

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('🛑 Shutting down gracefully...');
    zkListener.stop();
    qrngListener.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 Shutting down gracefully...');
    zkListener.stop();
    qrngListener.stop();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error in main process');
  process.exit(1);
});
