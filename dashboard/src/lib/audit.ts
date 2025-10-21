import { createHash } from 'crypto';
// import { db } from '@/lib/db';
// import type { AuditSeverity } from '@prisma/client';

// Temporary types for frontend (backend-only features disabled)
type AuditSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

let lastHash: string | null = null;

export interface AuditEvent {
  orgId?: string;
  actorUserId?: string;
  targetUserId?: string;
  action: string;
  severity?: AuditSeverity;
  ip?: string;
  ua?: string;
  route?: string;
  requestId?: string;
  correlationId?: string;
  txHash?: string;
  meta?: any;
}

/**
 * Log an audit event with hash-chaining for tamper evidence
 * NOTE: Disabled for frontend - backend only
 */
export async function logAudit(event: AuditEvent) {
  // Frontend stub - logs to console only
  console.log('[AUDIT]', event);

  const prevHash = lastHash || null;
  const canonical = JSON.stringify({ ...event, prevHash });
  const selfHash = '0x' + createHash('sha256').update(canonical).digest('hex');
  lastHash = selfHash;

  return {
    ...event,
    selfHash,
    prevHash,
    severity: event.severity || ('INFO' as AuditSeverity),
    ts: new Date(),
  };
}

/**
 * Redact sensitive data from metadata
 */
export function redactPII(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  const redacted = { ...data };
  const sensitiveKeys = ['password', 'secret', 'token', 'ssn', 'taxId'];

  for (const key of Object.keys(redacted)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactPII(redacted[key]);
    }
  }

  return redacted;
}

/**
 * Get audit logs for an organization
 */
export async function getOrgAuditLogs(
  orgId: string,
  options?: {
    limit?: number;
    offset?: number;
    severity?: AuditSeverity;
    action?: string;
  }
) {
  // Frontend stub
  console.log('[AUDIT] getOrgAuditLogs', { orgId, options });
  return [];
}

/**
 * Verify audit log integrity (hash chain)
 */
export async function verifyAuditIntegrity(orgId?: string): Promise<boolean> {
  // Frontend stub
  console.log('[AUDIT] verifyAuditIntegrity', { orgId });
  return true;
}
