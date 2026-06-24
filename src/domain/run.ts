import { demoOpponents } from "../content/demo";
import { createLegacyState, type LegacyState, type Reward } from "./progression";
import {
  advancementResult,
  createGroupTable,
  recordResult,
  topTwoAdvance,
  type GroupTable,
  type MatchScore
} from "./tournament";
import type { Winner } from "./match";

export type RunStage = "group" | "semifinal" | "final" | "won" | "ended";

export interface RunState {
  stage: RunStage;
  reputation: number;
  groupTable: GroupTable;
  groupMatchesPlayed: number;
  legacy: LegacyState;
  pendingRewards: Reward[];
  endedReason?: string;
}

export function createRunState(): RunState {
  return {
    stage: "group",
    reputation: 5,
    groupTable: createGroupTable(["player", ...demoOpponents.map((opponent) => opponent.id)]),
    groupMatchesPlayed: 0,
    legacy: createLegacyState(),
    pendingRewards: []
  };
}

export function applyGroupResult(run: RunState, score: MatchScore): RunState {
  if (run.stage !== "group") {
    throw new Error("Cannot apply group result outside group stage");
  }

  if (run.groupMatchesPlayed >= 3) {
    throw new Error("Group stage already complete");
  }

  const homeIsPlayer = score.homeId === "player";
  const awayIsPlayer = score.awayId === "player";

  if (homeIsPlayer === awayIsPlayer) {
    throw new Error("Group result must involve player");
  }

  const playerLost = homeIsPlayer
    ? score.homeGoals < score.awayGoals
    : score.awayGoals < score.homeGoals;
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

  if (next.groupMatchesPlayed >= 3) {
    const result = advancementResult(next.groupTable);

    if (result.status === "playoff-required") {
      return { ...next, stage: "ended", endedReason: "advancement playoff required" };
    }

    if (result.teamIds.includes("player")) {
      return { ...next, stage: "semifinal" };
    }

    return { ...next, stage: "ended", endedReason: "failed group qualification" };
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
  if (run.stage !== "semifinal" && run.stage !== "final") {
    throw new Error("Cannot apply knockout result outside knockout stage");
  }

  if (winner === "draw") {
    throw new Error("Knockout draw requires sudden death");
  }

  if (winner === "opponent") {
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
