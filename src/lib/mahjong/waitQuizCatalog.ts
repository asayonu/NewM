import { analyzeThirteen } from "./ukeire";
import { handSignature, sortHand, tilesForMode, type GameMode, type TileId } from "./tiles";
import { isWaitQuizHand } from "./waitQuizValidation";
import {
  WAIT_QUIZ_BOOTSTRAP_SANMA,
  WAIT_QUIZ_BOOTSTRAP_YONMA,
} from "./waitQuizBootstrap";

type Suit = "m" | "p" | "s";

function tile(n: number, suit: Suit): TileId {
  return `${n}${suit}` as TileId;
}

function triple(n: number, suit: Suit): TileId[] {
  return [tile(n, suit), tile(n, suit), tile(n, suit)];
}

function pair(n: number, suit: Suit): TileId[] {
  return [tile(n, suit), tile(n, suit)];
}

/** 2345678 + 234 + 555 型（待ち2,5,8） */
function build258Shape(seqSuit: Suit, otherSuit: Suit): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    tile(2, otherSuit),
    tile(3, otherSuit),
    tile(4, otherSuit),
    ...triple(5, otherSuit),
  ];
}

/** 3456789 + 345 + 666 型（待ち3,6,9） */
function build369Shape(seqSuit: Suit, otherSuit: Suit): TileId[] {
  return [
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    tile(9, seqSuit),
    tile(3, otherSuit),
    tile(4, otherSuit),
    tile(5, otherSuit),
    ...triple(6, otherSuit),
  ];
}

/** 2345678 + 222 + 333 型 */
function build2233Shape(seqSuit: Suit, otherSuit: Suit): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    ...triple(2, otherSuit),
    ...triple(3, otherSuit),
  ];
}

/** 112233 + 7778 + 555 型（例: 689p待ち） */
function buildPairs778Triplet(
  pairSuit: Suit,
  seqSuit: Suit,
  tripSuit: Suit,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    ...triple(7, seqSuit),
    tile(8, seqSuit),
    ...triple(5, tripSuit),
  ];
}

/** 112233 + 44456 + 字牌対子 型（例: 47p白待ち） */
function buildPairs456Honor(
  pairSuit: Suit,
  seqSuit: Suit,
  honor: TileId,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    ...triple(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    honor,
    honor,
  ];
}

/** 112233 + 5678 + 555 型 */
function buildPairs5678Triplet(
  pairSuit: Suit,
  seqSuit: Suit,
  tripSuit: Suit,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    ...triple(5, tripSuit),
  ];
}

/** 234 + 5678999 + 555 型 */
function build2348999Triplet(seqSuit: Suit, otherSuit: Suit): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    tile(9, seqSuit),
    tile(9, seqSuit),
    tile(9, seqSuit),
    ...triple(5, otherSuit),
  ];
}

/** 234567 + 234 + 字牌対子 型 */
function build234567Honor(seqSuit: Suit, otherSuit: Suit, honor: TileId): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(2, otherSuit),
    tile(3, otherSuit),
    tile(4, otherSuit),
    honor,
    honor,
  ];
}

/** 2345678 + 112233 型 */
function build258PairsShape(seqSuit: Suit, pairSuit: Suit): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
  ];
}

/** 3456789 + 112233 型 */
function build369PairsShape(seqSuit: Suit, pairSuit: Suit): TileId[] {
  return [
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    tile(9, seqSuit),
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
  ];
}

/** 112233 + 7789 + 555 型 */
function buildPairs7789Triplet(
  pairSuit: Suit,
  seqSuit: Suit,
  tripSuit: Suit,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    ...triple(7, seqSuit),
    tile(8, seqSuit),
    tile(9, seqSuit),
    ...triple(5, tripSuit),
  ];
}

/** 555 + 2345678 + 字牌対子 型 */
function build258HonorTriplet(
  seqSuit: Suit,
  tripSuit: Suit,
  honor: TileId,
): TileId[] {
  return [
    tile(2, seqSuit),
    tile(3, seqSuit),
    tile(4, seqSuit),
    tile(5, seqSuit),
    tile(6, seqSuit),
    tile(7, seqSuit),
    tile(8, seqSuit),
    ...triple(5, tripSuit),
    honor,
    honor,
  ];
}

