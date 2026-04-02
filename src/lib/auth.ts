import { cookies } from "next/headers";
import { cache } from "react";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/client";

const COOKIE_NAME = "dh_session";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export type SessionPayload = {
  userId: string;
  role: Role;
  name: string;
  email: string;
};

export async function hashPassword(raw: string) {
  return bcrypt.hash(raw, 10);
}

export async function verifyPassword(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** JWT-only session (no DB). Use in root layout and for auth guards to avoid a database round-trip on every navigation. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Partial<SessionPayload> & { userId?: string; role?: Role };
    if (!payload.userId || !payload.role) return null;
    return {
      userId: payload.userId,
      role: payload.role,
      name: String(payload.name ?? "Player"),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
});

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}
