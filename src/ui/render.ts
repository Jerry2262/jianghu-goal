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

  root.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <h1>Jianghu Goal</h1>
        <div class="resource">Reputation: ${state.run.reputation}</div>
      </header>
      <section class="layout">
        <aside class="panel">
          <h2>${stageLabel}</h2>
          <ol class="standings">
            ${standings
              .map((row) => `<li>${row.teamId}: ${row.points} pts (${row.goalDifference})</li>`)
              .join("")}
          </ol>
        </aside>
        <section class="pitch" aria-label="Tactical board">
          ${Array.from({ length: 15 }, (_, index) => `<div class="cell">${index === 7 ? "B" : ""}</div>`).join("")}
        </section>
        <aside class="panel">
          <h2>Hand</h2>
          <div class="hand">
            ${state.hand
              .map(
                (card) =>
                  `<button class="card" data-card-id="${card.id}"><strong>${card.name}</strong><span>${card.cost} momentum</span><p>${card.text}</p></button>`
              )
              .join("")}
          </div>
        </aside>
      </section>
      <footer class="log">${state.message}</footer>
    </section>
  `;
}
