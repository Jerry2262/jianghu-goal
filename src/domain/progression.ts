import type { Card } from "./types";

export type Reward =
  | { kind: "card"; cardId: string }
  | { kind: "recovery"; staminaAmount: number }
  | { kind: "legacy"; legacyPoints: number };

export type EventId = "wandering-monk" | "muddy-pitch" | "private-duel";
export type EventChoice = "learn-defense" | "rest" | "accept-risk";

export interface EventResult {
  message: string;
  reward: Reward;
}

export interface LegacyState {
  unlockedCardIds: string[];
  inheritedCardIds: string[];
  inheritedDiscipleIds: string[];
  facilityLevels: {
    scriptureHall: number;
    trainingGround: number;
    infirmary: number;
  };
}

export function createLegacyState(): LegacyState {
  return {
    unlockedCardIds: [],
    inheritedCardIds: [],
    inheritedDiscipleIds: [],
    facilityLevels: {
      scriptureHall: 0,
      trainingGround: 0,
      infirmary: 0
    }
  };
}

export function generatePostMatchRewards(cards: Card[], seed: number): Reward[] {
  const martialCards = cards.filter((card) => card.type === "martial");
  const firstCard = martialCards[seed % martialCards.length];
  const secondCard = martialCards[(seed + 2) % martialCards.length];

  return [
    { kind: "card", cardId: firstCard.id },
    { kind: "card", cardId: secondCard.id },
    { kind: "recovery", staminaAmount: 2 }
  ];
}

export function resolveEvent(eventId: EventId, choice: EventChoice): EventResult {
  if (eventId === "wandering-monk" && choice === "learn-defense") {
    return {
      message: "The wandering monk teaches a defensive technique.",
      reward: { kind: "card", cardId: "tai-chi-deflection" }
    };
  }

  if (eventId === "muddy-pitch" && choice === "rest") {
    return {
      message: "The team rests and recovers before playing on the muddy pitch.",
      reward: { kind: "recovery", staminaAmount: 2 }
    };
  }

  return {
    message: "The disciple accepts the risk and earns legacy.",
    reward: { kind: "legacy", legacyPoints: 1 }
  };
}

export function inheritOneReward(legacy: LegacyState, reward: Reward): LegacyState {
  if (reward.kind === "card") {
    return { ...legacy, inheritedCardIds: [reward.cardId] };
  }

  return legacy;
}
