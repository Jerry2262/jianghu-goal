import type { Card } from "./types";

export interface DeckState {
  drawPile: Card[];
  hand: Card[];
  discard: Card[];
  exhaust: Card[];
  momentum: number;
  playsRemaining: number;
}

export function createDeckState(cards: Card[]): DeckState {
  return {
    drawPile: [...cards],
    hand: [],
    discard: [],
    exhaust: [],
    momentum: 0,
    playsRemaining: 0
  };
}

export function drawForMoment(state: DeckState): DeckState {
  let next: DeckState = {
    ...state,
    drawPile: [...state.drawPile],
    hand: [],
    discard: [...state.discard],
    exhaust: [...state.exhaust],
    momentum: 3,
    playsRemaining: 3
  };

  while (next.hand.length < 5) {
    if (next.drawPile.length === 0) {
      if (next.discard.length === 0) break;
      next = { ...next, drawPile: [...next.discard], discard: [] };
    }

    const card = next.drawPile.shift();
    if (card) {
      next.hand.push(card);
    }
  }

  return next;
}

export function playCard(state: DeckState, cardId: string): DeckState {
  const card = state.hand.find((candidate) => candidate.id === cardId);

  if (!card) {
    throw new Error(`Card not in hand: ${cardId}`);
  }

  if (state.playsRemaining <= 0) {
    throw new Error("No plays remaining");
  }

  if (card.cost > state.momentum) {
    throw new Error(`Not enough momentum for ${card.name}`);
  }

  return {
    ...state,
    hand: state.hand.filter((candidate) => candidate.id !== cardId),
    discard: card.exhausts ? state.discard : [...state.discard, card],
    exhaust: card.exhausts ? [...state.exhaust, card] : state.exhaust,
    momentum: state.momentum - card.cost,
    playsRemaining: state.playsRemaining - 1
  };
}

export function gainMomentum(state: DeckState, amount: number): DeckState {
  return { ...state, momentum: state.momentum + amount };
}

export function endMoment(state: DeckState): DeckState {
  return {
    ...state,
    hand: [],
    discard: [...state.discard, ...state.hand],
    momentum: 0,
    playsRemaining: 0
  };
}
