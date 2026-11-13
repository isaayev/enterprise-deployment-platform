import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
} from '@/lib/auth';

describe('Authentication & JWT Session Security', () => {
  describe('Password Hashing (bcryptjs)', () => {
    it('produces salted bcrypt hash different from raw password', async () => {
      const plain = 'SecretGamerPassword2026!';
      const hashed = await hashPassword(plain);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(plain);
      expect(hashed.startsWith('$2')).toBe(true);
    });

    it('successfully verifies correct password against hash', async () => {
      const plain = 'CorrectHorseBatteryStaple!';
      const hashed = await hashPassword(plain);

      const isValid = await comparePassword(plain, hashed);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect passwords against hash', async () => {
      const plain = 'CorrectPassword';
      const hashed = await hashPassword(plain);

      const isValid = await comparePassword('WrongPassword', hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Lifecycle (jose)', () => {
    it('signs and verifies valid token payload', async () => {
      const payload = {
        userId: 'user-test-123',
        email: 'tester@enterprise.gg',
        username: 'TestPlayer',
        role: 'GAMER' as const,
      };

      const token = await signToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const verified = await verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.username).toBe(payload.username);
      expect(verified?.role).toBe(payload.role);
    });

    it('returns null for tampered or invalid token', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
      const verified = await verifyToken(invalidToken);
      expect(verified).toBeNull();
    });

    it('returns null for completely malformed string', async () => {
      const verified = await verifyToken('not-a-token');
      expect(verified).toBeNull();
    });
  });
});

