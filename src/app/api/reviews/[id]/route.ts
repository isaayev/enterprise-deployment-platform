import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const review = await db.reviews.findById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const isOwner = review.userId === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this review' },
        { status: 403 }
      );
    }

    await db.reviews.delete(id);

    await logAuditEvent({
      action: 'REVIEW_DELETED',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: `/api/reviews/${id}`,
      status: 'SUCCESS',
      details: `Review ID ${id} deleted by ${currentUser.username}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Review successfully deleted',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
