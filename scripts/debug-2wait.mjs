import { analyzeThirteen } from "../src/lib/mahjong/ukeire.ts";
import { isWaitQuizHand } from "../src/lib/mahjong/waitQuizValidation.ts";
import { buildTemplateCatalog } from "../src/lib/mahjong/waitQuizCatalog.ts";
import { sortHand } from "../src/lib/mahjong/tiles.ts";

const ryanmen = sortHand([
  "1p", "1p", "2p", "2p", "3p", "3p", "3s", "4s", "5p", "5p", "5p", "6p", "7p",
]);
console.log("ryanmen", analyzeThirteen(ryanmen, "sanma"), isWaitQuizHand(ryanmen, "sanma"));

const shanpon = sortHand([
  "1m", "1m", "2m", "3m", "5p", "5p", "5p", "6p", "6p", "7p", "7p", "8p", "8p",
]);
console.log("shanpon", analyzeThirteen(shanpon, "yonma"), isWaitQuizHand(shanpon, "yonma"));

const cat = buildTemplateCatalog("sanma");
for (const h of cat) {
  const a = analyzeThirteen(h, "sanma");
  if (a?.waitTypes === 2) {
    console.log("2wait", h.join(""), a.ukeire, isWaitQuizHand(h, "sanma"));
  }
}
