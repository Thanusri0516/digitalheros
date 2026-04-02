import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
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
