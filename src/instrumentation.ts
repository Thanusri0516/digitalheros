/** Warm Prisma without blocking server startup (fewer cold-connection delays on first request). */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  void import("@/lib/prisma").then(({ prisma }) => prisma.$connect().catch(() => {}));
}
