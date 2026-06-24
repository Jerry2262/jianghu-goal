import { describe, expect, it } from "vitest";
import { createRunState, applyGroupResult, canAdvanceFromGroup, applyKnockoutResult } from "../../src/domain/run";
import { createGroupTable, recordResult } from "../../src/domain/tournament";

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

  it("throws when applying a group result outside the group stage", () => {
    const run = { ...createRunState(), stage: "semifinal" as const };

    expect(() =>
      applyGroupResult(run, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 })
    ).toThrow("Cannot apply group result outside group stage");
  });

  it("throws when applying a fourth group result", () => {
    const run = { ...createRunState(), groupMatchesPlayed: 3 };

    expect(() =>
      applyGroupResult(run, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 })
    ).toThrow("Group stage already complete");
  });

  it("throws when applying a group result that does not involve the player", () => {
    expect(() =>
      applyGroupResult(createRunState(), { homeId: "shaolin", awayId: "beggar", homeGoals: 1, awayGoals: 0 })
    ).toThrow("Group result must involve player");
  });

  it("qualifies the player when they are top two", () => {
    let run = createRunState();
    run = applyGroupResult(run, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 0 });
    run = applyGroupResult(run, { homeId: "player", awayId: "beggar", homeGoals: 1, awayGoals: 1 });
    run = applyGroupResult(run, { homeId: "player", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });

    expect(canAdvanceFromGroup(run)).toBe(true);
  });

  it("ends the run after a playoff-required group stage", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "player", awayId: "beggar", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "shaolin", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "shaolin", awayId: "beggar", homeGoals: 0, awayGoals: 0 });

    const run = {
      ...createRunState(),
      groupTable: table,
      groupMatchesPlayed: 2
    };

    const next = applyGroupResult(run, { homeId: "player", awayId: "iron-palm", homeGoals: 0, awayGoals: 0 });

    expect(next.stage).toBe("ended");
    expect(next.endedReason).toBe("advancement playoff required");
  });

  it("throws when applying a knockout result outside the knockout stage", () => {
    expect(() => applyKnockoutResult(createRunState(), "opponent")).toThrow(
      "Cannot apply knockout result outside knockout stage"
    );
  });

  it("throws when a knockout match ends in a draw", () => {
    const run = { ...createRunState(), stage: "semifinal" as const };

    expect(() => applyKnockoutResult(run, "draw")).toThrow("Knockout draw requires sudden death");
  });

  it("advances from semifinal to final on a player win", () => {
    const run = { ...createRunState(), stage: "semifinal" as const };
    const next = applyKnockoutResult(run, "player");

    expect(next.stage).toBe("final");
  });

  it("advances from final to won on a player win", () => {
    const run = { ...createRunState(), stage: "final" as const };
    const next = applyKnockoutResult(run, "player");

    expect(next.stage).toBe("won");
  });

  it("ends the run after a knockout loss", () => {
    const run = { ...createRunState(), stage: "semifinal" as const };
    const next = applyKnockoutResult(run, "opponent");

    expect(next.stage).toBe("ended");
    expect(next.endedReason).toBe("lost knockout match");
  });
});
