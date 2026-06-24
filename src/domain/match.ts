export type MatchStage = "group" | "knockout";
export type MomentOutcome = "player-goal" | "opponent-goal" | "save" | "turnover" | "fatigue";
export type Winner = "player" | "opponent" | "draw";

export interface MatchState {
  stage: MatchStage;
  opponentId: string;
  playerGoals: number;
  opponentGoals: number;
  resolvedMoments: number;
  maxMoments: number;
}

export interface MomentResolution {
  outcome: MomentOutcome;
}

export interface MatchResult {
  winner: Winner;
  playerGoals: number;
  opponentGoals: number;
  needsSuddenDeath: boolean;
}

export function createMatchState(stage: MatchStage, opponentId: string): MatchState {
  return {
    stage,
    opponentId,
    playerGoals: 0,
    opponentGoals: 0,
    resolvedMoments: 0,
    maxMoments: 4
  };
}

export function resolveMoment(match: MatchState, resolution: MomentResolution): MatchState {
  const next = { ...match, resolvedMoments: match.resolvedMoments + 1 };

  if (resolution.outcome === "player-goal") {
    next.playerGoals += 1;
  }

  if (resolution.outcome === "opponent-goal") {
    next.opponentGoals += 1;
  }

  return next;
}

export function finishMatch(match: MatchState): MatchResult {
  const winner = getWinner(match.playerGoals, match.opponentGoals);

  return {
    winner,
    playerGoals: match.playerGoals,
    opponentGoals: match.opponentGoals,
    needsSuddenDeath: winner === "draw" && match.stage === "knockout"
  };
}

function getWinner(playerGoals: number, opponentGoals: number): Winner {
  if (playerGoals > opponentGoals) return "player";
  if (opponentGoals > playerGoals) return "opponent";
  return "draw";
}
