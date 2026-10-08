import { SUITS, type Card, type Deck, type DealCardResult } from "./types.ts";

export function buildDeck(): Deck {
  const drawPile = [];
  for (const suit of SUITS) {
    for (let value = 1; value < 14; value++) {
      drawPile.push({
        id: `${suit}_${value}`,
        suit: suit,
        value: value,
      });
    }
  }

  const deck: Deck = {
    drawPile,
    discardPile: [],
  };

  return deck;
}

function shuffle(cards: readonly Card[], random: () => number = Math.random): Card[] {
  const copy = [...cards];
  for (let card = copy.length - 1; card >= 1; card--) {
    const r = random();
    if (r < 0 || r >= 1) {
      throw new Error("random() out of range");
    };
    const j = Math.floor(r * (card + 1));
    // i and j are always in bounds if 0 < random() < 1,
    // hence the "!" (non null assertion operator)
    [copy[card], copy[j]] = [copy[j]!, copy[card]!];
  }
  return copy;
}

export function shuffleDrawPile(deck: Deck, random: () => number = Math.random): Deck {
  const newDeck: Deck = {
    ...deck,
    drawPile: shuffle(deck.drawPile, random),
  };
  return newDeck;
};

function reshuffle(deck: Deck, random: () => number = Math.random): Deck {
  const newDeck: Deck = {
    discardPile: deck.discardPile.slice(-1),
    drawPile: [
      ...deck.drawPile,
      ...(shuffle(deck.discardPile.slice(0, -1), random))
    ],
  };
  return newDeck;
};

export function dealCards(deck: Deck, cardNumber: number, random: () => number = Math.random): DealCardResult | null {
  // Automatic reshuffle cards if number too low
  if (deck.drawPile.length < cardNumber || cardNumber < 1) {
    deck = reshuffle(deck, random);
    if (deck.drawPile.length < cardNumber) {
      return null;
    }
  };

  const dealtCards = deck.drawPile.slice(-cardNumber);
  const newDeck: Deck = {
    ...deck,
    drawPile: deck.drawPile.slice(0, -cardNumber),
  };

  const result: DealCardResult = {
    dealtCards,
    deck: newDeck,
  };

  return result;
};

export function addToDiscardPile(deck: Deck, card: Card): Deck {
  const newDeck: Deck = {
    ...deck,
    discardPile: [...deck.discardPile, card],
  };
  return newDeck;
};

export function drawCard(deck: Deck, from: "drawPile" | "discardPile", random: () => number): DealCardResult | null {
  if (from !== "drawPile" && from !== "discardPile") return null;
  if (from === "drawPile") {
    return dealCards(deck, 1, random);
  }

  const drawnCard = deck.discardPile.slice(-1);
  const newDeck: Deck = {
    ...deck,
    discardPile: deck.discardPile.slice(0, -1),
  };

  const result: DealCardResult = {
    dealtCards: drawnCard,
    deck: newDeck,
  };

  return result;
}
