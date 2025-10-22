#!/usr/bin/env node

/**
 * ZK Proof Oracle Operator Service
 *
 * Listens for ProofRequested events from ZKProofOracle and automatically
 * fulfills them by:
 * 1. Calling the proof generation API
 * 2. Submitting the proof back to the oracle on-chain
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const TENDERLY_RPC_URL = process.env.TENDERLY_RPC_URL;
const ZK_ORACLE_ADDRESS = process.env.ZK_ORACLE_ADDRESS;
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY;
const PROOF_API_URL = process.env.PROOF_API_URL || 'http://localhost:3000/api/prove';

// ZKProofOracle ABI (minimal, just what we need)
const ORACLE_ABI = [
  'event ProofRequested(bytes32 indexed requestId, address indexed requester, bytes32 messageHash, bytes32 publicKeyHash)',
  'function getRequest(bytes32 requestId) view returns (tuple(address requester, bytes32 messageHash, bytes32 publicKeyHash, bytes message, bytes signature, bytes publicKey, uint256 timestamp, uint8 status, bytes proof, uint256[3] publicSignals))',
  'function fulfillProof(bytes32 requestId, uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[3] calldata _pubSignals) external',
  'function isRequestFulfilled(bytes32 requestId) view returns (bool)',
  'function operators(address) view returns (bool)'
];

class ZKOperator {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.oracle = null;
    this.isRunning = false;
  }

  async initialize() {
    console.log('🚀 Initializing ZK Proof Oracle Operator...\n');

    // Validate configuration
    if (!TENDERLY_RPC_URL) throw new Error('TENDERLY_RPC_URL not set');
    if (!ZK_ORACLE_ADDRESS) throw new Error('ZK_ORACLE_ADDRESS not set');
    if (!OPERATOR_PRIVATE_KEY) throw new Error('OPERATOR_PRIVATE_KEY not set');

    // Connect to Tenderly
    this.provider = new ethers.JsonRpcProvider(TENDERLY_RPC_URL);
    this.wallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, this.provider);
    this.oracle = new ethers.Contract(ZK_ORACLE_ADDRESS, ORACLE_ABI, this.wallet);

    // Verify connection
    const network = await this.provider.getNetwork();
    const balance = await this.provider.getBalance(this.wallet.address);
    const isOperator = await this.oracle.operators(this.wallet.address);

    console.log('📋 Configuration:');
    console.log(`   Network: Chain ID ${network.chainId}`);
    console.log(`   Oracle: ${ZK_ORACLE_ADDRESS}`);
    console.log(`   Operator: ${this.wallet.address}`);
    console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`   Is Authorized: ${isOperator}`);
    console.log(`   Proof API: ${PROOF_API_URL}\n`);

    if (!isOperator) {
      throw new Error(`Operator ${this.wallet.address} is not authorized in oracle`);
    }

    if (balance === 0n) {
      console.warn('⚠️  Warning: Operator has zero balance, cannot submit transactions\n');
    }
  }

  async handleProofRequest(requestId, requester, messageHash, publicKeyHash) {
    console.log(`\n📨 New Proof Request`);
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Requester: ${requester}`);
    console.log(`   Message Hash: ${messageHash}`);
    console.log(`   Public Key Hash: ${publicKeyHash}`);

    try {
      // Check if already fulfilled
      const isFulfilled = await this.oracle.isRequestFulfilled(requestId);
      if (isFulfilled) {
        console.log('   ⏭️  Already fulfilled, skipping');
        return;
      }

      // Get full request details
      console.log('   📥 Fetching request details...');
      const request = await this.oracle.getRequest(requestId);

      // Convert bytes to hex strings for API
      const messageHex = ethers.hexlify(request.message);
      const signatureHex = ethers.hexlify(request.signature);
      const publicKeyHex = ethers.hexlify(request.publicKey);

      console.log(`   Message: ${messageHex.substring(0, 66)}... (${request.message.length} bytes)`);
      console.log(`   Signature: ${signatureHex.substring(0, 66)}... (${request.signature.length} bytes)`);
      console.log(`   Public Key: ${publicKeyHex.substring(0, 66)}... (${request.publicKey.length} bytes)`);

      // Call proof generation API
      console.log(`   🔐 Generating ZK proof...`);
      const apiStartTime = Date.now();

      const response = await fetch(PROOF_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageHex,
          signature: signatureHex,
          publicKey: publicKeyHex
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} ${error}`);
      }

      const { proof, publicSignals } = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      console.log(`   ✅ Proof generated in ${apiDuration}ms`);

      // Submit proof to oracle
      console.log('   📤 Submitting proof to oracle...');
      const tx = await this.oracle.fulfillProof(
        requestId,
        proof.a,
        proof.b,
        proof.c,
        publicSignals,
        { gasLimit: 500000 }
      );

      console.log(`   ⏳ Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`   ✅ Proof fulfilled! Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   🎉 Request ${requestId} completed successfully!\n`);

    } catch (error) {
      console.error(`   ❌ Error handling request ${requestId}:`);
      console.error(`      ${error.message}\n`);
    }
  }

  async start() {
    await this.initialize();

    console.log('👂 Listening for ProofRequested events...\n');
    console.log('Press Ctrl+C to stop\n');
    console.log('─'.repeat(80) + '\n');

    // Listen for ProofRequested events
    this.oracle.on('ProofRequested', async (requestId, requester, messageHash, publicKeyHash, event) => {
      await this.handleProofRequest(requestId, requester, messageHash, publicKeyHash);
    });

    // Handle past events (from last 100 blocks)
    const currentBlock = await this.provider.getBlockNumber();
    const filter = this.oracle.filters.ProofRequested();
    const pastEvents = await this.oracle.queryFilter(filter, currentBlock - 100, currentBlock);

    if (pastEvents.length > 0) {
      console.log(`📚 Found ${pastEvents.length} recent unfulfilled request(s)\n`);
      for (const event of pastEvents) {
        const isFulfilled = await this.oracle.isRequestFulfilled(event.args.requestId);
        if (!isFulfilled) {
          await this.handleProofRequest(
            event.args.requestId,
            event.args.requester,
            event.args.messageHash,
            event.args.publicKeyHash
          );
        }
      }
    }

    this.isRunning = true;

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log('\n\n👋 Shutting down operator...');
      this.oracle.removeAllListeners();
      process.exit(0);
    });
  }
}

// Main
const operator = new ZKOperator();

operator.start().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
