/** P2021: table does not exist (migrations not applied yet). */
export function isPrismaMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2021"
  );
}
