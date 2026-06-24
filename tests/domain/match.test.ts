import { describe, expect, it } from "vitest";
import { createMatchState, resolveMoment, finishMatch } from "../../src/domain/match";
import type { MomentOutcome } from "../../src/domain/match";

describe("match engine", () => {
  it("rejects empty opponent ids", () => {
    expect(() => createMatchState("group", "   ")).toThrow("Invalid opponent id");
  });

  it("adds a goal when an attacking moment succeeds with a shot card", () => {
    let match = createMatchState("group", "shaolin");
    match = resolveMoment(match, { outcome: "player-goal" });

    expect(match.playerGoals).toBe(1);
    expect(match.opponentGoals).toBe(0);
    expect(match.resolvedMoments).toBe(1);
  });

  it("records opponent goals on failed defense", () => {
    let match = createMatchState("group", "shaolin");
    match = resolveMoment(match, { outcome: "opponent-goal" });

    expect(match.opponentGoals).toBe(1);
  });

  it("increments resolved moments for neutral outcomes without changing goals", () => {
    const start = createMatchState("group", "shaolin");

    for (const outcome of ["save", "turnover", "fatigue"] as const) {
      const match = resolveMoment(start, { outcome });

      expect(match.playerGoals).toBe(0);
      expect(match.opponentGoals).toBe(0);
      expect(match.resolvedMoments).toBe(1);
    }
  });

  it("throws when a moment outcome is invalid at runtime", () => {
    const match = createMatchState("group", "shaolin");

    expect(() => resolveMoment(match, { outcome: "bad" as MomentOutcome })).toThrow("Invalid moment outcome");
  });

  it("throws when resolving after the maximum number of moments", () => {
    const match = createMatchState("group", "shaolin");

    expect(() => resolveMoment({ ...match, resolvedMoments: 4 }, { outcome: "save" })).toThrow(
      "No unresolved moments remaining"
    );
  });

  it.each([
    ["resolved moments greater than max moments", { resolvedMoments: 5 }],
    ["negative resolved moments", { resolvedMoments: -1 }],
    ["fractional resolved moments", { resolvedMoments: 1.5 }],
    ["non-finite resolved moments", { resolvedMoments: Number.NaN }]
  ] as const)("rejects invalid resolve moment state for %s", (_, patch) => {
    const match = createMatchState("group", "shaolin");

    expect(() => resolveMoment({ ...match, ...patch }, { outcome: "save" })).toThrow("Invalid match moment state");
  });

  it.each([
    ["max moments zero", { maxMoments: 0 }],
    ["negative max moments", { maxMoments: -1 }],
    ["fractional max moments", { maxMoments: 1.5 }],
    ["non-finite max moments", { maxMoments: Number.POSITIVE_INFINITY }]
  ] as const)("rejects invalid resolve moment max state for %s", (_, patch) => {
    const match = createMatchState("group", "shaolin");

    expect(() => resolveMoment({ ...match, ...patch }, { outcome: "save" })).toThrow("Invalid match moment state");
  });

  it("allows group-stage draws without sudden death", () => {
    const match = createMatchState("group", "shaolin");
    const result = finishMatch({ ...match, resolvedMoments: 4, playerGoals: 1, opponentGoals: 1 });

    expect(result.winner).toBe("draw");
    expect(result.needsSuddenDeath).toBe(false);
  });

  it("requires sudden death for knockout draws", () => {
    const match = createMatchState("knockout", "iron-palm");
    const result = finishMatch({ ...match, resolvedMoments: 4, playerGoals: 1, opponentGoals: 1 });

    expect(result.winner).toBe("draw");
    expect(result.needsSuddenDeath).toBe(true);
  });

  it("throws when finishing before all moments are resolved", () => {
    const match = createMatchState("group", "shaolin");

    expect(() => finishMatch({ ...match, resolvedMoments: 3 })).toThrow("Match still has unresolved moments");
  });

  it("throws when finishing with invalid moment counts", () => {
    const match = createMatchState("group", "shaolin");

    expect(() => finishMatch({ ...match, resolvedMoments: 5 })).toThrow("Invalid match moment state");
  });

  it.each([
    ["negative resolved moments", { resolvedMoments: -1 }],
    ["fractional resolved moments", { resolvedMoments: 1.5 }],
    ["non-finite resolved moments", { resolvedMoments: Number.NaN }]
  ] as const)("throws when finishing with invalid resolved moments for %s", (_, patch) => {
    const match = createMatchState("group", "shaolin");

    expect(() => finishMatch({ ...match, ...patch, maxMoments: 4, playerGoals: 0, opponentGoals: 0 })).toThrow(
      "Invalid match moment state"
    );
  });

  it.each([
    ["max moments zero", { maxMoments: 0 }],
    ["negative max moments", { maxMoments: -1 }],
    ["fractional max moments", { maxMoments: 1.5 }],
    ["non-finite max moments", { maxMoments: Number.POSITIVE_INFINITY }]
  ] as const)("throws when finishing with invalid max moments for %s", (_, patch) => {
    const match = createMatchState("group", "shaolin");

    expect(() => finishMatch({ ...match, resolvedMoments: 4, ...patch, playerGoals: 0, opponentGoals: 0 })).toThrow(
      "Invalid match moment state"
    );
  });

  it("throws when finishing with invalid goal counts", () => {
    const match = createMatchState("group", "shaolin");

    for (const goals of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY] as const) {
      expect(() => finishMatch({ ...match, resolvedMoments: 4, playerGoals: goals })).toThrow("Invalid goal count");
      expect(() => finishMatch({ ...match, resolvedMoments: 4, opponentGoals: goals })).toThrow("Invalid goal count");
    }
  });
});