/** 112233 + 13 + 468 + 555 型（嵌張2種） */
function buildPairsDoubleKanchanTriplet(
  pairSuit: Suit,
  kanchan1Suit: Suit,
  kanchan2Suit: Suit,
  tripSuit: Suit,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    tile(1, kanchan1Suit),
    tile(3, kanchan1Suit),
    tile(4, kanchan2Suit),
    tile(6, kanchan2Suit),
    ...triple(5, tripSuit),
  ];
}

/** 112233 + 468 + 555 + 字牌単騎 型 */
function buildPairsKanchanTankiTriplet(
  pairSuit: Suit,
  kanchanSuit: Suit,
  tripSuit: Suit,
  honor: TileId,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    tile(4, kanchanSuit),
    tile(6, kanchanSuit),
    ...triple(5, tripSuit),
    honor,
  ];
}

/** 112233 + 12 + 468 + 555 型（辺張+嵌張） */
function buildPairsPenchanKanchanTriplet(
  pairSuit: Suit,
  penchanSuit: Suit,
  kanchanSuit: Suit,
  tripSuit: Suit,
): TileId[] {
  return [
    ...pair(1, pairSuit),
    ...pair(2, pairSuit),
    ...pair(3, pairSuit),
    tile(1, penchanSuit),
    tile(2, penchanSuit),
    tile(4, kanchanSuit),
    tile(6, kanchanSuit),
    ...triple(5, tripSuit),
  ];
}

function handValidForMode(hand: TileId[], mode: GameMode): boolean {
  const allowed = new Set(tilesForMode(mode));
  const counts = new Map<TileId, number>();
  for (const t of hand) {
    if (!allowed.has(t)) return false;
    const n = (counts.get(t) ?? 0) + 1;
    if (n > 4) return false;
    counts.set(t, n);
  }
  return hand.length === 13;
}

function isValidWaitQuizHand(hand: TileId[], mode: GameMode): boolean {
  if (!handValidForMode(hand, mode)) return false;
  return isWaitQuizHand(hand, mode);
}

function addHand(raw: TileId[], mode: GameMode, seen: Set<string>, catalog: TileId[][]) {
  const sorted = sortHand(raw);
  const sig = handSignature(sorted);
  if (seen.has(sig)) return;
  if (!isValidWaitQuizHand(sorted, mode)) return;
  seen.add(sig);
  catalog.push(sorted);
}

function pairSuits(mode: GameMode): Suit[] {
  return mode === "sanma" ? (["p", "s"] as const) : (["m", "p", "s"] as const);
}

function seqSuits(mode: GameMode): Suit[] {
  return mode === "sanma" ? (["p", "s"] as const) : (["m", "p", "s"] as const);
}

function honorTiles(mode: GameMode): TileId[] {
  return tilesForMode(mode).filter((t) => t[1] === "z");
}

