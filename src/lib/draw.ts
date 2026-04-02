import { Score } from "@/generated/prisma/client";

export function validateStablefordScore(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 45;
}

export function randomNumbers(count: number, min = 1, max = 45) {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function weightedNumbers(allScores: Score[], count: number) {
  if (!allScores.length) return randomNumbers(count);
  const frequency = new Map<number, number>();
  for (const s of allScores) {
    frequency.set(s.value, (frequency.get(s.value) ?? 0) + 1);
  }
  const sorted = [...frequency.entries()].sort((a, b) => b[1] - a[1]);
  const picked = sorted.slice(0, count).map(([score]) => score);
  if (picked.length < count) {
    const fill = randomNumbers(count - picked.length).filter((n) => !picked.includes(n));
    picked.push(...fill);
  }
  return picked.sort((a, b) => a - b);
}

/** Prefer scores that appear least often in the dataset (inverse frequency). */
export function weightedNumbersLeastFrequent(allScores: Score[], count: number) {
  if (!allScores.length) return randomNumbers(count);
  const frequency = new Map<number, number>();
  for (const s of allScores) {
    frequency.set(s.value, (frequency.get(s.value) ?? 0) + 1);
  }
  const sorted = [...frequency.entries()].sort((a, b) => a[1] - b[1]);
  const picked = sorted.slice(0, count).map(([score]) => score);
  if (picked.length < count) {
    const fill = randomNumbers(count - picked.length).filter((n) => !picked.includes(n));
    picked.push(...fill);
  }
  return picked.sort((a, b) => a - b);
}

export function parseWinningNumbers(raw: string): number[] {
  return raw
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => Number.isInteger(n));
}

export function computeMatchCount(userScores: number[], winningNumbers: number[]) {
  const winnerSet = new Set(winningNumbers);
  return userScores.filter((s) => winnerSet.has(s)).length;
}
