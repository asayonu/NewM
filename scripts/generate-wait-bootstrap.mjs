/**
 * 待ち牌クイズの追加問題をランダム探索で生成し、
 * waitQuizBootstrap.ts に書き出す（開発時に手動実行）。
 */
import { writeFileSync } from "node:fs";
import { RuleSet, tilesToHand } from "mahjong-tile-efficiency";
import { buildTemplateCatalog } from "../src/lib/mahjong/waitQuizCatalog.ts";
import { isWaitQuizHand } from "../src/lib/mahjong/waitQuizValidation.ts";

const ALL_TILES = [
  "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
  "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
  "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
  "1z", "2z", "3z", "4z", "5z", "6z", "7z",
];

const SANMA = ALL_TILES.filter(
  (t) => t[1] !== "m" || t[0] === "1" || t[0] === "9",
);

function sortHand(tiles) {
  return [...tiles].sort((a, b) => ALL_TILES.indexOf(a) - ALL_TILES.indexOf(b));
}

function randomHand(pool, size = 14) {
  const counts = new Map();
  const hand = [];
  while (hand.length < size) {
    const tile = pool[Math.floor(Math.random() * pool.length)];
    const n = counts.get(tile) ?? 0;
    if (n >= 4) continue;
    counts.set(tile, n + 1);
    hand.push(tile);
  }
  return sortHand(hand);
}

function bootstrap(mode, attempts, existing = new Map()) {
  const pool = mode === "sanma" ? SANMA : ALL_TILES;
  const rule = new RuleSet("Riichi");
  const found = new Map(existing);

  for (let n = 0; n < attempts; n++) {
    const fourteen = randomHand(pool, 14);

    for (const [discard] of Object.entries(
      rule.calUkeire(tilesToHand(fourteen)).normalDiscard ?? {},
    )) {
      const rem = [...fourteen];
      rem.splice(rem.indexOf(discard), 1);
      const sorted = sortHand(rem);
      const sig = sorted.join(",");
      if (found.has(sig)) continue;
      if (!isWaitQuizHand(sorted, mode)) continue;
      found.set(sig, sorted);
    }

    if (rule.calShanten(tilesToHand(fourteen)) === 1) {
      for (let i = 0; i < fourteen.length; i++) {
        const hand = sortHand(fourteen.filter((_, j) => j !== i));
        const sig = hand.join(",");
        if (found.has(sig)) continue;
        if (!isWaitQuizHand(hand, mode)) continue;
        found.set(sig, hand);
      }
    }
  }

  return [...found.values()];
}

const templateSanma = buildTemplateCatalog("sanma");
const templateYonma = buildTemplateCatalog("yonma");

const existingSanma = new Map(templateSanma.map((h) => [h.join(","), h]));
const existingYonma = new Map(templateYonma.map((h) => [h.join(","), h]));

console.log("Template sanma:", templateSanma.length);
console.log("Template yonma:", templateYonma.length);
console.log("Bootstrapping sanma (200000 attempts)...");
const sanmaExtra = bootstrap("sanma", 200000, existingSanma);
console.log("Bootstrapping yonma (200000 attempts)...");
const yonmaExtra = bootstrap("yonma", 200000, existingYonma);

const sanmaOnlyExtra = sanmaExtra.filter(
  (h) => !existingSanma.has(h.join(",")),
);
const yonmaOnlyExtra = yonmaExtra.filter(
  (h) => !existingYonma.has(h.join(",")),
);

console.log(
  "Extra sanma:",
  sanmaOnlyExtra.length,
  "total merged:",
  templateSanma.length + sanmaOnlyExtra.length,
);
console.log(
  "Extra yonma:",
  yonmaOnlyExtra.length,
  "total merged:",
  templateYonma.length + yonmaOnlyExtra.length,
);

const out = `/** 自動生成: npx tsx scripts/generate-wait-bootstrap.mjs */
import type { TileId } from "./tiles";

export const WAIT_QUIZ_BOOTSTRAP_SANMA: TileId[][] = ${JSON.stringify(sanmaOnlyExtra, null, 2)};

export const WAIT_QUIZ_BOOTSTRAP_YONMA: TileId[][] = ${JSON.stringify(yonmaOnlyExtra, null, 2)};
`;

writeFileSync("src/lib/mahjong/waitQuizBootstrap.ts", out);
console.log("Wrote src/lib/mahjong/waitQuizBootstrap.ts");
