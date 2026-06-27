import type { Card } from "../domain/types";
import type { RunState } from "../domain/run";
import { rankedStandings } from "../domain/tournament";

export interface AppViewState {
  run: RunState;
  message: string;
  hand: Card[];
}

const STAGE_LABELS: Record<RunState["stage"], string> = {
  group: "小组赛",
  semifinal: "半决赛",
  final: "决赛",
  won: "已夺冠",
  ended: "已结束"
};

const TEAM_LABELS: Record<string, string> = {
  player: "武当",
  shaolin: "少林",
  beggar: "丐帮",
  "iron-palm": "铁掌堂"
};

function teamLabel(teamId: string): string {
  return TEAM_LABELS[teamId] ?? teamId;
}

export function renderApp(root: HTMLElement, state: AppViewState): void {
  const stageLabel = STAGE_LABELS[state.run.stage];
  const standings = rankedStandings(state.run.groupTable);

  const shell = document.createElement("section");
  shell.className = "shell";

  const topbar = document.createElement("header");
  topbar.className = "topbar";

  const title = document.createElement("h1");
  title.textContent = "江湖球门";

  const resource = document.createElement("div");
  resource.className = "resource";
  resource.textContent = `声望：${state.run.reputation}`;

  topbar.append(title, resource);

  const layout = document.createElement("section");
  layout.className = "layout";

  const standingsPanel = document.createElement("aside");
  standingsPanel.className = "panel";

  const standingsHeading = document.createElement("h2");
  standingsHeading.textContent = stageLabel;

  const standingsList = document.createElement("ol");
  standingsList.className = "standings";

  for (const row of standings) {
    const item = document.createElement("li");
    item.textContent = `${teamLabel(row.teamId)}：${row.points} 分（净胜 ${row.goalDifference}）`;
    standingsList.append(item);
  }

  standingsPanel.append(standingsHeading, standingsList);

  const pitch = document.createElement("section");
  pitch.className = "pitch";
  pitch.setAttribute("aria-label", "战术棋盘");

  for (let index = 0; index < 15; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = index === 7 ? "B" : "";
    pitch.append(cell);
  }

  const handPanel = document.createElement("aside");
  handPanel.className = "panel";

  const handHeading = document.createElement("h2");
  handHeading.textContent = "手牌";

  const hand = document.createElement("div");
  hand.className = "hand";

  for (const card of state.hand) {
    const button = document.createElement("button");
    button.className = "card";
    button.dataset.cardId = card.id;

    const name = document.createElement("strong");
    name.textContent = card.name;

    const cost = document.createElement("span");
    cost.textContent = `${card.cost} 点气势`;

    const text = document.createElement("p");
    text.textContent = card.text;

    button.append(name, cost, text);
    hand.append(button);
  }

  handPanel.append(handHeading, hand);

  const log = document.createElement("footer");
  log.className = "log";
  log.textContent = state.message;

  layout.append(standingsPanel, pitch, handPanel);
  shell.append(topbar, layout, log);
  root.replaceChildren(shell);
}
