import { describe, expect, it } from "vitest";
import { demoCards } from "../../src/content/demo";
import { createLegacyState, generatePostMatchRewards, inheritOneReward, resolveEvent } from "../../src/domain/progression";

describe("progression", () => {
  it("generates three post-match reward choices", () => {
    const rewards = generatePostMatchRewards(demoCards, 1);

    expect(rewards).toHaveLength(3);
    expect(rewards.every((reward) => reward.kind === "card" || reward.kind === "recovery" || reward.kind === "legacy")).toBe(true);
  });

  it("resolves a between-match event into a concrete effect", () => {
    const result = resolveEvent("wandering-monk", "learn-defense");

    expect(result.message).toContain("defensive technique");
    expect(result.reward.kind).toBe("card");
  });

  it("inherits exactly one selected reward after a run", () => {
    const legacy = inheritOneReward(createLegacyState(), { kind: "card", cardId: "tai-chi-deflection" });

    expect(legacy.inheritedCardIds).toEqual(["tai-chi-deflection"]);
    expect(legacy.inheritedDiscipleIds).toEqual([]);
  });
});
