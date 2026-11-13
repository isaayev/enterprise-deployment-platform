import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createReviewSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit';
import { Review } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      const allReviews = await db.reviews.getAll();
      return NextResponse.json({ success: true, data: allReviews });
    }

    const reviews = await db.reviews.getByGameId(gameId);
    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        total: reviews.length,
      },
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: 'You must be logged in to rate and review games' },
      { status: 401 }
    );
  }

  const rl = rateLimiter.check(`review:${currentUser.id}`, 3, 30 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'You are submitting reviews too frequently. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const game = await db.games.findById(data.gameId);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'The specified game was not found' },
        { status: 404 }
      );
    }

    const existingReviews = await db.reviews.getByGameId(data.gameId);
    const userAlreadyReviewed = existingReviews.some((r) => r.userId === currentUser.id);

    if (userAlreadyReviewed) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a review for this game.' },
        { status: 409 }
      );
    }

    const authorDisplayName = data.isAnonymous ? 'Anonymous Gamer' : currentUser.username;
    const authorDisplayAvatar = data.isAnonymous ? '' : currentUser.avatarUrl;

    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      gameId: data.gameId,
      userId: currentUser.id,
      authorName: authorDisplayName,
      authorAvatar: authorDisplayAvatar,
      isAnonymous: data.isAnonymous,
      rating: data.rating,
      isRecommended: data.isRecommended,
      title: data.title,
      content: data.content,
      hoursPlayed: data.hoursPlayed || 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0,
      votedUserIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verifiedPurchase: true,
    };

    await db.reviews.create(newReview);

    await logAuditEvent({
      action: 'REVIEW_CREATED',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: `/api/games/${data.gameId}/reviews`,
      status: 'SUCCESS',
      details: `${currentUser.username} (${data.isAnonymous ? 'Anonymous' : 'Public'}) rated "${game.title}" ${data.rating} stars`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your review and rating have been published!',
        data: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while publishing review' },
      { status: 500 }
    );
  }
}
