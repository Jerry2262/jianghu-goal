import type { Card, Disciple, OpponentSect, Sect } from "../domain/types";

export const demoSects: Sect[] = [
  { id: "wudang", name: "武当", playable: true, style: "控传、卸力与化解压迫" },
  { id: "shaolin", name: "少林", playable: false, style: "防守对抗与禁区硬守" },
  { id: "beggar", name: "丐帮", playable: false, style: "乱战、抢断与连环变招" },
  { id: "iron-palm", name: "铁掌堂", playable: false, style: "直压禁区与刚猛射门" }
];

export const demoOpponents: OpponentSect[] = [
  { id: "shaolin", name: "少林", rating: 2, style: "封堵射门，擅长身体对抗" },
  { id: "beggar", name: "丐帮", rating: 2, style: "制造乱球，偷走气势" },
  { id: "iron-palm", name: "铁掌堂", rating: 3, style: "以重炮持续压迫禁区" }
];

export const demoDisciples: Disciple[] = [
  { id: "lin-qing", name: "林青", sectId: "wudang", position: "midfielder", technique: 3, movement: 2, spirit: 2, trait: "同一回合完成两次传球后获得气势", stamina: 5, maxStamina: 5 },
  { id: "zhou-yun", name: "周云", sectId: "wudang", position: "forward", technique: 3, movement: 3, spirit: 2, trait: "补时阶段射门少花费一点气势", stamina: 4, maxStamina: 4 },
  { id: "han-shi", name: "韩石", sectId: "wudang", position: "defender", technique: 2, movement: 2, spirit: 3, trait: "完成封堵时获得一点气势", stamina: 5, maxStamina: 5 },
  { id: "mo-ren", name: "莫忍", sectId: "wudang", position: "goalkeeper", technique: 2, movement: 1, spirit: 4, trait: "每场首次扑救且零封时恢复一点声望", stamina: 4, maxStamina: 4 }
];

export const demoCards: Card[] = [
  { id: "tai-chi-deflection", name: "太极卸力", type: "martial", sectId: "wudang", cost: 1, tags: ["defense", "movement"], text: "清除一个压迫标记，并让球横移一线。" },
  { id: "cloud-step-pass", name: "云步传球", type: "martial", sectId: "wudang", cost: 1, tags: ["pass", "movement"], text: "若接球队员身法达到三点，可穿过被盯防的线路。" },
  { id: "soft-overcomes-hard", name: "以柔克刚", type: "martial", sectId: "wudang", cost: 2, tags: ["defense", "spirit"], text: "将对手压迫化为两点气势。" },
  { id: "crane-wing-shift", name: "鹤翼换位", type: "formation", sectId: "wudang", cost: 1, tags: ["movement"], text: "移动两名己方弟子，各横移一线。" },
  { id: "threaded-through-ball", name: "穿针直塞", type: "martial", sectId: "wudang", cost: 2, tags: ["pass"], text: "若传球线路打开，将球从中场送入进攻区。" },
  { id: "calm-first-touch", name: "静心停球", type: "martial", sectId: "wudang", cost: 0, tags: ["pass", "spirit"], text: "若球正受压，获得一点气势。" },
  { id: "lin-qing-orbit-pass", name: "林青：环转传球", type: "disciple", ownerDiscipleId: "lin-qing", cost: 1, tags: ["pass"], text: "完成一次稳妥传球；若这是本回合第二次传球，获得一点气势。" },
  { id: "zhou-yun-cloud-shot", name: "周云：穿云射门", type: "disciple", ownerDiscipleId: "zhou-yun", cost: 2, tags: ["shot"], text: "在进攻区或禁区制造射门；若技巧达到三点，射门威力加一。" },
  { id: "han-shi-sleeve-block", name: "韩石：拂袖封堵", type: "disciple", ownerDiscipleId: "han-shi", cost: 1, tags: ["defense"], text: "封住一条射门线路；若心气达到三点，获得一点气势。" },
  { id: "mo-ren-still-water-save", name: "莫忍：止水扑救", type: "disciple", ownerDiscipleId: "mo-ren", cost: 2, tags: ["defense", "spirit"], text: "阻止一个进球，除非对手在禁区已有两个压迫标记。" },
  { id: "marked-lane", name: "被盯防的线路", type: "status", cost: 0, tags: ["pressure"], text: "这条线路在被清除前视为受压。", exhausts: true },
  { id: "muddy-pitch", name: "泥泞球场", type: "status", cost: 0, tags: ["chaos"], text: "本回合身法牌额外花费一点气势。", exhausts: true }
];
