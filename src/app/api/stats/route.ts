import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const games = await db.games.getAll();
    const reviews = await db.reviews.getAll();
    const users = await db.users.getAll();

    const totalGames = games.length;
    const totalReviews = reviews.length;
    const totalUsers = users.length;

    const avgRating =
      reviews.length > 0
        ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 0;

    const positiveReviews = reviews.filter((r) => r.isRecommended || r.rating >= 4).length;
    const globalPositivePercentage =
      reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : 0;

    const categoriesMap: Record<string, number> = {};
    for (const g of games) {
      categoriesMap[g.category] = (categoriesMap[g.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalGames,
        totalReviews,
        totalUsers,
        avgRating,
        globalPositivePercentage,
        categoriesDistribution: categoriesMap,
        uptime: '99.98%',
        apiStatus: 'Operational',
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while retrieving statistics' },
      { status: 500 }
    );
  }
}
