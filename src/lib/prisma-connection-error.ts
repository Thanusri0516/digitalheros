/**
 * Map Prisma / network DB failures to a single actionable message for server actions.
 * P1001 = can't reach server; P1017 = server closed connection; P1000 = auth failed.
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as Record<string, unknown>;
  const name = typeof e.name === "string" ? e.name : "";
  const code = typeof e.code === "string" ? e.code : "";
  if (name === "PrismaClientKnownRequestError" && ["P1001", "P1017", "P1000"].includes(code)) {
    return true;
  }
  if (name === "PrismaClientInitializationError") return true;
  const msg = typeof e.message === "string" ? e.message : "";
  return /Can't reach database|Can't connect to server|P1001|P1017|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(msg);
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Cannot reach the database. Common fixes: (1) If your Supabase password contains @ # : or /, URL-encode it in DATABASE_URL — for example @ becomes %40. " +
  "(2) Copy fresh URI from Supabase → Project Settings → Database (use Transaction pooler for port 6543). " +
  "(3) Ensure the project is not paused. (4) Check firewall/VPN.";

export function rethrowUnlessDbConnection(error: unknown): never {
  if (isDatabaseConnectionError(error)) {
    throw new Error(DATABASE_UNAVAILABLE_MESSAGE);
  }
  throw error;
}
