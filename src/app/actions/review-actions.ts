'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { createReviewSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { Review } from '@/types';

export interface ActionState<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

export async function submitReviewAction(
  _prevState: ActionState<Review> | null,
  formData: FormData
): Promise<ActionState<Review>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: 'You must be logged in to submit a review.',
    };
  }

  const rawData = {
    gameId: formData.get('gameId')?.toString() || '',
    rating: Number(formData.get('rating')),
    isRecommended: formData.get('isRecommended') === 'true' || formData.get('isRecommended') === 'on',
    title: formData.get('title')?.toString().trim() || '',
    content: formData.get('content')?.toString().trim() || '',
    isAnonymous: formData.get('isAnonymous') === 'true' || formData.get('isAnonymous') === 'on',
    hoursPlayed: Number(formData.get('hoursPlayed') || 0),
  };

  const parsed = createReviewSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      const field = err.path[0]?.toString() || 'general';
      fieldErrors[field] = err.message;
    });

    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid review data provided',
      fieldErrors,
    };
  }

  const data = parsed.data;
  const game = await db.games.findById(data.gameId);
  if (!game) {
    return {
      success: false,
      error: 'Game not found.',
    };
  }

  const existingReviews = await db.reviews.getByGameId(data.gameId);
  if (existingReviews.some((r) => r.userId === currentUser.id)) {
    return {
      success: false,
      error: 'You have already submitted a review for this game.',
    };
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
    action: 'SERVER_ACTION_REVIEW_CREATED',
    userId: currentUser.id,
    userEmail: currentUser.email,
    resource: `/games/${data.gameId}`,
    status: 'SUCCESS',
    details: `Review created via Server Action: ${newReview.title} (${data.isAnonymous ? 'Anonymous' : 'Public'})`,
  });

  revalidatePath(`/games/${data.gameId}`);
  revalidatePath('/');

  return {
    success: true,
    message: 'Your review has been successfully submitted!',
    data: newReview,
  };
}
