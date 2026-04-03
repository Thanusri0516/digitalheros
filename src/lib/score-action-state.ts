export type ScoreActionState = {
  error: string;
  /** Set on success so the client can `router.refresh()` and show new scores immediately. */
  updatedAt?: number;
};

export const SCORE_ACTION_INITIAL_STATE: ScoreActionState = { error: "" };

export function scoreActionSuccessState(): ScoreActionState {
  return { error: "", updatedAt: Date.now() };
}
