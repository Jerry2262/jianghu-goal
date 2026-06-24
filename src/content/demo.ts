import type { Card, Disciple, OpponentSect, Sect } from "../domain/types";

export const demoSects: Sect[] = [
  { id: "wudang", name: "Wudang", playable: true, style: "Controlled passing and pressure release" },
  { id: "shaolin", name: "Shaolin", playable: false, style: "Defensive duels and box survival" },
  { id: "beggar", name: "Beggar Sect", playable: false, style: "Scrambles, steals, and chaos chains" },
  { id: "iron-palm", name: "Iron Palm Hall", playable: false, style: "Direct pressure and hard shots" }
];

export const demoOpponents: OpponentSect[] = [
  { id: "shaolin", name: "Shaolin", rating: 2, style: "Blocks shots and wins contact" },
  { id: "beggar", name: "Beggar Sect", rating: 2, style: "Creates loose balls and steals momentum" },
  { id: "iron-palm", name: "Iron Palm Hall", rating: 3, style: "Pressures the box with power shots" }
];

export const demoDisciples: Disciple[] = [
  { id: "lin-qing", name: "Lin Qing", sectId: "wudang", position: "midfielder", technique: 3, movement: 2, spirit: 2, trait: "Gains momentum after two passes in one moment", stamina: 5, maxStamina: 5 },
  { id: "zhou-yun", name: "Zhou Yun", sectId: "wudang", position: "forward", technique: 3, movement: 3, spirit: 2, trait: "Shots cost 1 less momentum in stoppage time", stamina: 4, maxStamina: 4 },
  { id: "han-shi", name: "Han Shi", sectId: "wudang", position: "defender", technique: 2, movement: 2, spirit: 3, trait: "Blocks generate 1 momentum", stamina: 5, maxStamina: 5 },
  { id: "mo-ren", name: "Mo Ren", sectId: "wudang", position: "goalkeeper", technique: 2, movement: 1, spirit: 4, trait: "First save each match restores 1 reputation on a clean sheet", stamina: 4, maxStamina: 4 }
];

export const demoCards: Card[] = [
  { id: "tai-chi-deflection", name: "Tai Chi Deflection", type: "martial", sectId: "wudang", cost: 1, tags: ["defense", "movement"], text: "Cancel one pressure marker and move the ball one lane." },
  { id: "cloud-step-pass", name: "Cloud Step Pass", type: "martial", sectId: "wudang", cost: 1, tags: ["pass", "movement"], text: "Pass through a marked lane if the receiver has movement 3+." },
  { id: "soft-overcomes-hard", name: "Soft Overcomes Hard", type: "martial", sectId: "wudang", cost: 2, tags: ["defense", "spirit"], text: "Convert opponent pressure into 2 momentum." },
  { id: "crane-wing-shift", name: "Crane Wing Shift", type: "formation", sectId: "wudang", cost: 1, tags: ["movement"], text: "Move two allied disciples one lane." },
  { id: "threaded-through-ball", name: "Threaded Through Ball", type: "martial", sectId: "wudang", cost: 2, tags: ["pass"], text: "Move the ball from midfield to attack if a passing lane is open." },
  { id: "calm-first-touch", name: "Calm First Touch", type: "martial", sectId: "wudang", cost: 0, tags: ["pass", "spirit"], text: "Gain 1 momentum if the ball is under pressure." },
  { id: "lin-qing-orbit-pass", name: "Lin Qing: Orbit Pass", type: "disciple", ownerDiscipleId: "lin-qing", cost: 1, tags: ["pass"], text: "Complete a safe pass and gain 1 momentum if this is the second pass this moment." },
  { id: "zhou-yun-cloud-shot", name: "Zhou Yun: Cloud Shot", type: "disciple", ownerDiscipleId: "zhou-yun", cost: 2, tags: ["shot"], text: "Create a shot from attack or box. Technique 3+ adds +1 shot power." },
  { id: "han-shi-sleeve-block", name: "Han Shi: Sleeve Block", type: "disciple", ownerDiscipleId: "han-shi", cost: 1, tags: ["defense"], text: "Block a shot lane. Spirit 3+ grants 1 momentum." },
  { id: "mo-ren-still-water-save", name: "Mo Ren: Still Water Save", type: "disciple", ownerDiscipleId: "mo-ren", cost: 2, tags: ["defense", "spirit"], text: "Prevent one goal unless the opponent has two pressure markers in the box." },
  { id: "marked-lane", name: "Marked Lane", type: "status", cost: 0, tags: ["pressure"], text: "This lane counts as pressured until cleared.", exhausts: true },
  { id: "muddy-pitch", name: "Muddy Pitch", type: "status", cost: 0, tags: ["chaos"], text: "Movement cards cost 1 extra this moment.", exhausts: true }
];
