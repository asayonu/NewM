/** 開発用: 待ち牌カタログ件数を確認 */
import { getWaitQuizCatalogSize } from "../src/lib/mahjong/waitQuizCatalog.ts";
import { analyzeThirteen } from "../src/lib/mahjong/ukeire.ts";
import { sortHand } from "../src/lib/mahjong/tiles.ts";

const h1 = sortHand([
  "1m", "1m", "2m", "2m", "3m", "3m",
  "7p", "7p", "7p", "8p",
  "5s", "5s", "5s",
]);
const h2 = sortHand([
  "1m", "1m", "2m", "2m", "3m", "3m",
  "4p", "4p", "4p", "5p", "6p",
  "5z", "5z",
]);

console.log("sanma catalog:", getWaitQuizCatalogSize("sanma"));
console.log("yonma catalog:", getWaitQuizCatalogSize("yonma"));
console.log("h1", analyzeThirteen(h1, "sanma"));
console.log("h2", analyzeThirteen(h2, "sanma"));
