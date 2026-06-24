import { describe, expect, it } from "vitest";
import { createMatchState, resolveMoment, finishMatch } from "../../src/domain/match";

describe("match engine", () => {
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
});
