import { describe, expect, it } from "vitest";
import { createRunState } from "../../src/domain/run";
import { renderApp } from "../../src/ui/render";

describe("renderApp", () => {
  it("renders tournament, reputation, board, and hand areas", () => {
    const root = document.createElement("div");

    renderApp(root, {
      run: createRunState(),
      message: "选择一张牌",
      hand: [
        { id: "calm-first-touch", name: "静心停球", type: "martial", sectId: "wudang", cost: 0, tags: ["pass"], text: "若球正受压，获得 1 点气势。" }
      ]
    });

    const pitch = root.querySelector(".pitch") ?? root.querySelector('[aria-label="战术棋盘"]');
    const cells = root.querySelectorAll(".cell");
    const cardButton = root.querySelector(".card");
    const log = root.querySelector(".log");

    expect(root.textContent).toContain("江湖球门");
    expect(root.textContent).toContain("声望：5");
    expect(root.textContent).toContain("小组赛");
    expect(root.textContent).toContain("静心停球");
    expect(root.textContent).toContain("武当");
    expect(root.textContent).toContain("0 分");
    expect(root.textContent).toContain("0 点气势");
    expect(root.textContent).toContain("目标");
    expect(root.textContent).toContain("小组赛拿积分，争取前二晋级");
    expect(root.textContent).toContain("下一步");
    expect(root.textContent).toContain("优先选择 0 费或 1 费牌");
    expect(root.textContent).toContain("B 表示球的位置");
    expect(pitch).toBeTruthy();
    expect(cells).toHaveLength(15);
    const ballCells = Array.from(cells).filter((cell) => cell.textContent === "B");
    expect(ballCells).toHaveLength(1);
    expect(cardButton).toBeInstanceOf(HTMLButtonElement);
    expect(cardButton?.getAttribute("data-card-id")).toBe("calm-first-touch");
    expect(log?.textContent).toContain("选择一张牌");
  });

  it("renders untrusted content as text", () => {
    const root = document.createElement("div");
    const maliciousId = 'calm-first-touch"><script>alert(1)</script>';
    const maliciousName = '<img src=x onerror=alert(1)>';
    const maliciousText = '<script>alert(2)</script>';
    const maliciousMessage = '<script>alert(3)</script>';

    renderApp(root, {
      run: createRunState(),
      message: maliciousMessage,
      hand: [
        {
          id: maliciousId,
          name: maliciousName,
          type: "martial",
          sectId: "wudang",
          cost: 0,
          tags: ["pass"],
          text: maliciousText
        }
      ]
    });

    const cardButton = root.querySelector(".card");

    expect(root.querySelectorAll("img, script")).toHaveLength(0);
    expect(root.textContent).toContain(maliciousName);
    expect(root.textContent).toContain(maliciousText);
    expect(root.textContent).toContain(maliciousMessage);
    expect(cardButton?.getAttribute("data-card-id")).toBe(maliciousId);
  });
});
