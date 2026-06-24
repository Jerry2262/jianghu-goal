import { describe, expect, it } from "vitest";
import { createRunState, applyGroupResult, canAdvanceFromGroup, applyKnockoutResult } from "../../src/domain/run";

describe("run state", () => {
  it("starts with reputation and a four-team group table", () => {
    const run = createRunState();

    expect(run.reputation).toBe(5);
    expect(Object.keys(run.groupTable)).toHaveLength(4);
    expect(run.stage).toBe("group");
  });

  it("reduces reputation by one after a group-stage loss", () => {
    const run = applyGroupResult(createRunState(), { homeId: "player", awayId: "shaolin", homeGoals: 0, awayGoals: 1 });

    expect(run.reputation).toBe(4);
  });

  it("qualifies the player when they are top two", () => {
    let run = createRunState();
    run = applyGroupResult(run, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 0 });
    run = applyGroupResult(run, { homeId: "player", awayId: "beggar", homeGoals: 1, awayGoals: 1 });
    run = applyGroupResult(run, { homeId: "player", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });

    expect(canAdvanceFromGroup(run)).toBe(true);
  });

  it("ends the run after a knockout loss", () => {
    const run = applyKnockoutResult(createRunState(), "opponent");

    expect(run.stage).toBe("ended");
    expect(run.endedReason).toBe("lost knockout match");
  });
});
