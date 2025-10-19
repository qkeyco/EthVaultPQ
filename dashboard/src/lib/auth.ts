/**
 * Authentication Library for EthVaultPQ
 *
 * Features:
 * - Email/Password authentication
 * - Wallet authentication (wagmi)
 * - 2FA with Authenticator App (TOTP)
 * - Role-based access control (RBAC)
 * - Full audit logging
 * - Session management
 *
 * All open source, self-hosted
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as OTPAuth from 'otplib';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// ============================================
// PASSWORD AUTHENTICATION
// ============================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// 2FA / TOTP (Authenticator App)
// ============================================

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string): {
  secret: string;
  qrCode: string;
  uri: string;
} {
  const secret = OTPAuth.authenticator.generateSecret();

  const uri = OTPAuth.authenticator.keyuri(
    userEmail,
    'EthVaultPQ',
    secret
  );

  // QR code will be generated on frontend using qrcode library
  return {
    secret,
    uri,
    qrCode: uri, // Frontend will convert this to QR
  };
}

/**
 * Verify a TOTP code
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return OTPAuth.authenticator.verify({
      token,
      secret,
    });
  } catch (error) {
    return false;
  }
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactor(
  userId: string,
  secret: string,
  token: string
): Promise<boolean> {
  // Verify the token first
  if (!verifyTOTP(token, secret)) {
    throw new Error('Invalid TOTP code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });

  await createAuditLog({
    userId,
    action: 'auth.2fa_enabled',
    metadata: { method: 'totp' },
  });

  return true;
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactor(
  userId: string,
  token: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true },
  });

  if (!user?.twoFactorSecret) {
    throw new Error('2FA not enabled');
  }

  // Verify token before disabling
  if (!verifyTOTP(token, user.twoFactorSecret)) {
    throw new Error('Invalid TOTP code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  await createAuditLog({
    userId,
    action: 'auth.2fa_disabled',
    metadata: {},
  });

  return true;
}

// ============================================
// WALLET AUTHENTICATION
// ============================================

/**
 * Link a wallet address to a user account
 */
export async function linkWallet(
  userId: string,
  walletAddress: string,
  signature: string
): Promise<boolean> {
  // Verify signature (implement SIWE - Sign-In with Ethereum)
  // For now, we'll assume signature is verified by wagmi on frontend

  const existing = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (existing && existing.id !== userId) {
    throw new Error('Wallet already linked to another account');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { walletAddress },
  });

  await createAuditLog({
    userId,
    action: 'auth.wallet_linked',
    metadata: { walletAddress },
  });

  return true;
}

/**
 * Authenticate with wallet address
 */
export async function authenticateWithWallet(
  walletAddress: string
): Promise<{ userId: string; role: Role } | null> {
  const user = await prisma.user.findUnique({
    where: { walletAddress },
    select: {
      id: true,
      role: true,
      isActive: true,
      isSuspended: true,
      twoFactorEnabled: true,
    },
  });

  if (!user || !user.isActive || user.isSuspended) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createAuditLog({
    userId: user.id,
    action: 'auth.login_wallet',
    metadata: { walletAddress },
  });

  return {
    userId: user.id,
    role: user.role,
  };
}

// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================

/**
 * Permission matrix for roles
 */
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'], // All permissions

  ORG_ADMIN: [
    'org:*',
    'users:*',
    'grants:*',
    'treasury:*',
    'compliance:*',
    'audit:read',
  ],

  HR_MANAGER: [
    'grants:create',
    'grants:read',
    'grants:update',
    'grants:pause',
    'grants:revoke',
    'users:read',
    'audit:read',
  ],

  FINANCE_OPS: [
    'treasury:read',
    'treasury:transfer',
    'claims:approve',
    'claims:read',
    'grants:read',
    'audit:read',
  ],

  SUPPORT_AGENT: [
    'users:read',
    'users:impersonate', // With approval
    'grants:read',
    'claims:read',
    'audit:read',
  ],

  AUDITOR: [
    'audit:read',
    'grants:read',
    'claims:read',
    'compliance:read',
  ],

  END_USER: [
    'grants:read_own',
    'claims:create_own',
    'claims:read_own',
    'profile:update',
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[role];

  // Check for wildcard permission
  if (rolePerms.includes('*')) {
    return true;
  }

  // Check for exact match
  if (rolePerms.includes(permission)) {
    return true;
  }

  // Check for wildcard prefix (e.g., "org:*" matches "org:read")
  const prefix = permission.split(':')[0];
  if (rolePerms.includes(`${prefix}:*`)) {
    return true;
  }

  return false;
}

/**
 * Require a specific role or permission
 */
