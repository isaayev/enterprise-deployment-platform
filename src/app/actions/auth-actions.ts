'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { loginSchema, registerSchema } from '@/lib/validations';
import { comparePassword, hashPassword, signToken, AUTH_COOKIE_NAME, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { User } from '@/types';
import { ActionState } from './review-actions';

export async function loginServerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get('email')?.toString().trim() || '',
    password: formData.get('password')?.toString() || '',
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid email or password',
    };
  }

  const { email, password } = parsed.data;
  const user = await db.users.findByEmail(email);

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  await logAuditEvent({
    action: 'SERVER_ACTION_LOGIN',
    userId: user.id,
    userEmail: user.email,
    resource: '/login',
    status: 'SUCCESS',
    details: `${user.username} logged in via Server Action`,
  });

  return {
    success: true,
    message: 'Successfully logged in',
  };
}

export async function registerServerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    username: formData.get('username')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    password: formData.get('password')?.toString() || '',
    role: (formData.get('role')?.toString() as 'GAMER' | 'CRITIC') || 'GAMER',
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Input requirements not satisfied',
    };
  }

  const { username, email, password, role } = parsed.data;

  const existingEmail = await db.users.findByEmail(email);
  if (existingEmail) {
    return { success: false, error: 'This email is already registered' };
  }

  const existingUser = await db.users.findByUsername(username);
  if (existingUser) {
    return { success: false, error: 'This username is already taken' };
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

  const token = await signToken({
    userId: newUser.id,
    email: newUser.email,
    username: newUser.username,
    role: newUser.role,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return {
    success: true,
    message: 'Registration complete!',
  };
}

export async function logoutServerAction() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await logAuditEvent({
      action: 'SERVER_ACTION_LOGOUT',
      userId: currentUser.id,
      userEmail: currentUser.email,
      resource: '/logout',
      status: 'SUCCESS',
      details: `${currentUser.username} logged out`,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return { success: true };
}
