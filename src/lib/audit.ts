import { AuditLog } from '@/types';
import { db } from './db';

export async function logAuditEvent(params: {
  action: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details: string;
}): Promise<AuditLog> {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    action: params.action,
    userId: params.userId,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress || '127.0.0.1',
    resource: params.resource,
    status: params.status,
    details: params.details,
    timestamp: new Date().toISOString(),
  };

  await db.auditLogs.create(log);
  return log;
}
