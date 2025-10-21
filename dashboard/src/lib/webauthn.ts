import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
// import { db } from '@/lib/db';

const rpName = process.env.WEBAUTHN_RP_NAME || 'EthVaultPQ';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:5175';

/**
 * Generate registration options for WebAuthn
 */
export async function generateWebAuthnRegistrationOptions(userId: string, userEmail: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { webauthnKeys: true },
  });

  if (!user) throw new Error('User not found');

  const opts: GenerateRegistrationOptionsOpts = {
    rpName,
    rpID,
    userName: userEmail,
    userDisplayName: user.name || userEmail,
    attestationType: 'none',
    excludeCredentials: user.webauthnKeys.map((key) => ({
      id: Buffer.from(key.credentialId, 'base64'),
      type: 'public-key',
      transports: key.transports?.split(',') as any,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  };

  return generateRegistrationOptions(opts);
}

/**
 * Verify WebAuthn registration response
 */
export async function verifyWebAuthnRegistration(
  userId: string,
  response: any,
  expectedChallenge: string
) {
  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  };

  const verification = await verifyRegistrationResponse(opts);

  if (verification.verified && verification.registrationInfo) {
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

    // Store credential
    await db.webAuthnCredential.create({
      data: {
        userId,
        credentialId: Buffer.from(credentialID).toString('base64'),
        publicKey: Buffer.from(credentialPublicKey),
        counter,
        transports: response.response.transports?.join(','),
      },
    });
  }

  return verification;
}

/**
 * Generate authentication options
 */
export async function generateWebAuthnAuthenticationOptions(userEmail: string) {
  const user = await db.user.findUnique({
    where: { email: userEmail },
    include: { webauthnKeys: true },
  });

  if (!user) throw new Error('User not found');

  const opts: GenerateAuthenticationOptionsOpts = {
    rpID,
    allowCredentials: user.webauthnKeys.map((key) => ({
      id: Buffer.from(key.credentialId, 'base64'),
      type: 'public-key',
      transports: key.transports?.split(',') as any,
    })),
    userVerification: 'preferred',
  };

  return generateAuthenticationOptions(opts);
}

/**
 * Verify WebAuthn authentication response
 */
export async function verifyWebAuthnAuthentication(
  userEmail: string,
  response: any,
  expectedChallenge: string
) {
  const user = await db.user.findUnique({
    where: { email: userEmail },
    include: { webauthnKeys: true },
  });

  if (!user) throw new Error('User not found');

  const credentialId = Buffer.from(response.id, 'base64url').toString('base64');
  const credential = user.webauthnKeys.find((key) => key.credentialId === credentialId);

  if (!credential) throw new Error('Credential not found');

  const opts: VerifyAuthenticationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(credential.credentialId, 'base64'),
      credentialPublicKey: credential.publicKey,
      counter: credential.counter,
    },
  };

  const verification = await verifyAuthenticationResponse(opts);

  if (verification.verified) {
    // Update counter
    await db.webAuthnCredential.update({
      where: { id: credential.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });
  }

  return { verification, userId: user.id };
}
