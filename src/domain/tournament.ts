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

export function createGroupTable(teamIds: string[]): GroupTable {
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

export function topTwoAdvance(table: GroupTable): string[] {
  return rankedStandings(table)
    .slice(0, 2)
    .map((standing) => standing.teamId);
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
