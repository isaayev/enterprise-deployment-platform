import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { rateLimiter } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  const rl = rateLimiter.check(`register:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid input credentials',
        },
        { status: 400 }
      );
    }

    const { username, email, password, role } = parsed.data;

    const existingEmail = await db.users.findByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'This email address is already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await db.users.findByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'This username is already taken' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      username,
      email,
      passwordHash,
      role: role || 'GAMER',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      createdAt: new Date().toISOString(),
      badges: ['New Gamer'],
    };

    await db.users.create(newUser);

    await logAuditEvent({
      action: 'USER_REGISTERED',
      userId: newUser.id,
      userEmail: newUser.email,
      ipAddress: ip,
      resource: '/api/auth/register',
      status: 'SUCCESS',
      details: `New account created: ${newUser.username} (${newUser.role})`,
    });

    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account successfully registered',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          badges: newUser.badges,
        },
      },
      { status: 201 }
    );

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
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error occurred' },
      { status: 500 }
    );
  }
}
