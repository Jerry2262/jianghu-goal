import { describe, expect, it } from "vitest";
import { demoCards } from "../../src/content/demo";
import { createLegacyState, generatePostMatchRewards, inheritOneReward, resolveEvent } from "../../src/domain/progression";

describe("progression", () => {
  it("generates deterministic post-match reward choices", () => {
    const rewards = generatePostMatchRewards(demoCards, 1);

    expect(rewards).toHaveLength(3);
    expect(rewards).toEqual([
      { kind: "card", cardId: "cloud-step-pass" },
      { kind: "card", cardId: "soft-overcomes-hard" },
      { kind: "recovery", staminaAmount: 2 }
    ]);
  });

  it("keeps martial reward ids unique", () => {
    const rewards = generatePostMatchRewards(demoCards, 1);
    const cardIds = rewards.filter((reward) => reward.kind === "card").map((reward) => reward.cardId);

    expect(new Set(cardIds).size).toBe(cardIds.length);
  });

  it("normalizes negative reward seeds", () => {
    const rewards = generatePostMatchRewards(demoCards, -1);

    expect(rewards).toHaveLength(3);
    expect(rewards.every((reward) => reward.kind === "card" || reward.kind === "recovery" || reward.kind === "legacy")).toBe(true);
  });

  it("rejects invalid reward seeds", () => {
    expect(() => generatePostMatchRewards(demoCards, 1.5)).toThrow("Invalid reward seed");
    expect(() => generatePostMatchRewards(demoCards, Number.NaN)).toThrow("Invalid reward seed");
    expect(() => generatePostMatchRewards(demoCards, Number.POSITIVE_INFINITY)).toThrow("Invalid reward seed");
  });

  it("rejects reward generation without martial cards", () => {
    expect(() => generatePostMatchRewards([], 1)).toThrow("No martial cards available for rewards");
  });

  it("fills missing reward slots with recovery and legacy", () => {
    const rewards = generatePostMatchRewards([{ id: "only-one", name: "Only One", type: "martial", sectId: "wudang", cost: 1, tags: [], text: "" }], 0);

    expect(rewards).toEqual([
      { kind: "card", cardId: "only-one" },
      { kind: "recovery", staminaAmount: 2 },
      { kind: "legacy", legacyPoints: 1 }
    ]);
  });

  it("returns two card rewards and recovery when exactly two unique martial cards are available", () => {
    const rewards = generatePostMatchRewards(
      [
        { id: "one", name: "One", type: "martial", sectId: "wudang", cost: 1, tags: [], text: "" },
        { id: "two", name: "Two", type: "martial", sectId: "wudang", cost: 1, tags: [], text: "" }
      ],
      0
    );

    expect(rewards).toEqual([
      { kind: "card", cardId: "one" },
      { kind: "card", cardId: "two" },
      { kind: "recovery", staminaAmount: 2 }
    ]);
    expect(rewards.some((reward) => reward.kind === "legacy")).toBe(false);
  });

  it("resolves a between-match event into a concrete effect", () => {
    const result = resolveEvent("wandering-monk", "learn-defense");

    expect(result.message).toContain("防守功夫");
    expect(result.reward.kind).toBe("card");
  });

  it("rejects invalid event and choice combinations", () => {
    expect(() => resolveEvent("wandering-monk", "rest")).toThrow("Invalid event choice");
    expect(() => resolveEvent("muddy-pitch", "accept-risk")).toThrow("Invalid event choice");
    expect(() => resolveEvent("private-duel", "rest")).toThrow("Invalid event choice");
  });

  it("resolves a private duel risk into legacy", () => {
    const result = resolveEvent("private-duel", "accept-risk");

    expect(result.reward).toEqual({ kind: "legacy", legacyPoints: 1 });
  });

  it("inherits exactly one selected reward after a run", () => {
    const legacy = inheritOneReward(createLegacyState(), { kind: "card", cardId: "tai-chi-deflection" });

    expect(legacy.inheritedCardIds).toEqual(["tai-chi-deflection"]);
    expect(legacy.inheritedDiscipleIds).toEqual([]);
  });

  it("returns fresh legacy objects without aliasing facility levels", () => {
    const legacy = createLegacyState();
    const inherited = inheritOneReward(legacy, { kind: "card", cardId: "tai-chi-deflection" });

    expect(inherited).not.toBe(legacy);
    expect(inherited.facilityLevels).not.toBe(legacy.facilityLevels);
    expect(inherited.unlockedCardIds).not.toBe(legacy.unlockedCardIds);
    expect(inherited.inheritedDiscipleIds).not.toBe(legacy.inheritedDiscipleIds);
  });

  it("clones non-card rewards immutably", () => {
    const legacy = createLegacyState();
    legacy.unlockedCardIds.push("cloud-step-pass");
    legacy.inheritedDiscipleIds.push("lin-qing");
    legacy.facilityLevels.scriptureHall = 2;

    const inherited = inheritOneReward(legacy, { kind: "legacy", legacyPoints: 1 });

    expect(inherited).not.toBe(legacy);
    expect(inherited).toEqual(legacy);
    expect(inherited.facilityLevels).not.toBe(legacy.facilityLevels);
    expect(inherited.unlockedCardIds).not.toBe(legacy.unlockedCardIds);
    expect(inherited.inheritedDiscipleIds).not.toBe(legacy.inheritedDiscipleIds);
  });
});
