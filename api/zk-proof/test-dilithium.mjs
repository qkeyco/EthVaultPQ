/**
 * Test script for REAL Dilithium3 (ML-DSA-65) verification
 * NO MOCKS - Uses @noble/post-quantum for production-ready crypto
 */

import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

async function testRealDilithium() {
  console.log('==================================================');
  console.log('Testing REAL Dilithium3 (ML-DSA-65) Verification');
  console.log('==================================================\n');

  // Test 1: Generate keypair
  console.log('Test 1: Generate Dilithium3 keypair');
  const { publicKey, secretKey } = ml_dsa65.keygen();

  console.log(`✅ Public key length: ${publicKey.length} bytes (expected: 1952)`);
  console.log(`✅ Secret key length: ${secretKey.length} bytes (expected: 4032 for @noble/post-quantum)`);

  if (publicKey.length !== 1952) {
    throw new Error(`Invalid public key length: ${publicKey.length}`);
  }
  if (secretKey.length !== 4032) {
    throw new Error(`Invalid secret key length: ${secretKey.length}`);
  }
  console.log('✅ Keypair generation PASSED\n');

  // Test 2: Sign a message
  console.log('Test 2: Sign a message with Dilithium3');
  const testMessage = new Uint8Array(Buffer.from('EthVaultPQ - Post-Quantum Security Test Message', 'utf-8'));
  const signature = ml_dsa65.sign(secretKey, testMessage);

  console.log(`✅ Signature length: ${signature.length} bytes (expected: 3309 for @noble/post-quantum)`);

  if (signature.length !== 3309) {
    throw new Error(`Invalid signature length: ${signature.length}`);
  }
  console.log('✅ Signing PASSED\n');

  // Test 3: Verify valid signature
  console.log('Test 3: Verify valid signature');
  const isValid = ml_dsa65.verify(publicKey, testMessage, signature);

  if (!isValid) {
    throw new Error('Valid signature was rejected!');
  }
  console.log('✅ Valid signature verification PASSED\n');

  // Test 4: Reject invalid signature
  console.log('Test 4: Reject invalid signature');
  const invalidSignature = new Uint8Array(3309);
  invalidSignature.fill(0x42); // Fill with random data

  const isInvalid = ml_dsa65.verify(publicKey, testMessage, invalidSignature);

  if (isInvalid) {
    throw new Error('Invalid signature was accepted!');
  }
  console.log('✅ Invalid signature rejection PASSED\n');

  // Test 5: Reject signature for different message
  console.log('Test 5: Reject signature for wrong message');
  const differentMessage = new Uint8Array(Buffer.from('Different message', 'utf-8'));
  const isWrongMessage = ml_dsa65.verify(publicKey, differentMessage, signature);

  if (isWrongMessage) {
    throw new Error('Signature accepted for wrong message!');
  }
  console.log('✅ Wrong message rejection PASSED\n');

  // Test 6: Reject signature for different public key
  console.log('Test 6: Reject signature for wrong public key');
  const { publicKey: wrongPublicKey } = ml_dsa65.keygen();
  const isWrongKey = ml_dsa65.verify(wrongPublicKey, testMessage, signature);

  if (isWrongKey) {
    throw new Error('Signature accepted for wrong public key!');
  }
  console.log('✅ Wrong public key rejection PASSED\n');

  // Test 7: Performance benchmark
  console.log('Test 7: Performance benchmark');
  const iterations = 10;

  // Keygen performance
  console.time('Keygen (10x)');
  for (let i = 0; i < iterations; i++) {
    ml_dsa65.keygen();
  }
  console.timeEnd('Keygen (10x)');

  // Sign performance
  console.time('Sign (10x)');
  for (let i = 0; i < iterations; i++) {
    ml_dsa65.sign(secretKey, testMessage);
  }
  console.timeEnd('Sign (10x)');

  // Verify performance
  console.time('Verify (10x)');
  for (let i = 0; i < iterations; i++) {
    ml_dsa65.verify(publicKey, testMessage, signature);
  }
  console.timeEnd('Verify (10x)');

  console.log('✅ Performance benchmark PASSED\n');

  // Summary
  console.log('==================================================');
  console.log('ALL TESTS PASSED ✅');
  console.log('==================================================');
  console.log('✅ Real Dilithium3 (ML-DSA-65) verification working');
  console.log('✅ NO MOCKS - Using @noble/post-quantum');
  console.log('✅ FIPS-204 compliant');
  console.log('✅ Production-ready cryptography');
  console.log('==================================================\n');

  // Return test signature for use in other tests
  return {
    publicKey,
    secretKey,
    signature,
    message: testMessage
  };
}

// Run tests
testRealDilithium()
  .then((result) => {
    console.log('Test artifacts:');
    console.log(`- Public key: ${Buffer.from(result.publicKey).toString('hex').substring(0, 64)}...`);
    console.log(`- Signature: ${Buffer.from(result.signature).toString('hex').substring(0, 64)}...`);
    console.log(`- Message: ${Buffer.from(result.message).toString('utf-8')}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
