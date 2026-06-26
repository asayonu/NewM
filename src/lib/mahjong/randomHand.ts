import {
  analyzeFourteen,
  type HandAnalysis,
  type TenpaiAnalysis,
} from "./ukeire";
import {
  handSignature,
  sortHand,
  tilesForQuiz,
  type GameMode,
  type TileId,
} from "./tiles";
import {
  pickWaitQuizHand,
  WaitQuizExhaustedError,
} from "./waitQuizCatalog";

export { handSignature, WaitQuizExhaustedError };

function isExcluded(hand: TileId[], exclude: ReadonlySet<string>): boolean {
  return exclude.has(handSignature(hand));
}

export function randomHand(
  pool: readonly TileId[],
  size = 14,
): TileId[] {
  const counts = new Map<TileId, number>();
  const hand: TileId[] = [];

  while (hand.length < size) {
    const tile = pool[Math.floor(Math.random() * pool.length)];
    const n = counts.get(tile) ?? 0;
    if (n >= 4) continue;
    counts.set(tile, n + 1);
    hand.push(tile);
  }

  return sortHand(hand);
}

export function generateQuizHand(
  mode: GameMode,
  exclude: ReadonlySet<string> = new Set(),
): {
  hand: TileId[];
  analysis: HandAnalysis;
} {
  const pool = tilesForQuiz(mode);

  for (let i = 0; i < 300; i++) {
    const hand = randomHand(pool);
    if (isExcluded(hand, exclude)) continue;
    const analysis = analyzeFourteen(hand, mode, "quiz");
    if (analysis.best) {
      return { hand, analysis };
    }
  }

  throw new Error("QUIZ_EXHAUSTED");
}

/** テンパイ13枚＋待ち2〜4種類（同一手牌は exclude で除外） */
export function generateWaitQuizHand(
  mode: GameMode,
  exclude: ReadonlySet<string> = new Set(),
): {
  hand: TileId[];
  analysis: TenpaiAnalysis;
} {
  return pickWaitQuizHand(mode, exclude);
}
