import { analyzeThirteen } from "./ukeire";
import { isTileId, type GameMode, type TileId } from "./tiles";

export const MIN_WAIT_TYPES = 2;
export const MAX_WAIT_TYPES = 4;

function tileCount(hand: readonly TileId[], tile: TileId): number {
  return hand.filter((t) => t === tile).length;
}

function waitTiles(ukeire: Record<string, number>): TileId[] {
  return Object.keys(ukeire).filter(isTileId);
}

/** 両面待ち（34→25、5678→58 など） */
function isRyanmenTwoWait(hand: readonly TileId[], waits: TileId[]): boolean {
  if (waits.length !== 2) return false;

  const [a, b] = [...waits].sort(
    (x, y) => Number(x[0]) - Number(y[0]) || x[1].localeCompare(y[1]),
  );
  if (a[1] !== b[1] || a[1] === "z") return false;

  const na = Number(a[0]);
  const nb = Number(b[0]);
  if (nb - na !== 3) return false;

  const suit = a[1] as "m" | "p" | "s";
  const mid1 = `${na + 1}${suit}` as TileId;
  const mid2 = `${na + 2}${suit}` as TileId;

  if (tileCount(hand, mid1) < 1 || tileCount(hand, mid2) < 1) return false;

  // 34→25: 待ち牌は手牌に無い
  if (tileCount(hand, a) === 0 && tileCount(hand, b) === 0) return true;

  // 5678→58: 長い順子の両端待ち
  if (tileCount(hand, a) >= 1 && tileCount(hand, b) >= 1) return true;
  if (nb <= 8 && tileCount(hand, `${nb}${suit}` as TileId) >= 1) {
    return tileCount(hand, mid1) >= 1 && tileCount(hand, mid2) >= 1;
  }

  return false;
}

/** シャンポン待ち（双碰・対子＋順子の2面待ちなど） */
function isShanponTwoWait(hand: readonly TileId[], waits: TileId[]): boolean {
  if (waits.length !== 2) return false;

  const [a, b] = [...waits].sort(
    (x, y) => Number(x[0]) - Number(y[0]) || x[1].localeCompare(y[1]),
  );

  // 同数牌2種の双碰（44+55→45 など）
  if (a[1] === b[1] && a[1] !== "z" && Number(b[0]) - Number(a[0]) === 1) {
    if (tileCount(hand, a) >= 1 && tileCount(hand, b) >= 1) return true;
  }

  // 対子完成待ち（11+234→14 など）
  if (tileCount(hand, a) >= 2 && tileCount(hand, b) === 0) return true;
  if (tileCount(hand, b) >= 2 && tileCount(hand, a) === 0) return true;

  // 字牌対子＋順子のシャンポン
  if (a[1] === "z" && b[1] !== "z" && tileCount(hand, a) >= 1) return true;
  if (b[1] === "z" && a[1] !== "z" && tileCount(hand, b) >= 1) return true;

  return false;
}

export function isWaitQuizHand(hand: TileId[], mode: GameMode): boolean {
  const analysis = analyzeThirteen(hand, mode);
  if (!analysis) return false;

  const { waitTypes, ukeire } = analysis;
  if (waitTypes < MIN_WAIT_TYPES || waitTypes > MAX_WAIT_TYPES) return false;

  if (waitTypes === 2) {
    const waits = waitTiles(ukeire);
    if (isRyanmenTwoWait(hand, waits) || isShanponTwoWait(hand, waits)) {
      return false;
    }
  }

  return true;
}

export function isWaitQuizRange(waitTypes: number): boolean {
  return waitTypes >= MIN_WAIT_TYPES && waitTypes <= MAX_WAIT_TYPES;
}
