import { validateStablefordScore } from "@/lib/draw";

/** Stableford points: whole number 1–45 (server-enforced; matches HTML min/max). */
export function parseStablefordScoreFromForm(formData: FormData, key = "score"): number {
  const raw = formData.get(key);
  const value = Number(raw);
  if (!validateStablefordScore(value)) {
    throw new Error("Stableford score must be a whole number from 1 to 45.");
  }
  return value;
}

/** Each score must have a play date; no server-side default. */
export function parseRequiredPlayedAt(formData: FormData, key = "playedAt"): Date {
  const raw = formData.get(key);
  if (raw == null || String(raw).trim() === "") {
    throw new Error("Played date is required for each score.");
  }
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid played date.");
  }
  return d;
}
