import { describe, expect, it } from "vitest";
import {
  advancementResult,
  createGroupTable,
  recordResult,
  rankedStandings,
  topTwoAdvance
} from "../../src/domain/tournament";

describe("tournament", () => {
  it("rejects invalid or duplicate team ids when creating a group table", () => {
    expect(() => createGroupTable(["player", " ", "shaolin"])).toThrow("Invalid team id");
    expect(() => createGroupTable(["player", "shaolin", "shaolin"])).toThrow("Duplicate team id: shaolin");
  });

  it("awards 3 points for a win and 1 for a draw", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 1 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 0, awayGoals: 0 });

    expect(table.player.points).toBe(3);
    expect(table.shaolin.points).toBe(0);
    expect(table.beggar.points).toBe(1);
    expect(table["iron-palm"].points).toBe(1);
  });

  it("ranks by points, goal difference, then goals scored", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 3, awayGoals: 1 });
    table = recordResult(table, { homeId: "player", awayId: "beggar", homeGoals: 2, awayGoals: 2 });
    table = recordResult(table, { homeId: "shaolin", awayId: "iron-palm", homeGoals: 1, awayGoals: 1 });

    expect(rankedStandings(table).map((row) => row.teamId)).toEqual(["beggar", "player", "shaolin", "iron-palm"]);
  });

  it("returns top two advancing teams", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });

    expect(topTwoAdvance(table)).toEqual(["player", "beggar"]);
  });

  it("rejects invalid match results and keeps the original table unchanged", () => {
    const table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);

    expect(() =>
      recordResult(table, { homeId: "player", awayId: "player", homeGoals: 1, awayGoals: 0 })
    ).toThrow("A team cannot play itself");
    expect(() => recordResult(table, { homeId: "player", awayId: "unknown", homeGoals: 1, awayGoals: 0 })).toThrow(
      "Unknown team id: unknown"
    );
    expect(() => recordResult(table, { homeId: "unknown", awayId: "player", homeGoals: 1, awayGoals: 0 })).toThrow(
      "Unknown team id: unknown"
    );
    expect(() => recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: -1, awayGoals: 0 })).toThrow(
      "Invalid goal count"
    );
    expect(() => recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 1.5, awayGoals: 0 })).toThrow(
      "Invalid goal count"
    );
    expect(() => recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: Number.NaN, awayGoals: 0 })).toThrow(
      "Invalid goal count"
    );

    const next = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 2, awayGoals: 1 });
    expect(table.player.points).toBe(0);
    expect(table.shaolin.points).toBe(0);
    expect(next.player.points).toBe(3);
    expect(next.shaolin.points).toBe(0);
  });

  it("requires a playoff when second and third are tied at the advancement cutoff", () => {
    let table = createGroupTable(["player", "shaolin", "beggar", "iron-palm"]);
    table = recordResult(table, { homeId: "player", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "player", awayId: "shaolin", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "player", awayId: "beggar", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "shaolin", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "beggar", awayId: "iron-palm", homeGoals: 1, awayGoals: 0 });
    table = recordResult(table, { homeId: "shaolin", awayId: "beggar", homeGoals: 0, awayGoals: 0 });

    expect(advancementResult(table)).toEqual({
      status: "playoff-required",
      teamIds: [],
      tiedTeamIds: ["beggar", "shaolin"]
    });
    expect(() => topTwoAdvance(table)).toThrow("Advancement playoff required");
  });
});
