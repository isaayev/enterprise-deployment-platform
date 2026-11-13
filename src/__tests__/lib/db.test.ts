import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';

describe('Database Architecture & Model Integrity', () => {
  it('loads games collection with required properties', async () => {
    const games = await db.games.getAll();
    expect(Array.isArray(games)).toBe(true);
    expect(games.length).toBeGreaterThan(0);

    const first = games[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('ratingStats');
    expect(first.ratingStats).toHaveProperty('averageRating');
  });

  it('retrieves game by id or slug', async () => {
    const game = await db.games.findById('cyberpunk-2077');
    expect(game).not.toBeNull();
    expect(game?.title).toContain('Cyberpunk');
  });

  it('filters reviews by gameId properly', async () => {
    const reviews = await db.reviews.getByGameId('game-cyberpunk-2077');
    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);
    reviews.forEach((r) => {
      expect(r.gameId).toBe('game-cyberpunk-2077');
    });
  });

  it('finds existing users by email and username', async () => {
    const admin = await db.users.findByEmail('admin@enterprise.gg');
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe('ADMIN');

    const byUsername = await db.users.findByUsername(admin?.username || 'NexusAdmin');
    expect(byUsername?.id).toBe(admin?.id);
  });

  it('records helpful and unhelpful votes on reviews without duplicates', async () => {
    const reviews = await db.reviews.getAll();
    expect(reviews.length).toBeGreaterThan(0);
    const targetReview = reviews[0];

    const voterId = `test-voter-${Date.now()}`;
    const initialHelpful = targetReview.helpfulVotes || 0;

    const voted = await db.reviews.voteHelpful(targetReview.id, voterId, true);
    expect(voted).not.toBeNull();
    expect(voted?.helpfulVotes).toBe(initialHelpful + 1);

    // Duplicate vote from same user should not increment count
    const duplicateVote = await db.reviews.voteHelpful(targetReview.id, voterId, true);
    expect(duplicateVote?.helpfulVotes).toBe(initialHelpful + 1);
  });
});

