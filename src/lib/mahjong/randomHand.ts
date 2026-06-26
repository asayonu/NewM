import { analyzeFourteen, type HandAnalysis } from "./ukeire";
import { sortHand, tilesForQuiz, type GameMode, type TileId } from "./tiles";

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

export function generateQuizHand(mode: GameMode): {
  hand: TileId[];
  analysis: HandAnalysis;
} {
  const pool = tilesForQuiz(mode);

  for (let i = 0; i < 80; i++) {
    const hand = randomHand(pool);
    const analysis = analyzeFourteen(hand, mode, "quiz");
    if (analysis.best) {
      return { hand, analysis };
    }
  }

  const hand = randomHand(pool);
  return { hand, analysis: analyzeFourteen(hand, mode, "quiz") };
}
