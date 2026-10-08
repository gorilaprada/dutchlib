import type { GameResult, GameState } from "./types.ts";

export function ok(state: GameState): GameResult {
  return { ok: true, state };
}

export function fail(error: string): GameResult {
  return { ok: false, error };
}
