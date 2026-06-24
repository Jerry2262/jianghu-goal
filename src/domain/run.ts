import { demoOpponents } from "../content/demo";
import { createGroupTable, recordResult, topTwoAdvance, type GroupTable, type MatchScore } from "./tournament";
import type { Winner } from "./match";

export type RunStage = "group" | "semifinal" | "final" | "won" | "ended";

export interface RunState {
  stage: RunStage;
  reputation: number;
  groupTable: GroupTable;
  groupMatchesPlayed: number;
  endedReason?: string;
}

export function createRunState(): RunState {
  return {
    stage: "group",
    reputation: 5,
    groupTable: createGroupTable(["player", ...demoOpponents.map((opponent) => opponent.id)]),
    groupMatchesPlayed: 0
  };
}

export function applyGroupResult(run: RunState, score: MatchScore): RunState {
  const playerLost =
    (score.homeId === "player" && score.homeGoals < score.awayGoals) ||
    (score.awayId === "player" && score.awayGoals < score.homeGoals);
  const nextReputation = playerLost ? run.reputation - 1 : run.reputation;
  const next: RunState = {
    ...run,
    reputation: nextReputation,
    groupTable: recordResult(run.groupTable, score),
    groupMatchesPlayed: run.groupMatchesPlayed + 1
  };

  if (next.reputation <= 0) {
    return { ...next, stage: "ended", endedReason: "reputation reached zero" };
  }

  if (next.groupMatchesPlayed >= 3 && !canAdvanceFromGroup(next)) {
    return { ...next, stage: "ended", endedReason: "failed group qualification" };
  }

  if (next.groupMatchesPlayed >= 3) {
    return { ...next, stage: "semifinal" };
  }

  return next;
}

export function canAdvanceFromGroup(run: RunState): boolean {
  try {
    return topTwoAdvance(run.groupTable).includes("player");
  } catch (error) {
    if (error instanceof Error && error.message === "Advancement playoff required") {
      return false;
    }

    throw error;
  }
}

export function applyKnockoutResult(run: RunState, winner: Winner): RunState {
  if (winner !== "player") {
    return { ...run, stage: "ended", endedReason: "lost knockout match" };
  }

  if (run.stage === "semifinal") {
    return { ...run, stage: "final" };
  }

  if (run.stage === "final") {
    return { ...run, stage: "won" };
  }

  return run;
}
