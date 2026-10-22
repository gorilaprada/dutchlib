import { type Player, type GameState, type GameResult} from "./types.ts";
import { buildDeck, shuffleDrawPile, dealCards } from "./deck.ts";
import { initPlayer } from "./player.ts";
import { ok, fail } from "./result.ts";

export function initGameState(): GameState {
  const deck = shuffleDrawPile(buildDeck(), Math.random);
  const gameState: GameState = {
    deck,
    players: new Map(),
    turnIndex: 0,
    fromDiscard: false,
    phase: "drawing",
    canStack: true,
    maxPlayers: 4,
    peek: null,
  };

  return gameState;
}

export function addPlayer(state: GameState): GameResult{
  const seat = findFreeSeat(state);
  if (seat === null) return fail("Lobby full");

  const newPlayer = initPlayer(seat);
  const players = new Map(state.players);
  players.set(newPlayer.seat, newPlayer)

  const newState: GameState = {
    ...state,
    players,
  };

  return ok(newState);
}


export function dealCardsStart(state: GameState, random: () => number = Math.random): GameResult{
  let players = new Map<number, Player>();
  let deck = state.deck;
  for (const [seat, player] of state.players) {
    const result = dealCards(deck, 4, random);
    if (result === null) {
      return fail("Not enough cards to deal");
    };
    deck = result.deck;
    players.set(seat, {
      ...player,
      hand: [...result.dealtCards]
    });
  };
 
  const newState: GameState = {
    ...state,
    deck,
    players,
    phase: "memorizing"
  };

  return ok(newState);
}

export function endPeek(state: GameState): GameResult {
  if (state.phase !== "peeking") return fail("No peeking right now");
  const newState: GameState = {
    ...state,
    phase: "drawing",
    peek: null,
    turnIndex: nextTurn(state)
  };

  return ok(newState);
}

// TODO: Implement applyMove

// ========= Helper functions =============
function findFreeSeat(state: GameState): number | null {
  for (let i = 0; i < state.maxPlayers; i++) {
    if (!state.players.has(i)) {
      return i;
    }
  };
  return null;
}

export function nextTurn(state: GameState): number {
  return (state.turnIndex + 1) % state.players.size;
}