function buildTemplateCatalog(mode: GameMode): TileId[][] {
  const seen = new Set<string>();
  const catalog: TileId[][] = [];
  const pairs = pairSuits(mode);
  const seqs = seqSuits(mode);
  const honors = honorTiles(mode);

  for (const seq of seqs) {
    for (const other of seqs) {
      if (seq === other) continue;
      addHand(build258Shape(seq, other), mode, seen, catalog);
      addHand(build369Shape(seq, other), mode, seen, catalog);
      addHand(build2233Shape(seq, other), mode, seen, catalog);
      addHand(build2348999Triplet(seq, other), mode, seen, catalog);
    }
    for (const pairSuit of pairs) {
      if (seq === pairSuit) continue;
      addHand(build258PairsShape(seq, pairSuit), mode, seen, catalog);
      addHand(build369PairsShape(seq, pairSuit), mode, seen, catalog);
    }
  }

  for (const pairSuit of pairs) {
    for (const seqSuit of seqs) {
      for (const tripSuit of seqs) {
        addHand(buildPairs778Triplet(pairSuit, seqSuit, tripSuit), mode, seen, catalog);
        addHand(buildPairs5678Triplet(pairSuit, seqSuit, tripSuit), mode, seen, catalog);
        addHand(buildPairs7789Triplet(pairSuit, seqSuit, tripSuit), mode, seen, catalog);
      }
      for (const other of seqs) {
        if (seqSuit === other) continue;
        for (const honor of honors) {
          addHand(build234567Honor(seqSuit, other, honor), mode, seen, catalog);
        }
      }
      for (const tripSuit of seqs) {
        for (const honor of honors) {
          addHand(build258HonorTriplet(seqSuit, tripSuit, honor), mode, seen, catalog);
        }
      }
    }
    for (const seqSuit of seqs) {
      for (const honor of honors) {
        addHand(buildPairs456Honor(pairSuit, seqSuit, honor), mode, seen, catalog);
      }
    }
  }

  for (const pairSuit of pairs) {
    for (const k1 of seqs) {
      for (const k2 of seqs) {
        for (const tripSuit of seqs) {
          addHand(
            buildPairsDoubleKanchanTriplet(pairSuit, k1, k2, tripSuit),
            mode,
            seen,
            catalog,
          );
        }
        for (const penchanSuit of seqs) {
          for (const tripSuit of seqs) {
            addHand(
              buildPairsPenchanKanchanTriplet(pairSuit, penchanSuit, k1, tripSuit),
              mode,
              seen,
              catalog,
            );
          }
        }
      }
    }
    for (const kanchanSuit of seqs) {
      for (const tripSuit of seqs) {
        for (const honor of honors) {
          addHand(
            buildPairsKanchanTankiTriplet(pairSuit, kanchanSuit, tripSuit, honor),
            mode,
            seen,
            catalog,
          );
        }
      }
    }
  }

  return catalog;
}

export { buildTemplateCatalog };

const catalogCache = new Map<GameMode, TileId[][]>();

function mergeCatalog(mode: GameMode, extra: readonly TileId[][]): TileId[][] {
  const seen = new Set<string>();
  const catalog: TileId[][] = [];

  for (const raw of [...buildTemplateCatalog(mode), ...extra]) {
    const sorted = sortHand([...raw]);
    const sig = handSignature(sorted);
    if (seen.has(sig)) continue;
    if (!isValidWaitQuizHand(sorted, mode)) continue;
    seen.add(sig);
    catalog.push(sorted);
  }

  return catalog;
}

export function getWaitQuizCatalog(mode: GameMode): TileId[][] {
  const cached = catalogCache.get(mode);
  if (cached) return cached;

  const extra = mode === "sanma" ? WAIT_QUIZ_BOOTSTRAP_SANMA : WAIT_QUIZ_BOOTSTRAP_YONMA;
  const catalog = mergeCatalog(mode, extra);
  catalogCache.set(mode, catalog);
  return catalog;
}

export class WaitQuizExhaustedError extends Error {
  constructor() {
    super("WAIT_QUIZ_EXHAUSTED");
    this.name = "WaitQuizExhaustedError";
  }
}

export function pickWaitQuizHand(
  mode: GameMode,
  exclude: ReadonlySet<string>,
): { hand: TileId[]; analysis: NonNullable<ReturnType<typeof analyzeThirteen>> } {
  const catalog = getWaitQuizCatalog(mode);
  const available = catalog.filter((hand) => !exclude.has(handSignature(hand)));

  if (available.length === 0) {
    throw new WaitQuizExhaustedError();
  }

  const hand = available[Math.floor(Math.random() * available.length)];
  const analysis = analyzeThirteen(hand, mode);
  if (!analysis) {
    throw new Error("テンプレート手牌の解析に失敗しました");
  }

  return { hand, analysis };
}

export function getWaitQuizCatalogSize(mode: GameMode): number {
  return getWaitQuizCatalog(mode).length;
}