export async function requirePermission(
  userId: string,
  permission: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true, isSuspended: true },
  });

  if (!user || !user.isActive || user.isSuspended) {
    throw new Error('User not found or inactive');
  }

  if (!hasPermission(user.role, permission)) {
    await createAuditLog({
      userId,
      action: 'auth.permission_denied',
      metadata: { permission, role: user.role },
    });
    throw new Error(`Permission denied: ${permission}`);
  }
}

/**
 * Check if user belongs to organization
 */
export async function requireOrganization(
  userId: string,
  organizationId: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (user?.organizationId !== organizationId) {
    throw new Error('User does not belong to this organization');
  }
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Create an audit log entry with hash chain
 */
export async function createAuditLog(params: {
  userId?: string;
  action: string;
  resource?: string;
  metadata?: any;
  actorIp?: string;
}): Promise<void> {
  // Get the last audit log for hash chaining
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { eventHash: true },
  });

  // Create hash of current event
  const eventData = JSON.stringify({
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    metadata: params.metadata,
    timestamp: new Date().toISOString(),
  });

  const eventHash = createHash('sha256')
    .update((lastLog?.eventHash || '') + eventData)
    .digest('hex');

  // Get user role if userId provided
  let actorRole: Role | undefined;
  if (params.userId) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { role: true },
    });
    actorRole = user?.role;
  }

  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      actorRole,
      actorIp: params.actorIp,
      action: params.action,
      resource: params.resource,
      metadata: params.metadata || {},
      previousHash: lastLog?.eventHash,
      eventHash,
    },
  });
}

/**
 * Verify audit log integrity
 */
export async function verifyAuditLogIntegrity(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'asc' },
  });

  const errors: string[] = [];
  let previousHash: string | null = null;

  for (const log of logs) {
    // Verify hash chain
    if (log.previousHash !== previousHash) {
      errors.push(`Hash chain broken at log ${log.id}`);
    }

    // Recompute hash
    const eventData = JSON.stringify({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      metadata: log.metadata,
      timestamp: log.timestamp.toISOString(),
    });

    const expectedHash = createHash('sha256')
      .update((previousHash || '') + eventData)
      .digest('hex');

    if (log.eventHash !== expectedHash) {
      errors.push(`Hash mismatch at log ${log.id}`);
    }

    previousHash = log.eventHash;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// IMPERSONATION (FOR SUPPORT)
// ============================================

/**
 * Request impersonation (requires approval for non-read-only)
 */
export async function requestImpersonation(params: {
  actorId: string;
  targetId: string;
  reason: string;
  isReadOnly?: boolean;
  ttlMinutes?: number;
}): Promise<string> {
  // Verify actor has permission
  await requirePermission(params.actorId, 'users:impersonate');

  const impersonation = await prisma.impersonation.create({
    data: {
      actorId: params.actorId,
      targetId: params.targetId,
      reason: params.reason,
      isReadOnly: params.isReadOnly !== false, // Default true
      ttlMinutes: params.ttlMinutes || 60,
      isApproved: params.isReadOnly !== false, // Auto-approve read-only
    },
  });

  await createAuditLog({
    userId: params.actorId,
    action: 'auth.impersonation_requested',
    resource: `User:${params.targetId}`,
    metadata: {
      reason: params.reason,
      isReadOnly: params.isReadOnly,
    },
  });

  return impersonation.id;
}

/**
 * End impersonation session
 */
export async function endImpersonation(
  impersonationId: string
): Promise<void> {
  await prisma.impersonation.update({
    where: { id: impersonationId },
    data: { endedAt: new Date() },
  });

  await createAuditLog({
    action: 'auth.impersonation_ended',
    resource: `Impersonation:${impersonationId}`,
  });
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Create a user session
 */
export async function createSession(
  userId: string,
  expiresIn: number = 30 * 24 * 60 * 60 * 1000 // 30 days
): Promise<string> {
  const sessionToken = generateSecureToken();
  const expires = new Date(Date.now() + expiresIn);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return sessionToken;
}

/**
 * Validate a session
 */
export async function validateSession(
  sessionToken: string
): Promise<{ userId: string; role: Role } | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          isActive: true,
          isSuspended: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  if (!session.user.isActive || session.user.isSuspended) {
    return null;
  }

  return {
    userId: session.user.id,
    role: session.user.role,
  };
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionToken: string): Promise<void> {
  await prisma.session.delete({
    where: { sessionToken },
  });
}

// ============================================
// UTILITIES
// ============================================

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return createHash('sha256')
    .update(Math.random().toString() + Date.now().toString())
    .digest('hex');
}

/**
 * Get user with permissions
 */
export async function getUserWithPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      passkeys: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    permissions: ROLE_PERMISSIONS[user.role],
    hasPermission: (permission: string) => hasPermission(user.role, permission),
  };
}

export { Role, ROLE_PERMISSIONS };
