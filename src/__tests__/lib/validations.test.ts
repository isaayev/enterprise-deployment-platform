import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createReviewSchema,
  createGameSchema,
  gameQuerySchema,
} from '@/lib/validations';

describe('Validation Schemas (Zod)', () => {
  describe('registerSchema', () => {
    it('accepts valid gamer registration input', () => {
      const result = registerSchema.safeParse({
        username: 'pro_gamer_2026',
        email: 'gamer@example.com',
        password: 'ValidPassword123!',
        role: 'GAMER',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid critic registration input', () => {
      const result = registerSchema.safeParse({
        username: 'expert_reviewer',
        email: 'critic@example.com',
        password: 'StrongCriticPassword!',
        role: 'CRITIC',
      });
      expect(result.success).toBe(true);
    });

    it('rejects username shorter than 3 characters', () => {
      const result = registerSchema.safeParse({
        username: 'ab',
        email: 'short@example.com',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 3 characters');
      }
    });

    it('rejects invalid email formats', () => {
      const result = registerSchema.safeParse({
        username: 'valid_user',
        email: 'not-an-email',
        password: 'ValidPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        username: 'valid_user',
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'player@example.com',
        password: 'myPassword123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing or empty fields', () => {
      expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false);
      expect(loginSchema.safeParse({ email: 'player@example.com', password: '' }).success).toBe(false);
      expect(loginSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('createReviewSchema', () => {
    it('validates correct review data', () => {
      const result = createReviewSchema.safeParse({
        gameId: 'game-cyberpunk-2077',
        rating: 5,
        isRecommended: true,
        title: 'Outstanding Expansion and Masterpiece',
        content: 'This game has completely redeemed itself with the latest version. The narrative depth is extraordinary.',
        isAnonymous: false,
        hoursPlayed: 55.5,
      });
      expect(result.success).toBe(true);
    });

    it('rejects ratings below 1 or above 5', () => {
      expect(
        createReviewSchema.safeParse({
          gameId: 'game-1',
          rating: 0,
          isRecommended: false,
          title: 'Too low',
          content: 'This review has enough characters to be valid.',
        }).success
      ).toBe(false);

      expect(
        createReviewSchema.safeParse({
          gameId: 'game-1',
          rating: 6,
          isRecommended: true,
          title: 'Too high',
          content: 'This review has enough characters to be valid.',
        }).success
      ).toBe(false);
    });

    it('rejects content shorter than 10 characters', () => {
      const result = createReviewSchema.safeParse({
        gameId: 'game-1',
        rating: 4,
        isRecommended: true,
        title: 'Good game',
        content: 'Short',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createGameSchema', () => {
    it('validates a complete game listing', () => {
      const result = createGameSchema.safeParse({
        title: 'Starfield 2',
        tagline: 'Explore infinite frontiers',
        description: 'An epic space role-playing journey across settled systems with unprecedented ship customization and freedom.',
        coverImage: 'https://example.com/cover.jpg',
        bannerImage: 'https://example.com/banner.jpg',
        category: 'RPG',
        playerModes: ['Singleplayer'],
        developer: 'Bethesda Game Studios',
        publisher: 'Bethesda Softworks',
        releaseDate: '2027',
        price: 69.99,
        tags: ['Sci-Fi', 'Space', 'RPG'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid image URLs', () => {
      const result = createGameSchema.safeParse({
        title: 'Starfield 2',
        tagline: 'Explore infinite frontiers',
        description: 'An epic space role-playing journey across settled systems with unprecedented ship customization and freedom.',
        coverImage: 'invalid-url',
        bannerImage: 'https://example.com/banner.jpg',
        category: 'RPG',
        playerModes: ['Singleplayer'],
        developer: 'Bethesda',
        publisher: 'Bethesda',
        releaseDate: '2027',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('gameQuerySchema', () => {
    it('parses valid search and pagination options', () => {
      const result = gameQuerySchema.safeParse({
        search: 'cyberpunk',
        sort: 'rating_desc',
        page: '2',
        limit: '10',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
      }
    });
  });
});

