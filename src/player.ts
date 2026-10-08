import type { Player, Card } from "./types.ts";

const STARTING_SCORE = 50;

export function initPlayer(seat: number): Player {
  return {
    seat,
    hand: [],
    drawnCard: null,
    score: STARTING_SCORE,
    isReady: false,
  }
}

export function addCards(player: Player, cards: readonly Card[]): Player {
  return {
    ...player,
    hand: [...player.hand, ...cards],
  };
}

export function addToDrawnCard(player: Player, card: Card): Player {
  if (player.drawnCard) {
    throw new Error("Player has already drawn a Card");
  }

  return {
    ...player,
    drawnCard: card,
  };
}
