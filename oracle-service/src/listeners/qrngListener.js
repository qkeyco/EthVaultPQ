/**
 * Quantum Random Number Generator Listener
 *
 * Listens for RandomnessRequested events from QRNGOracle
 * Fetches true quantum random numbers from ANU QRNG API
 * Submits random numbers back on-chain via fulfillRandomness()
 */

import { ethers } from 'ethers';
import axios from 'axios';

const QRNG_ORACLE_ABI = [
  'event RandomnessRequested(bytes32 indexed requestId, address indexed requester, bytes32 seed)',
  'function fulfillRandomness(bytes32 requestId, uint256 randomness) external',
  'function markRandomnessFailed(bytes32 requestId, string calldata reason) external',
  'function getRequest(bytes32 requestId) external view returns (tuple(address requester, uint256 timestamp, uint8 status, uint256 randomness, bytes32 seed))'
];

export class QRNGListener {
  constructor(wallet, oracleAddress, anuQrngUrl, logger) {
    this.wallet = wallet;
    this.oracle = new ethers.Contract(oracleAddress, QRNG_ORACLE_ABI, wallet);
    this.anuQrngUrl = anuQrngUrl;
    this.logger = logger.child({ service: 'QRNGListener' });
    this.isRunning = false;
  }

  async start() {
    this.logger.info({ address: await this.oracle.getAddress() }, 'Starting QRNG listener');

    this.isRunning = true;

    // Listen for RandomnessRequested events
    this.oracle.on('RandomnessRequested', async (requestId, requester, seed, event) => {
      if (!this.isRunning) return;

      this.logger.info({
        requestId,
        requester,
        hasSeed: seed !== ethers.ZeroHash,
        blockNumber: event.log.blockNumber
      }, 'New randomness request received');

      try {
        await this.processRandomnessRequest(requestId);
      } catch (error) {
        this.logger.error({ error, requestId }, 'Failed to process randomness request');
        await this.markFailed(requestId, error.message);
      }
    });

    this.logger.info('QRNG listener started successfully');
  }

  async processRandomnessRequest(requestId) {
    this.logger.info({ requestId }, 'Fetching quantum random number from ANU...');

    const startTime = Date.now();

    // Fetch quantum random from ANU QRNG API
    // API docs: https://qrng.anu.edu.au/API/api-demo.php
    const response = await axios.get(this.anuQrngUrl, {
      params: {
        length: 32, // 32 bytes = 256 bits
        type: 'hex16', // Hexadecimal format
        size: 32 // Block size
      },
      timeout: 30000 // 30 second timeout
    });

    const fetchTime = Date.now() - startTime;

    if (!response.data.success) {
      throw new Error(`ANU QRNG API failed: ${response.data.error || 'Unknown error'}`);
    }

    // Parse hex response
    const hexData = response.data.data.join(''); // Join array of hex strings
    const randomness = ethers.toBigInt('0x' + hexData);

    this.logger.info({
      requestId,
      fetchTime: `${fetchTime}ms`,
      randomness: randomness.toString().slice(0, 20) + '...',
      source: 'ANU Quantum RNG'
    }, 'Quantum random number fetched');

    // Submit randomness to contract
    this.logger.info({ requestId }, 'Submitting randomness to contract...');

    const tx = await this.oracle.fulfillRandomness(requestId, randomness, {
      gasLimit: 150000
    });

    this.logger.info({
      requestId,
      txHash: tx.hash
    }, 'Randomness submission transaction sent');

    const receipt = await tx.wait();

    this.logger.info({
      requestId,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber
    }, 'Randomness fulfilled successfully');
  }

  async markFailed(requestId, reason) {
    try {
      this.logger.warn({ requestId, reason }, 'Marking randomness request as failed');

      const tx = await this.oracle.markRandomnessFailed(requestId, reason, {
        gasLimit: 100000
      });

      await tx.wait();

      this.logger.info({ requestId }, 'Randomness request marked as failed');
    } catch (error) {
      this.logger.error({ error, requestId }, 'Failed to mark randomness as failed');
    }
  }

  stop() {
    this.logger.info('Stopping QRNG listener');
    this.isRunning = false;
    this.oracle.removeAllListeners('RandomnessRequested');
  }
}

/**
 * Alternative Quantum Random Sources:
 *
 * 1. ANU Quantum Random Numbers (Current)
 *    - Free public API
 *    - Quantum vacuum fluctuations
 *    - https://qrng.anu.edu.au/
 *
 * 2. QRNG (Commercial)
 *    - Photon-based quantum random
 *    - https://qrng.com/
 *
 * 3. ID Quantique (Enterprise)
 *    - Hardware quantum RNG devices
 *    - https://www.idquantique.com/
 *
 * 4. Cloudflare lavarand (Backup)
 *    - Not quantum, but high-quality entropy
 *    - Camera pointed at lava lamps
 *    - https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/
 */
