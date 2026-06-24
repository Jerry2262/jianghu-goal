import type { Card } from "../domain/types";
import type { RunState } from "../domain/run";
import { rankedStandings } from "../domain/tournament";

export interface AppViewState {
  run: RunState;
  message: string;
  hand: Card[];
}

export function renderApp(root: HTMLElement, state: AppViewState): void {
  const stageLabel = state.run.stage === "group" ? "Group Stage" : state.run.stage;
  const standings = rankedStandings(state.run.groupTable);

  const shell = document.createElement("section");
  shell.className = "shell";

  const topbar = document.createElement("header");
  topbar.className = "topbar";

  const title = document.createElement("h1");
  title.textContent = "Jianghu Goal";

  const resource = document.createElement("div");
  resource.className = "resource";
  resource.textContent = `Reputation: ${state.run.reputation}`;

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
    item.textContent = `${row.teamId}: ${row.points} pts (${row.goalDifference})`;
    standingsList.append(item);
  }

  standingsPanel.append(standingsHeading, standingsList);

  const pitch = document.createElement("section");
  pitch.className = "pitch";
  pitch.setAttribute("aria-label", "Tactical board");

  for (let index = 0; index < 15; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = index === 7 ? "B" : "";
    pitch.append(cell);
  }

  const handPanel = document.createElement("aside");
  handPanel.className = "panel";

  const handHeading = document.createElement("h2");
  handHeading.textContent = "Hand";

  const hand = document.createElement("div");
  hand.className = "hand";

  for (const card of state.hand) {
    const button = document.createElement("button");
    button.className = "card";
    button.dataset.cardId = card.id;

    const name = document.createElement("strong");
    name.textContent = card.name;

    const cost = document.createElement("span");
    cost.textContent = `${card.cost} momentum`;

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
