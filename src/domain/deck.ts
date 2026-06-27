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
  const seenCardIds = new Set<string>();

  for (const card of cards) {
    if (!Number.isFinite(card.cost) || !Number.isInteger(card.cost) || card.cost < 0) {
      throw new Error(`卡牌费用无效：${card.name}`);
    }

    if (seenCardIds.has(card.id)) {
      throw new Error(`卡牌编号重复：${card.id}`);
    }

    seenCardIds.add(card.id);
  }

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
  if (state.hand.length > 0) {
    throw new Error("手牌未清空，不能开始新的关键回合");
  }

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
  const cardIndex = state.hand.findIndex((candidate) => candidate.id === cardId);

  if (cardIndex === -1) {
    throw new Error(`手牌中没有这张牌：${cardId}`);
  }

  const card = state.hand[cardIndex];

  if (state.playsRemaining <= 0) {
    throw new Error("本回合出牌次数已用完");
  }

  if (card.cost > state.momentum) {
    throw new Error(`气势不足，无法打出：${card.name}`);
  }

  return {
    ...state,
    hand: [...state.hand.slice(0, cardIndex), ...state.hand.slice(cardIndex + 1)],
    discard: card.exhausts ? state.discard : [...state.discard, card],
    exhaust: card.exhausts ? [...state.exhaust, card] : state.exhaust,
    momentum: state.momentum - card.cost,
    playsRemaining: state.playsRemaining - 1
  };
}

export function gainMomentum(state: DeckState, amount: number): DeckState {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
    throw new Error("气势增量无效");
  }

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
