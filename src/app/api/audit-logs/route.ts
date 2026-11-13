import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin permissions required to view audit logs' },
      { status: 403 }
    );
  }

  try {
    const logs = await db.auditLogs.getAll(100);
    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit log trail' },
      { status: 500 }
    );
  }
}
