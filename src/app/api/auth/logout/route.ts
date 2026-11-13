import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const currentUser = await getCurrentUser();

  if (currentUser) {
    await logAuditEvent({
      action: 'LOGOUT',
      userId: currentUser.id,
      userEmail: currentUser.email,
      ipAddress: ip,
      resource: '/api/auth/logout',
      status: 'SUCCESS',
      details: `${currentUser.username} signed out`,
    });
  }

  const response = NextResponse.json({
    success: true,
    message: 'Successfully logged out',
  });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
