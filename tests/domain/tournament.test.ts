import { describe, expect, it } from "vitest";
import { createGroupTable, recordResult, rankedStandings, topTwoAdvance } from "../../src/domain/tournament";

describe("tournament", () => {
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
});
