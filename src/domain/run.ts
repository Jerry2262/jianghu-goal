import { demoOpponents } from "../content/demo";
import { createLegacyState, type LegacyState, type Reward } from "./progression";
import {
  advancementResult,
  createGroupTable,
  rankedStandings,
  recordResult,
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
  playedGroupOpponentIds: string[];
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
    playedGroupOpponentIds: [],
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

  const opponentId = homeIsPlayer ? score.awayId : score.homeId;
  const playedGroupOpponentIds = run.playedGroupOpponentIds ?? [];

  if (playedGroupOpponentIds.includes(opponentId)) {
    throw new Error("Group opponent already played");
  }

  const playerLost = homeIsPlayer
    ? score.homeGoals < score.awayGoals
    : score.awayGoals < score.homeGoals;
  const nextReputation = playerLost ? run.reputation - 1 : run.reputation;
  const next: RunState = {
    ...run,
    reputation: nextReputation,
    groupTable: recordResult(run.groupTable, score),
    groupMatchesPlayed: run.groupMatchesPlayed + 1,
    playedGroupOpponentIds: [...playedGroupOpponentIds, opponentId]
  };

  if (next.reputation <= 0) {
    return { ...next, stage: "ended", endedReason: "reputation reached zero" };
  }

  if (next.groupMatchesPlayed >= 3) {
    const result = advancementResult(next.groupTable);

    if (result.status === "playoff-required") {
      const playerOutcome = playerAdvancementWithUnresolvedCutoff(next.groupTable, result.tiedTeamIds);

      if (playerOutcome === "advanced") {
        return { ...next, stage: "semifinal" };
      }

      if (playerOutcome === "eliminated") {
        return { ...next, stage: "ended", endedReason: "failed group qualification" };
      }

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
  const result = advancementResult(run.groupTable);

  if (result.status === "playoff-required") {
    return playerAdvancementWithUnresolvedCutoff(run.groupTable, result.tiedTeamIds) === "advanced";
  }

  return result.teamIds.includes("player");
}

export function applyKnockoutResult(run: RunState, winner: Winner): RunState {
  if (run.stage !== "semifinal" && run.stage !== "final") {
    throw new Error("Cannot apply knockout result outside knockout stage");
  }

  validateKnockoutWinner(winner);

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

function playerAdvancementWithUnresolvedCutoff(
  table: GroupTable,
  tiedTeamIds: string[]
): "advanced" | "eliminated" | "playoff-required" {
  const standings = rankedStandings(table);
  const playerRankIndex = standings.findIndex((standing) => standing.teamId === "player");

  if (playerRankIndex === -1) {
    return "eliminated";
  }

  if (tiedTeamIds.includes("player")) {
    return "playoff-required";
  }

  return playerRankIndex < 2 ? "advanced" : "eliminated";
}

function validateKnockoutWinner(winner: Winner): void {
  if (winner !== "player" && winner !== "opponent" && winner !== "draw") {
    throw new Error("Invalid knockout winner");
  }
}
