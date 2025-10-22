import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Unit tests for ML-DSA-65 (Dilithium3) signature verification
 * using @noble/post-quantum library
 *
 * These tests verify:
 * 1. Valid signatures are accepted
 * 2. Invalid signatures are rejected
 * 3. Modified messages are detected
 * 4. Wrong public keys are detected
 */

describe('ML-DSA-65 (Dilithium3) Verification', () => {
  // Generate a test keypair and signature
  const message = new Uint8Array([1, 2, 3, 4, 5]);

  // Use deterministic keygen for reproducible tests
  const seed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) seed[i] = i;

  const { publicKey, secretKey } = ml_dsa65.keygen(seed);

  it('should verify valid signature', () => {
    const signature = ml_dsa65.sign(secretKey, message);
    const isValid = ml_dsa65.verify(publicKey, message, signature);

    assert.strictEqual(isValid, true, 'Valid signature should verify');
  });

  it('should reject invalid signature (all zeros)', () => {
    const invalidSignature = new Uint8Array(3309); // All zeros
    const isValid = ml_dsa65.verify(publicKey, message, invalidSignature);

    assert.strictEqual(isValid, false, 'Invalid signature should not verify');
  });

  it('should reject signature with modified message', () => {
    const signature = ml_dsa65.sign(secretKey, message);
    const modifiedMessage = new Uint8Array([9, 9, 9, 9, 9]);
    const isValid = ml_dsa65.verify(publicKey, modifiedMessage, signature);

    assert.strictEqual(isValid, false, 'Signature with modified message should not verify');
  });

  it('should reject signature with wrong public key', () => {
    const signature = ml_dsa65.sign(secretKey, message);

    // Generate a different keypair
    const seed2 = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed2[i] = i + 100;
    const { publicKey: wrongPublicKey } = ml_dsa65.keygen(seed2);

    const isValid = ml_dsa65.verify(wrongPublicKey, message, signature);

    assert.strictEqual(isValid, false, 'Signature with wrong public key should not verify');
  });

  it('should have correct signature length', () => {
    const signature = ml_dsa65.sign(secretKey, message);

    assert.strictEqual(signature.length, 3309, 'ML-DSA-65 signature should be 3309 bytes');
  });

  it('should have correct public key length', () => {
    assert.strictEqual(publicKey.length, 1952, 'ML-DSA-65 public key should be 1952 bytes');
  });

  it('should have correct secret key length', () => {
    assert.strictEqual(secretKey.length, 4032, 'ML-DSA-65 secret key should be 4032 bytes');
  });
});

/**
 * Integration tests for the prove.ts API
 */
describe('Dilithium Proof API Integration', () => {
  it('should convert hex strings to Uint8Array correctly', () => {
    const hex = '0x0102030405';
    const expected = new Uint8Array([1, 2, 3, 4, 5]);

    // Helper function from prove.ts
    function hexToBytes(hex: string): Uint8Array {
      const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
      const bytes = new Uint8Array(cleaned.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
      }
      return bytes;
    }

    const result = hexToBytes(hex);

    assert.deepStrictEqual(result, expected);
  });

  it('should generate valid signature that verifies', () => {
    // Generate a keypair
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed[i] = i + 50;

    const { publicKey, secretKey } = ml_dsa65.keygen(seed);
    const message = new Uint8Array(Buffer.from('Hello, PQ World!'));

    // Sign
    const signature = ml_dsa65.sign(secretKey, message);

    // Verify
    const isValid = ml_dsa65.verify(publicKey, message, signature);

    assert.strictEqual(isValid, true, 'Generated signature should verify');
    assert.strictEqual(signature.length, 3309, 'Signature should be 3309 bytes');
    assert.strictEqual(publicKey.length, 1952, 'Public key should be 1952 bytes');
  });

  it('should reject tampered signature', () => {
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed[i] = i + 75;

    const { publicKey, secretKey } = ml_dsa65.keygen(seed);
    const message = new Uint8Array(Buffer.from('Test message'));

    const signature = ml_dsa65.sign(secretKey, message);

    // Tamper with signature
    const tamperedSignature = new Uint8Array(signature);
    tamperedSignature[100] ^= 0xFF; // Flip bits

    const isValid = ml_dsa65.verify(publicKey, message, tamperedSignature);

    assert.strictEqual(isValid, false, 'Tampered signature should not verify');
  });
});

/**
 * Performance benchmark (optional, for monitoring)
 */
describe('ML-DSA-65 Performance', () => {
  it('should verify signature in reasonable time', () => {
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed[i] = i + 200;

    const { publicKey, secretKey } = ml_dsa65.keygen(seed);
    const message = new Uint8Array(Buffer.from('Performance test message'));
    const signature = ml_dsa65.sign(secretKey, message);

    const startTime = Date.now();
    const isValid = ml_dsa65.verify(publicKey, message, signature);
    const duration = Date.now() - startTime;

    assert.strictEqual(isValid, true);

    // Verification should be very fast (< 50ms)
    console.log(`      Verification time: ${duration}ms`);
    assert.ok(duration < 50, `Verification should be fast (took ${duration}ms)`);
  });

  it('should sign in reasonable time', () => {
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) seed[i] = i + 220;

    const { secretKey } = ml_dsa65.keygen(seed);
    const message = new Uint8Array(Buffer.from('Signing performance test'));

    const startTime = Date.now();
    const signature = ml_dsa65.sign(secretKey, message);
    const duration = Date.now() - startTime;

    assert.strictEqual(signature.length, 3309);

    console.log(`      Signing time: ${duration}ms`);
    assert.ok(duration < 100, `Signing should be fast (took ${duration}ms)`);
  });
});
