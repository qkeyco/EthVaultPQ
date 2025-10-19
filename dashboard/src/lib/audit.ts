import { createHash } from 'crypto';
import { db } from '@/lib/db';
import type { AuditSeverity } from '@prisma/client';

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
 */
export async function logAudit(event: AuditEvent) {
  // Get previous hash
  const prevHash =
    lastHash ||
    (
      await db.auditLog.findFirst({
        orderBy: { ts: 'desc' },
      })
    )?.selfHash ||
    null;

  // Compute canonical JSON and hash
  const canonical = JSON.stringify({ ...event, prevHash });
  const selfHash = '0x' + createHash('sha256').update(canonical).digest('hex');

  // Create audit log entry
  const log = await db.auditLog.create({
    data: {
      ...event,
      prevHash,
      selfHash,
      severity: event.severity || 'INFO',
      ts: new Date(),
    },
  });

  // Update last hash
  lastHash = selfHash;

  return log;
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
  const where: any = { orgId };

  if (options?.severity) where.severity = options.severity;
  if (options?.action) where.action = options.action;

  return db.auditLog.findMany({
    where,
    orderBy: { ts: 'desc' },
    take: options?.limit || 100,
    skip: options?.offset || 0,
    include: {
      actor: { select: { email: true, name: true } },
      targetUser: { select: { email: true, name: true } },
    },
  });
}

/**
 * Verify audit log integrity (hash chain)
 */
export async function verifyAuditIntegrity(orgId?: string): Promise<boolean> {
  const logs = await db.auditLog.findMany({
    where: orgId ? { orgId } : {},
    orderBy: { ts: 'asc' },
  });

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const expectedPrevHash = i === 0 ? null : logs[i - 1].selfHash;

    if (log.prevHash !== expectedPrevHash) {
      console.error(`Hash chain broken at log ${log.id}`);
      return false;
    }

    // Verify self hash
    const canonical = JSON.stringify({
      orgId: log.orgId,
      actorUserId: log.actorUserId,
      targetUserId: log.targetUserId,
      action: log.action,
      severity: log.severity,
      ip: log.ip,
      ua: log.ua,
      route: log.route,
      requestId: log.requestId,
      correlationId: log.correlationId,
      txHash: log.txHash,
      meta: log.meta,
      prevHash: log.prevHash,
    });
    const computedHash = '0x' + createHash('sha256').update(canonical).digest('hex');

    if (log.selfHash !== computedHash) {
      console.error(`Self hash mismatch at log ${log.id}`);
      return false;
    }
  }

  return true;
}
