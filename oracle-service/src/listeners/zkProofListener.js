/**
 * ZK Proof Request Listener
 *
 * Listens for ProofRequested events from ZKProofOracle
 * Generates proofs off-chain via Vercel API
 * Submits proofs back on-chain via fulfillProof()
 */

import { ethers } from 'ethers';
import axios from 'axios';

const ZK_ORACLE_ABI = [
  'event ProofRequested(bytes32 indexed requestId, address indexed requester, bytes32 messageHash, bytes32 publicKeyHash)',
  'function fulfillProof(bytes32 requestId, uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[3] calldata _pubSignals) external',
  'function markProofFailed(bytes32 requestId, string calldata reason) external',
  'function getRequest(bytes32 requestId) external view returns (tuple(address requester, bytes32 messageHash, bytes32 publicKeyHash, bytes message, bytes signature, bytes publicKey, uint256 timestamp, uint8 status, bytes proof, uint256[3] publicSignals))'
];

export class ZKProofListener {
  constructor(wallet, oracleAddress, vercelApiUrl, vercelApiKey, logger) {
    this.wallet = wallet;
    this.oracle = new ethers.Contract(oracleAddress, ZK_ORACLE_ABI, wallet);
    this.vercelApiUrl = vercelApiUrl;
    this.vercelApiKey = vercelApiKey;
    this.logger = logger.child({ service: 'ZKProofListener' });
    this.isRunning = false;
  }

  async start() {
    this.logger.info({ address: await this.oracle.getAddress() }, 'Starting ZK Proof listener');

    this.isRunning = true;

    // Listen for ProofRequested events
    this.oracle.on('ProofRequested', async (requestId, requester, messageHash, publicKeyHash, event) => {
      if (!this.isRunning) return;

      this.logger.info({
        requestId,
        requester,
        blockNumber: event.log.blockNumber
      }, 'New proof request received');

      try {
        await this.processProofRequest(requestId);
      } catch (error) {
        this.logger.error({ error, requestId }, 'Failed to process proof request');
        await this.markFailed(requestId, error.message);
      }
    });

    this.logger.info('ZK Proof listener started successfully');
  }

  async processProofRequest(requestId) {
    // Fetch request details from contract
    const request = await this.oracle.getRequest(requestId);

    this.logger.info({
      requestId,
      messageLength: request.message.length,
      signatureLength: request.signature.length,
      publicKeyLength: request.publicKey.length
    }, 'Processing proof request');

    // Call Vercel API to generate proof
    const startTime = Date.now();

    const response = await axios.post(
      `${this.vercelApiUrl}/api/prove`,
      {
        message: ethers.hexlify(request.message),
        signature: ethers.hexlify(request.signature),
        publicKey: ethers.hexlify(request.publicKey)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.vercelApiKey
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const proofTime = Date.now() - startTime;

    if (!response.data.success) {
      throw new Error(`Proof generation failed: ${response.data.error}`);
    }

    const { proof, publicSignals } = response.data;

    this.logger.info({
      requestId,
      proofTime: `${proofTime}ms`,
      publicSignals
    }, 'Proof generated successfully');

    // Parse proof format for Solidity
    const pA = [proof.pi_a[0], proof.pi_a[1]];
    const pB = [
      [proof.pi_b[0][0], proof.pi_b[0][1]],
      [proof.pi_b[1][0], proof.pi_b[1][1]]
    ];
    const pC = [proof.pi_c[0], proof.pi_c[1]];

    // Submit proof to contract
    this.logger.info({ requestId }, 'Submitting proof to contract...');

    const tx = await this.oracle.fulfillProof(
      requestId,
      pA,
      pB,
      pC,
      publicSignals,
      {
        gasLimit: 500000 // Proof verification is expensive
      }
    );

    this.logger.info({
      requestId,
      txHash: tx.hash
    }, 'Proof submission transaction sent');

    const receipt = await tx.wait();

    this.logger.info({
      requestId,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber
    }, 'Proof fulfilled successfully');
  }

  async markFailed(requestId, reason) {
    try {
      this.logger.warn({ requestId, reason }, 'Marking proof request as failed');

      const tx = await this.oracle.markProofFailed(requestId, reason, {
        gasLimit: 100000
      });

      await tx.wait();

      this.logger.info({ requestId }, 'Proof request marked as failed');
    } catch (error) {
      this.logger.error({ error, requestId }, 'Failed to mark proof as failed');
    }
  }

  stop() {
    this.logger.info('Stopping ZK Proof listener');
    this.isRunning = false;
    this.oracle.removeAllListeners('ProofRequested');
  }
}
