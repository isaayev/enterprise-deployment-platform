import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gameQuerySchema, createGameSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { Game } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      playerMode: searchParams.get('playerMode') || undefined,
      sort: searchParams.get('sort') || 'rating_desc',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
    };

    const parsed = gameQuerySchema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { search, category, playerMode, sort, page, limit } = parsed.data;
    let allGames = await db.games.getAll();

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      allGames = allGames.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.developer.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      allGames = allGames.filter(
        (g) => g.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (playerMode && playerMode !== 'All') {
      allGames = allGames.filter((g) =>
        g.playerModes.some((m) => m.toLowerCase() === playerMode.toLowerCase())
      );
    }

    allGames.sort((a, b) => {
      switch (sort) {
        case 'rating_desc':
          return b.ratingStats.averageRating - a.ratingStats.averageRating;
        case 'rating_asc':
          return a.ratingStats.averageRating - b.ratingStats.averageRating;
        case 'reviews_desc':
          return b.ratingStats.totalReviews - a.ratingStats.totalReviews;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return b.ratingStats.averageRating - a.ratingStats.averageRating;
      }
    });

    const total = allGames.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedGames = allGames.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedGames,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Games fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin permissions required for this operation' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createGameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid game data' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newGame: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      slug,
      ...data,
      systemRequirements: {
        minimum: {
          os: 'Windows 10 64-bit',
          processor: 'Quad-core processor',
          memory: '8 GB RAM',
          graphics: 'DirectX 11 compatible GPU',
          storage: '50 GB SSD',
        },
        recommended: {
          os: 'Windows 11 64-bit',
          processor: 'Eight-core processor',
          memory: '16 GB RAM',
          graphics: 'DirectX 12 modern GPU',
          storage: '50 GB NVMe SSD',
        },
      },
      ratingStats: {
        averageRating: 0,
        totalReviews: 0,
        positivePercentage: 0,
        starDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.games.create(newGame);

    await logAuditEvent({
      action: 'GAME_CREATED',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: `/api/games/${newGame.id}`,
      status: 'SUCCESS',
      details: `Admin ${currentUser.username} created new game: ${newGame.title}`,
    });

    return NextResponse.json({ success: true, data: newGame }, { status: 201 });
  } catch (error) {
    console.error('Game create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game entry' },
      { status: 500 }
    );
  }
}
