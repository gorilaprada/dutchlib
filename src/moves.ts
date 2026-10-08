import type { GameState, GameResult } from "./types.ts";
import { ok, fail } from "./result.ts";
import { drawCard } from "./deck.ts";
import { addToDrawnCard } from "./player.ts";

export function drawFrom(state: GameState, seat: number, drawFrom: "drawPile" | "discardPile", random: () => number): GameResult {
  const player = state.players.get(seat);
  if (!player) return fail("Player not found");
  if (seat !== state.turnIndex) return fail("Not your turn");

  // Move specific checks
  if (state.phase !== "drawing") return fail("Not drawing right now");
  if (drawFrom === "discardPile" && state.deck.discardPile.length === 0) return fail("Discard Pile is empty");

  const result = drawCard(state.deck, drawFrom, random);
  if (!result) return fail("Cannot draw");
  
  const drawnCard = result.dealtCards[0];
  if (!drawnCard) return fail("Nothing to draw");

  const players = new Map(state.players);
  players.set(seat, addToDrawnCard(player, drawnCard))

  const newState: GameState = {
    ...state,
    deck: result.deck,
    players,
    phase: "deciding",
    fromDiscard: drawFrom === "discardPile",
    canStack: true,
  };

  return ok(newState);
}

/*
  switchCards(socketId: string, handIndex: number): Result {
    try {
      // Set values
      const player = this.players.get(socketId);
      const activePlayerId = this.playerOrder[this.turnIndex];

      // Validation
      if (!player) throw new Error("Player not found");

      if (socketId !== activePlayerId) {
        throw new Error("Not your turn!");
      }

      if (this.phase !== "deciding") {
        throw new Error("Cannot perform this action because of the phase of the game");
      }


      // Logic
      const oldCard = player.hand[handIndex];
      if (!oldCard) throw new Error("No card to switch with");
      oldCard.isFaceUp = true;

      if (!player.drawnCard) throw new Error("Player has no drawn card");
      player.drawnCard.isFaceUp = false;
      player.hand[handIndex] = player.drawnCard;

      this.discardPile.push(oldCard);
      player.drawnCard = null;

      // Side effects
      if (oldCard.value === 11) {
        this.phase = "power_jack";
        this.pendingPowerOwner = socketId;
        return { error: null }
      }

      if (oldCard.value === 12) {
        this.phase = "power_queen";
        this.pendingPowerOwner = socketId;
        return { error: null }
      }

      this.phase = "drawing";
      this.turnIndex = (this.turnIndex + 1) % this.playerOrder.length

      // Function output
      return { error: null };
    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    }
    return { error: "Unknown error in drawFrom" };
  }

  discardCard(socketId: string): Result {
    try {
      // Set values
      const player = this.players.get(socketId);
      const activePlayerId = this.playerOrder[this.turnIndex];

      // Validation
      if (!player) throw new Error("Player not found");

      if (socketId !== activePlayerId) {
        throw new Error("Not your turn!");
      }

      if (this.phase !== "deciding") {
        throw new Error("Cannot perform this action because of the phase of the game");
      }

      if (this.fromDiscard) {
        throw new Error("Cannot perform this action because you picked from discard");
      }

      // Logic (changes made to the game state)
      if (!player.drawnCard) throw new Error("Player has no drawn card");

      const discardCard = player.drawnCard;
      discardCard.isFaceUp = true;
      this.discardPile.push(discardCard);
      player.drawnCard = null;

      // Side effects
      if (discardCard.value === 11) {
        this.phase = "power_jack";
        this.pendingPowerOwner = socketId;
        return { error: null }
      }

      if (discardCard.value === 12) {
        this.phase = "power_queen";
        this.pendingPowerOwner = socketId;
        return { error: null }
      }

      this.phase = "drawing";
      if (this.fromDiscard) {
        this.fromDiscard = false;
        console.log("fromDiscard = false");
      }
      this.turnIndex = (this.turnIndex + 1) % this.playerOrder.length

      // Function output
      return { error: null };

    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    }

    return { error: "Unknown error in drawFrom" };
  }

  stack(socketId: string, handIndex: number): Result {
    try {
      // Set values
      const player = this.players.get(socketId);
      if (!player) throw new Error("Player not found");
      const stackCard = player.hand[handIndex];
      const topDiscard = this.discardPile.at(-1);

      // Validation
      if (!stackCard || !topDiscard) throw new Error("Invalid Move");

      // Logic (changes made to the game state)
      if (stackCard.value === topDiscard.value && this.canStack === true) {
        stackCard.isFaceUp = true;
        this.discardPile.push(stackCard)

        player.hand.splice(handIndex, 1);

        this.canStack = false;

        // Function output
        return { error: null }

      } else {
        const penaltyCard = this.deck.deck.pop()
        if (!penaltyCard) throw new Error("Could not extract a penalty card");
        player.hand.push(penaltyCard);
        throw new Error("Cannot discard! A penalty is coming.");
      };

    } catch (err) {

      if (err instanceof Error) {
        return { error: err.message };
      }

    }

    return { error: "Unknown error in drawFrom" };
  };

  jackPower(socketId: string, player1Id: string, index1: number, player2Id: string, index2: number): Result {
    try {
      // Set values
      const p1 = this.players.get(player1Id);
      const p2 = this.players.get(player2Id);

      // Validation
      if (this.phase !== "power_jack" || this.pendingPowerOwner !== socketId) {
        throw new Error("Not your power to execute");
      }

      if (!p1 || !p2 || !p1.hand[index1] || !p2.hand[index2]) {
        throw new Error("Invalid target cards");
      }

      // Logic (change smade to the state of the game)
      const temp = p1.hand[index1];
      p1.hand[index1] = p2.hand[index2];
      p2.hand[index2] = temp;

      // Side effects
      this.phase = "drawing";
      this.pendingPowerOwner = null;
      this.turnIndex = (this.turnIndex + 1) % this.playerOrder.length;

      // Function output
      return { error: null }

    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    }

    return { error: "Unknown error in drawFrom" };
  };

  queenPower(socketId: string, targetPlayerId: string, handIndex: number): Result {
    try {
      // Validation
      if (this.phase !== "power_queen" || this.pendingPowerOwner !== socketId) {
        throw new Error("Not your power to execute");
      }

      // Set values
      const targetPlayer = this.players.get(targetPlayerId);
      if (!targetPlayer) throw new Error("Target player not found");
      const card = targetPlayer.hand[handIndex];

      // Logic (changes made to the game state)
      if (!card) throw new Error("Target player has no card at that index");
      card.isFaceUp = true;

      // Side effects
      this.phase = "drawing";
      this.pendingPowerOwner = null;
      this.turnIndex = (this.turnIndex + 1) % this.playerOrder.length;

      // Function output
      return { error: null }

    } catch (err) {
      if (err instanceof Error) {
        return { error: err.message };
      }
    }

    return { error: "Unknown error in drawFrom" };
  }
}
 */
