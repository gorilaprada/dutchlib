export const SUITS = [ "♤" , "♡" , "♢" , "♧" ] as const;
export type Suit = (typeof SUITS)[number];

export type Card = Readonly<{
  id: string;
  suit: Suit;
  value: number;
}>;

export type Deck = Readonly<{
  drawPile: readonly Card[];
  discardPile: readonly Card[];
}>;

export type dealCardResult = Readonly<{
  dealtCards: readonly Card[],
  deck: Deck;
}>;

export type Player = {
  id: number;
  hand: Card[];
  drawnCard: Card | null;
  score: number;
  isReady: boolean;
}

export interface Result {
  error: string | null;
}

export interface DrawResult extends Result {
  data?: {
    card: Card,
    discardTop: Card | null;
  }
}

export type Phase = "drawing" | "deciding" | "power_jack" | "power_queen";
