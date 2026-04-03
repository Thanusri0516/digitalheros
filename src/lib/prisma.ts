import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Vercel Postgres sets POSTGRES_PRISMA_URL / POSTGRES_URL; Supabase users must set DATABASE_URL in the dashboard.
 * Prisma only reads DATABASE_URL from the schema, so map common aliases before constructing the client.
 */
function ensureDatabaseUrl(): void {
  if (process.env.DATABASE_URL?.trim()) return;
  const fallback =
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (fallback) {
    process.env.DATABASE_URL = fallback;
  }
}

ensureDatabaseUrl();

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is not set. In Vercel: Project → Settings → Environment Variables → add DATABASE_URL (your Supabase or Postgres connection string). Enable it for Production and Preview, then redeploy—not just in a local .env file.",
  );
}

/**
 * In development, `global.prisma` can stick around across hot reloads while the generated
 * client on disk gains new models after `prisma generate`. That yields `prisma.paymentAllocation`
 * undefined at runtime. Drop the stale instance so the next `PrismaClient` matches generated code.
 */
function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return global.prisma ?? new PrismaClient();
  }
  const existing = global.prisma;
  if (existing && typeof existing.paymentAllocation?.findMany === "function") {
    return existing;
  }
  if (existing) {
    void existing.$disconnect().catch(() => {});
    global.prisma = undefined;
  }
  const client = new PrismaClient();
  global.prisma = client;
  return client;
}

/** If the pool times out (e.g. Supabase), increase `connection_limit` in DATABASE_URL (e.g. `?connection_limit=5`). */
export const prisma = getPrisma();
