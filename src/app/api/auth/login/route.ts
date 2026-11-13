import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  const rl = rateLimiter.check(`login:${ip}`, 10, 60 * 1000);
  if (!rl.success) {
    await logAuditEvent({
      action: 'LOGIN_RATE_LIMITED',
      ipAddress: ip,
      resource: '/api/auth/login',
      status: 'BLOCKED',
      details: 'Multiple failed login attempts detected. IP temporarily throttled.',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Too many login attempts. Please wait a minute before trying again.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid input credentials',
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await db.users.findByEmail(email);

    if (!user) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        userEmail: email,
        ipAddress: ip,
        resource: '/api/auth/login',
        status: 'FAILED',
        details: 'Attempted login with unregistered email address',
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        action: 'LOGIN_FAILED',
        userId: user.id,
        userEmail: email,
        ipAddress: ip,
        resource: '/api/auth/login',
        status: 'FAILED',
        details: 'Incorrect password provided',
      });

      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    await logAuditEvent({
      action: 'LOGIN_SUCCESS',
      userId: user.id,
      userEmail: user.email,
      ipAddress: ip,
      resource: '/api/auth/login',
      status: 'SUCCESS',
      details: `User ${user.username} authenticated successfully`,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged in',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        badges: user.badges,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
