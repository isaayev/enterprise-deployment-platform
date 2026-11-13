import { describe, it, expect } from 'vitest';
import { rateLimiter } from '@/lib/rate-limiter';

describe('API Rate Limiter', () => {
  it('permits initial request within window', () => {
    const key = `test-ip-${Date.now()}-1`;
    const result = rateLimiter.check(key, 5, 1000);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it('permits requests up to configured limit', () => {
    const key = `test-ip-${Date.now()}-2`;
    const limit = 3;

    for (let i = 1; i <= limit; i++) {
      const result = rateLimiter.check(key, limit, 5000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - i);
    }
  });

  it('blocks requests exceeding limit within window', () => {
    const key = `test-ip-${Date.now()}-3`;
    const limit = 2;

    rateLimiter.check(key, limit, 5000);
    rateLimiter.check(key, limit, 5000);

    const blocked = rateLimiter.check(key, limit, 5000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

