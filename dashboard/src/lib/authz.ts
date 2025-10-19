import { db } from '@/lib/db';
import type { OrgRole } from '@prisma/client';

export type Action =
  | 'vesting.plan.create'
  | 'vesting.plan.read'
  | 'vesting.plan.update'
  | 'vesting.plan.delete'
  | 'grant.assign'
  | 'grant.read'
  | 'grant.update'
  | 'grant.revoke'
  | 'payout.execute'
  | 'user.view'
  | 'user.edit'
  | 'support.impersonate'
  | 'audit.view'
  | 'org.admin';

const allowByRole: Record<Action, OrgRole[]> = {
  'vesting.plan.create': ['super_admin', 'org_admin', 'hr_manager'],
  'vesting.plan.read': ['super_admin', 'org_admin', 'hr_manager', 'finance_ops', 'auditor', 'support_agent'],
  'vesting.plan.update': ['super_admin', 'org_admin', 'hr_manager'],
  'vesting.plan.delete': ['super_admin', 'org_admin'],
  'grant.assign': ['super_admin', 'org_admin', 'hr_manager'],
  'grant.read': ['super_admin', 'org_admin', 'hr_manager', 'finance_ops', 'auditor', 'support_agent', 'end_user'],
  'grant.update': ['super_admin', 'org_admin', 'hr_manager'],
  'grant.revoke': ['super_admin', 'org_admin'],
  'payout.execute': ['super_admin', 'org_admin', 'finance_ops'],
  'user.view': ['super_admin', 'org_admin', 'hr_manager', 'support_agent', 'auditor'],
  'user.edit': ['super_admin', 'org_admin', 'hr_manager'],
  'support.impersonate': ['super_admin', 'support_agent'],
  'audit.view': ['super_admin', 'org_admin', 'auditor'],
  'org.admin': ['super_admin', 'org_admin'],
};

/**
 * Check if a user can perform an action in an organization
 */
export async function can(userId: string, orgId: string, action: Action): Promise<boolean> {
  // Check for super_admin (global access)
  const superAdmin = await db.membership.findFirst({
    where: { userId, role: 'super_admin' },
  });

  if (superAdmin) return true;

  // Check org-specific membership
  const membership = await db.membership.findFirst({
    where: { userId, orgId },
  });

  if (!membership) return false;

  const allowedRoles = allowByRole[action];
  return allowedRoles.includes(membership.role);
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(userId: string, orgId: string): Promise<OrgRole | null> {
  const membership = await db.membership.findFirst({
    where: { userId, orgId },
  });

  return membership?.role || null;
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrgs(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    include: { org: true },
  });

  return memberships.map((m) => ({
    ...m.org,
    role: m.role,
  }));
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  const membership = await db.membership.findFirst({
    where: { userId, role: 'super_admin' },
  });

  return !!membership;
}

/**
 * Require permission or throw
 */
export async function requirePermission(userId: string, orgId: string, action: Action) {
  const allowed = await can(userId, orgId, action);
  if (!allowed) {
    throw new Error(`Forbidden: User ${userId} cannot perform ${action} in org ${orgId}`);
  }
}
