import { analyzeThirteen } from "../src/lib/mahjong/ukeire.ts";
import { isWaitQuizHand } from "../src/lib/mahjong/waitQuizValidation.ts";
import { buildTemplateCatalog } from "../src/lib/mahjong/waitQuizCatalog.ts";
import { sortHand } from "../src/lib/mahjong/tiles.ts";

const cases = [
  {
    name: "ryanmen 34s→25s",
    hand: ["1p", "1p", "2p", "2p", "3p", "3p", "3s", "4s", "5p", "5p", "5p", "6p", "7p"],
    mode: "sanma",
    expect: false,
  },
  {
    name: "shanpon 11+23→14",
    hand: ["1m", "1m", "2m", "3m", "5p", "5p", "5p", "6p", "6p", "7p", "7p", "8p", "8p"],
    mode: "yonma",
    expect: false,
  },
  {
    name: "258 shape 3 waits",
    hand: ["2p", "3p", "4p", "5p", "6p", "7p", "8p", "2s", "3s", "4s", "5s", "5s", "5s"],
    mode: "sanma",
    expect: true,
  },
];

let failed = 0;
for (const { name, hand, mode, expect } of cases) {
  const sorted = sortHand(hand);
  const ok = isWaitQuizHand(sorted, mode);
  const analysis = analyzeThirteen(sorted, mode);
  if (ok !== expect) {
    console.log("FAIL", name, "got", ok, "analysis", analysis);
    failed++;
  } else {
    console.log("OK", name, analysis?.waitTypes ?? "not tenpai");
  }
}

const template = buildTemplateCatalog("sanma");
const twoWait = template.filter(
  (h) => analyzeThirteen(h, "sanma")?.waitTypes === 2,
);
console.log("sanma template", template.length, "including 2-wait", twoWait.length);

if (failed > 0 || twoWait.length === 0) process.exit(1);
