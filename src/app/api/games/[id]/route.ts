import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const game = await db.games.findById(id);

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: game,
    });
  } catch (error) {
    console.error('Game detail fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin permission required for this operation' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await db.games.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    await logAuditEvent({
      action: 'GAME_UPDATED',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: `/api/games/${id}`,
      status: 'SUCCESS',
      details: `Admin ${currentUser.username} updated game: ${updated.title}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Game update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin permission required for this operation' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const existing = await db.games.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Game not found to delete' },
        { status: 404 }
      );
    }

    await db.games.delete(id);

    await logAuditEvent({
      action: 'GAME_DELETED',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: `/api/games/${id}`,
      status: 'SUCCESS',
      details: `Admin ${currentUser.username} deleted game: ${existing.title}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully',
    });
  } catch (error) {
    console.error('Game delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete game' },
      { status: 500 }
    );
  }
}
