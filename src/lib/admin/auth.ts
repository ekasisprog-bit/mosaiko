import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ─── Constants ──────────────────────────────────────────────────────────────

const COOKIE_NAME = 'mosaiko-admin-session';
const SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('[admin/auth] ADMIN_JWT_SECRET not configured');
  }
  return new TextEncoder().encode(secret);
}

function getPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error('[admin/auth] ADMIN_PASSWORD_HASH not configured');
  }
  return hash;
}

// ─── Password verification ──────────────────────────────────────────────────

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = getPasswordHash();
  return bcrypt.compare(password, hash);
}

// ─── Session management ─────────────────────────────────────────────────────

export async function createSession(): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });

  return token;
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const secret = getJwtSecret();
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Helper to generate password hash (run once) ────────────────────────────
// Use this to generate the hash for ADMIN_PASSWORD_HASH env var:
//   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(h => console.log(h))"
