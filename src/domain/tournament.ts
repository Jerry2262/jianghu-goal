export interface MatchScore {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
}

export interface Standing {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type GroupTable = Record<string, Standing>;

export interface AdvancementResult {
  status: "advanced" | "playoff-required";
  teamIds: string[];
  tiedTeamIds: string[];
}

export function createGroupTable(teamIds: string[]): GroupTable {
  const seenTeamIds = new Set<string>();

  for (const teamId of teamIds) {
    if (teamId.trim() === "") {
      throw new Error("Invalid team id");
    }

    if (seenTeamIds.has(teamId)) {
      throw new Error(`Duplicate team id: ${teamId}`);
    }

    seenTeamIds.add(teamId);
  }

  return Object.fromEntries(
    teamIds.map((teamId) => [
      teamId,
      {
        teamId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    ])
  );
}

export function recordResult(table: GroupTable, score: MatchScore): GroupTable {
  if (score.homeId === score.awayId) {
    throw new Error("A team cannot play itself");
  }

  const homeRow = table[score.homeId];
  if (homeRow === undefined) {
    throw new Error(`Unknown team id: ${score.homeId}`);
  }

  const awayRow = table[score.awayId];
  if (awayRow === undefined) {
    throw new Error(`Unknown team id: ${score.awayId}`);
  }

  validateGoalCount(score.homeGoals);
  validateGoalCount(score.awayGoals);

  const next = structuredClone(table);
  applyTeamResult(next[score.homeId], score.homeGoals, score.awayGoals);
  applyTeamResult(next[score.awayId], score.awayGoals, score.homeGoals);
  return next;
}

export function rankedStandings(table: GroupTable): Standing[] {
  return Object.values(table).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });
}

export function advancementResult(table: GroupTable): AdvancementResult {
  const standings = rankedStandings(table);
  if (standings.length < 2) {
    return { status: "advanced", teamIds: standings.map((standing) => standing.teamId), tiedTeamIds: [] };
  }

  const second = standings[1];
  const third = standings[2];

  if (second !== undefined && third !== undefined && hasSameNumericRank(second, third)) {
    const tiedTeamIds = standings.filter((standing) => hasSameNumericRank(standing, second)).map((standing) => standing.teamId);
    return { status: "playoff-required", teamIds: [], tiedTeamIds };
  }

  return {
    status: "advanced",
    teamIds: standings.slice(0, 2).map((standing) => standing.teamId),
    tiedTeamIds: []
  };
}

export function topTwoAdvance(table: GroupTable): string[] {
  const result = advancementResult(table);

  if (result.status === "playoff-required") {
    throw new Error("Advancement playoff required");
  }

  return result.teamIds;
}

function applyTeamResult(row: Standing, goalsFor: number, goalsAgainst: number): void {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}

function validateGoalCount(goals: number): void {
  if (!Number.isFinite(goals) || !Number.isInteger(goals) || goals < 0) {
    throw new Error("Invalid goal count");
  }
}

function hasSameNumericRank(left: Standing, right: Standing): boolean {
  return (
    left.points === right.points &&
    left.goalDifference === right.goalDifference &&
    left.goalsFor === right.goalsFor
  );
}
