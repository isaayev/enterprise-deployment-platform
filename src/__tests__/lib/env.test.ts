import { describe, it, expect } from 'vitest';
import { env } from '@/lib/env';

describe('Environment Configuration Validation', () => {
  it('provides validated environment variables', () => {
    expect(env).toBeDefined();
    expect(env.JWT_SECRET).toBeDefined();
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.ADMIN_EMAIL).toContain('@');
    expect(env.ADMIN_USERNAME.length).toBeGreaterThanOrEqual(1);
  });
});

