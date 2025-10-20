/**
 * Test Real ZK-SNARK Proof Generation
 * NO MOCKS - Uses real Dilithium signatures and real ZK proofs
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { generateProof, verifyProof } from './lib/prover.mjs';

console.log('===============================================');
console.log('Testing REAL ZK-SNARK Proof Generation');
console.log('===============================================\n');

async function testRealProofGeneration() {
  // Step 1: Generate real Dilithium keypair
  console.log('Step 1: Generating Dilithium3 keypair...');
  const { publicKey, secretKey } = ml_dsa65.keygen();
  console.log(`✅ Public key: ${publicKey.length} bytes`);
  console.log(`✅ Secret key: ${secretKey.length} bytes\n`);

  // Step 2: Sign a message
  console.log('Step 2: Signing message with Dilithium3...');
  const message = new Uint8Array(Buffer.from('EthVaultPQ ZK-SNARK Test Message', 'utf-8'));
  const signature = ml_dsa65.sign(secretKey, message);
  console.log(`✅ Signature: ${signature.length} bytes\n`);

  // Step 3: Verify signature (off-chain)
  console.log('Step 3: Verifying Dilithium signature...');
  const isValid = ml_dsa65.verify(publicKey, message, signature);
  if (!isValid) {
    throw new Error('Signature verification failed!');
  }
  console.log(`✅ Signature is VALID\n`);

  // Step 4: Generate ZK proof
  console.log('Step 4: Generating ZK-SNARK proof...');
  console.time('Proof generation');
  const { proof, publicSignals } = await generateProof(message, signature, publicKey);
  console.timeEnd('Proof generation');

  console.log(`✅ Proof generated!`);
  console.log(`   - Public signals: ${publicSignals.length}`);
  console.log(`   - Commitment: ${publicSignals[0]}`);
  console.log(`   - Is valid: ${publicSignals[1]}\n`);

  // Step 5: Verify ZK proof locally
  console.log('Step 5: Verifying ZK proof locally...');
  console.time('Proof verification');
  const proofIsValid = await verifyProof(proof, publicSignals);
  console.timeEnd('Proof verification');

  if (!proofIsValid) {
    throw new Error('ZK proof verification failed!');
  }
  console.log(`✅ ZK proof is VALID\n`);

  // Step 6: Show proof structure
  console.log('Step 6: Proof structure:');
  console.log(`   pi_a: [${proof.pi_a[0].substring(0, 20)}..., ${proof.pi_a[1].substring(0, 20)}...]`);
  console.log(`   pi_b: [[[...]],[...]]`);
  console.log(`   pi_c: [${proof.pi_c[0].substring(0, 20)}..., ${proof.pi_c[1].substring(0, 20)}...]\n`);

  console.log('===============================================');
  console.log('✅ ALL TESTS PASSED!');
  console.log('===============================================');
  console.log('✅ Real Dilithium3 signature verification');
  console.log('✅ Real ZK-SNARK proof generation');
  console.log('✅ Real ZK-SNARK proof verification');
  console.log('✅ NO MOCKS - Production-ready cryptography');
  console.log('===============================================\n');

  return { proof, publicSignals };
}

// Run test
testRealProofGeneration()
  .then((result) => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
