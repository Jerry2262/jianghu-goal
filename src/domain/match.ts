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
  if (opponentId.trim() === "") {
    throw new Error("Invalid opponent id");
  }

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
  validateMatchMomentState(match);
  validateGoalCount(match.playerGoals);
  validateGoalCount(match.opponentGoals);
  validateMomentOutcome(resolution.outcome);

  if (match.resolvedMoments >= match.maxMoments) {
    throw new Error("No unresolved moments remaining");
  }

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
  validateMatchMomentState(match);
  validateGoalCount(match.playerGoals);
  validateGoalCount(match.opponentGoals);

  if (match.resolvedMoments < match.maxMoments) {
    throw new Error("Match still has unresolved moments");
  }

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

function validateMatchMomentState(match: Pick<MatchState, "resolvedMoments" | "maxMoments">): void {
  if (!isValidMomentCount(match.resolvedMoments) || !isValidMomentCount(match.maxMoments) || match.maxMoments === 0) {
    throw new Error("Invalid match moment state");
  }

  if (match.resolvedMoments > match.maxMoments) {
    throw new Error("Invalid match moment state");
  }
}

function validateGoalCount(goals: number): void {
  if (!Number.isFinite(goals) || !Number.isInteger(goals) || goals < 0) {
    throw new Error("Invalid goal count");
  }
}

function isValidMomentCount(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function validateMomentOutcome(outcome: MomentOutcome): void {
  if (
    outcome !== "player-goal" &&
    outcome !== "opponent-goal" &&
    outcome !== "save" &&
    outcome !== "turnover" &&
    outcome !== "fatigue"
  ) {
    throw new Error("Invalid moment outcome");
  }
}
