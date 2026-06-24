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

function cloneLegacyState(legacy: LegacyState): LegacyState {
  return {
    unlockedCardIds: [...legacy.unlockedCardIds],
    inheritedCardIds: [...legacy.inheritedCardIds],
    inheritedDiscipleIds: [...legacy.inheritedDiscipleIds],
    facilityLevels: {
      ...legacy.facilityLevels
    }
  };
}

function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function generatePostMatchRewards(cards: Card[], seed: number): Reward[] {
  if (!Number.isFinite(seed) || !Number.isInteger(seed)) {
    throw new Error("Invalid reward seed");
  }

  const martialCards = cards.filter((card) => card.type === "martial");
  const uniqueMartialCards = martialCards.filter((card, index, allCards) => {
    return allCards.findIndex((candidate) => candidate.id === card.id) === index;
  });

  if (uniqueMartialCards.length === 0) {
    throw new Error("No martial cards available for rewards");
  }

  const startIndex = positiveModulo(seed, uniqueMartialCards.length);
  const rewards: Reward[] = [];

  for (let offset = 0; offset < uniqueMartialCards.length && rewards.length < 2; offset += 1) {
    const card = uniqueMartialCards[positiveModulo(startIndex + offset, uniqueMartialCards.length)];

    rewards.push({ kind: "card", cardId: card.id });
  }

  if (rewards.length < 3) {
    rewards.push({ kind: "recovery", staminaAmount: 2 });
  }

  if (rewards.length < 3) {
    rewards.push({ kind: "legacy", legacyPoints: 1 });
  }

  return rewards;
}

export function resolveEvent(eventId: EventId, choice: EventChoice): EventResult {
  switch (`${eventId}:${choice}`) {
    case "wandering-monk:learn-defense":
      return {
        message: "The wandering monk teaches a defensive technique.",
        reward: { kind: "card", cardId: "tai-chi-deflection" }
      };
    case "muddy-pitch:rest":
      return {
        message: "The team rests and recovers before playing on the muddy pitch.",
        reward: { kind: "recovery", staminaAmount: 2 }
      };
    case "private-duel:accept-risk":
      return {
        message: "The disciple accepts the risk and earns legacy.",
        reward: { kind: "legacy", legacyPoints: 1 }
      };
    default:
      throw new Error("Invalid event choice");
  }
}

export function inheritOneReward(legacy: LegacyState, reward: Reward): LegacyState {
  if (reward.kind === "card") {
    const cloned = cloneLegacyState(legacy);

    return {
      ...cloned,
      inheritedCardIds: [reward.cardId]
    };
  }

  return cloneLegacyState(legacy);
}
