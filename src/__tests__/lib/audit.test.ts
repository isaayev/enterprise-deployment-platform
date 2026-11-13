import { describe, it, expect } from 'vitest';
import { logAuditEvent } from '@/lib/audit';
import { db } from '@/lib/db';

describe('Audit Logging System', () => {
  it('creates and persists security audit log entry', async () => {
    const action = 'TEST_SECURITY_EVENT';
    const log = await logAuditEvent({
      action,
      userId: 'test-user-id',
      userEmail: 'security@enterprise.gg',
      ipAddress: '192.168.1.1',
      resource: '/test-resource',
      status: 'SUCCESS',
      details: 'Audit logging unit test verification',
    });

    expect(log).toHaveProperty('id');
    expect(log.action).toBe(action);
    expect(log.status).toBe('SUCCESS');
    expect(log.timestamp).toBeDefined();

    const allLogs = await db.auditLogs.getAll(50);
    const found = allLogs.find((l) => l.id === log.id);
    expect(found).toBeDefined();
    expect(found?.details).toContain('Audit logging unit test verification');
  });
});

