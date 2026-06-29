import { cal, RuleSet, tilesToHand } from "mahjong-tile-efficiency";
import {
  ALL_TILES,
  isTileId,
  tileLabel,
  tilesForContext,
  type GameMode,
  type TileContext,
  type TileId,
} from "./tiles";

type UkeireMap = Record<string, number>;

export type DiscardOption = {
  discard: TileId;
  totalUkeire: number;
  shantenAfterDiscard: number;
  ukeire: UkeireMap;
};

export type HandAnalysis = {
  shanten: number;
  /** 向聴を戻さない切り牌のみ */
  options: DiscardOption[];
  /** 受入最大の切り牌（同率なら複数） */
  bestOptions: DiscardOption[];
  /** bestOptions[0] のエイリアス */
  best: DiscardOption | null;
};

export type TenpaiAnalysis = {
  shanten: number;
  ukeire: UkeireMap;
  totalUkeire: number;
  /** 待ち牌の種類数 */
  waitTypes: number;
};

export type UkeireEntry = {
  tile: TileId;
  count: number;
};

function sumUkeire(map: UkeireMap): number {
  return Object.values(map).reduce((a, b) => a + b, 0);
}

function filterUkeire(map: UkeireMap, allowed: ReadonlySet<TileId>): UkeireMap {
  const filtered: UkeireMap = {};
  for (const [tile, count] of Object.entries(map)) {
    if (isTileId(tile) && allowed.has(tile)) {
      filtered[tile] = count;
    }
  }
  return filtered;
}

function shantenAfterDiscard(
  tiles: TileId[],
  discard: TileId,
  rule: RuleSet,
): number {
  const remaining = [...tiles];
  const idx = remaining.indexOf(discard);
  if (idx === -1) return 99;
  remaining.splice(idx, 1);
  return rule.calShanten(tilesToHand(remaining));
}

function chiitoitsuShantenAfterDiscard(tiles: TileId[], discard: TileId): number {
  const remaining = [...tiles];
  const idx = remaining.indexOf(discard);
  if (idx === -1) return 99;
  remaining.splice(idx, 1);
  return cal.calShantenChiitoi(tilesToHand(remaining));
}

function calChiitoitsuUkeireForThirteen(
  tiles: TileId[],
  allowed: ReadonlySet<TileId>,
): { ukeire: UkeireMap; totalUkeire: number; shanten: number } {
  const hand = tilesToHand(tiles);
  const shanten = cal.calShantenChiitoi(hand);
  const counts = new Map<TileId, number>();
  for (const tile of tiles) {
    counts.set(tile, (counts.get(tile) ?? 0) + 1);
  }

  const ukeire: UkeireMap = {};
  let totalUkeire = 0;

  for (const tile of allowed) {
    const n = counts.get(tile) ?? 0;
    if (n >= 4) continue;
    const withTile = [...tiles, tile];
    if (cal.calShantenChiitoi(tilesToHand(withTile)) < shanten) {
      const remaining = 4 - n;
      ukeire[tile] = remaining;
      totalUkeire += remaining;
    }
  }

  return { ukeire, totalUkeire, shanten };
}

function buildChiitoitsuDiscardOptions(
  tiles: TileId[],
  allowed: ReadonlySet<TileId>,
  normalDiscard: Record<string, UkeireMap>,
): DiscardOption[] {
  const options: DiscardOption[] = [];

  for (const discard of Object.keys(normalDiscard)) {
    if (!isTileId(discard)) continue;

    const chiitoiAfter = chiitoitsuShantenAfterDiscard(tiles, discard);
    if (chiitoiAfter >= 2) continue;

    const remaining = [...tiles];
    const idx = remaining.indexOf(discard);
    if (idx === -1) continue;
    remaining.splice(idx, 1);

    const { ukeire, totalUkeire, shanten } = calChiitoitsuUkeireForThirteen(
      remaining,
      allowed,
    );

    options.push({
      discard,
      totalUkeire,
      shantenAfterDiscard: shanten,
      ukeire,
    });
  }

  options.sort(sortOptions);
  return options;
}

function sortOptions(a: DiscardOption, b: DiscardOption): number {
  if (b.totalUkeire !== a.totalUkeire) return b.totalUkeire - a.totalUkeire;
  if (a.shantenAfterDiscard !== b.shantenAfterDiscard) {
    return a.shantenAfterDiscard - b.shantenAfterDiscard;
  }
  return a.discard.localeCompare(b.discard);
}

/** 字牌=0, 么九牌=1, 中張牌=2 */
function discardCategory(tile: TileId): 0 | 1 | 2 {
  const suit = tile[1];
  const num = Number(tile[0]);
  if (suit === "z") return 0;
  if (num === 1 || num === 9) return 1;
  return 2;
}

/** 中張牌は中心(5)から遠い順。同距離なら数字の大きい順 */
function compareMiddleTileOrder(a: TileId, b: TileId): number {
  const distA = Math.abs(Number(a[0]) - 5);
  const distB = Math.abs(Number(b[0]) - 5);
  if (distB !== distA) return distB - distA;
  if (Number(b[0]) !== Number(a[0])) return Number(b[0]) - Number(a[0]);
  return ALL_TILES.indexOf(a) - ALL_TILES.indexOf(b);
}

function compareDiscardTileOrder(
  a: TileId,
  b: TileId,
  reverse: boolean,
): number {
  const catA = discardCategory(a);
  const catB = discardCategory(b);
  if (catA !== catB) {
    return reverse ? catB - catA : catA - catB;
  }
  if (catA === 2) return compareMiddleTileOrder(a, b);
  return ALL_TILES.indexOf(a) - ALL_TILES.indexOf(b);
}

function pickBetterDiscardOption(
  a: DiscardOption,
  b: DiscardOption,
): DiscardOption {
  if (a.shantenAfterDiscard !== b.shantenAfterDiscard) {
    return a.shantenAfterDiscard < b.shantenAfterDiscard ? a : b;
  }
  return a.totalUkeire >= b.totalUkeire ? a : b;
}

function mergeDiscardOptions(
  normalOptions: DiscardOption[],
  chiitoitsuOptions: DiscardOption[],
): DiscardOption[] {
  const merged = new Map<TileId, DiscardOption>();

  for (const option of normalOptions) {
    merged.set(option.discard, option);
  }

  for (const option of chiitoitsuOptions) {
    const existing = merged.get(option.discard);
    merged.set(
      option.discard,
      existing ? pickBetterDiscardOption(existing, option) : option,
    );
  }

  const options = [...merged.values()];
  options.sort(sortOptions);
  return options;
}

/** 七対子形で進める手牌か（通常形より七対子向聴が進んでいる） */
function isChiitoitsuOriented(hand: ReturnType<typeof tilesToHand>): boolean {
  const rule = new RuleSet("Riichi");
  const chiitoi = cal.calShantenChiitoi(hand);
  return chiitoi <= 1 && chiitoi < rule.calShanten(hand);
}

function sortBestOptionsByTileType(
  bestOptions: DiscardOption[],
  hand: ReturnType<typeof tilesToHand>,
): DiscardOption[] {
  const reverse = isChiitoitsuOriented(hand);
  return [...bestOptions].sort((a, b) =>
    compareDiscardTileOrder(a.discard, b.discard, reverse),
  );
}

export function analyzeFourteen(
  tiles: TileId[],
  mode: GameMode = "yonma",
  context: TileContext = "default",
): HandAnalysis {
  if (tiles.length !== 14) {
    return { shanten: -1, options: [], bestOptions: [], best: null };
  }

  const allowed = new Set(tilesForContext(mode, context));
  const rule = new RuleSet("Riichi");
  const hand = tilesToHand(tiles);
  const raw = rule.calUkeire(hand) as {
    shanten: number;
    normalDiscard?: Record<string, UkeireMap>;
  };

  const normalOptions: DiscardOption[] = Object.entries(
    raw.normalDiscard ?? {},
  ).map(([discard, ukeire]) => {
    const filtered = filterUkeire(ukeire, allowed);
    return {
      discard: discard as TileId,
      totalUkeire: sumUkeire(filtered),
      shantenAfterDiscard: shantenAfterDiscard(
        tiles,
        discard as TileId,
        rule,
      ),
      ukeire: filtered,
    };
  });

  const chiitoitsuOptions = buildChiitoitsuDiscardOptions(
    tiles,
    allowed,
    raw.normalDiscard ?? {},
  );

  const options = mergeDiscardOptions(normalOptions, chiitoitsuOptions);

  const maxUkeire = options[0]?.totalUkeire ?? -1;
  const bestOptions = sortBestOptionsByTileType(
    options.filter((o) => o.totalUkeire === maxUkeire),
    hand,
  );

  return {
    shanten: raw.shanten,
    options,
    bestOptions,
    best: bestOptions[0] ?? null,
  };
}

/** 13枚テンパイの待ち牌を計算 */
export function analyzeThirteen(
  tiles: TileId[],
  mode: GameMode = "yonma",
  context: TileContext = "default",
): TenpaiAnalysis | null {
  if (tiles.length !== 13) return null;

  const allowed = new Set(tilesForContext(mode, context));
  const rule = new RuleSet("Riichi");
  const hand = tilesToHand(tiles);
  const raw = rule.calUkeire(hand) as {
    shanten: number;
    ukeire?: UkeireMap;
  };

  if (raw.shanten !== 0) return null;

  const ukeire = filterUkeire(raw.ukeire ?? {}, allowed);
  const waitTypes = Object.keys(ukeire).length;
  if (waitTypes === 0) return null;

  return {
    shanten: 0,
    ukeire,
    totalUkeire: sumUkeire(ukeire),
    waitTypes,
  };
}

/** 受け入れ牌を牌種順に並べる */
export function ukeireEntries(ukeire: UkeireMap): UkeireEntry[] {
  const entries: UkeireEntry[] = [];
  for (const [tile, count] of Object.entries(ukeire)) {
    if (isTileId(tile)) {
      entries.push({ tile, count });
    }
  }
  return entries.sort(
    (a, b) => ALL_TILES.indexOf(a.tile) - ALL_TILES.indexOf(b.tile),
  );
}

export function formatUkeireList(ukeire: UkeireMap): string {
  return ukeireEntries(ukeire)
    .map(({ tile, count }) => `${tileLabel(tile)}×${count}`)
    .join(" ");
}
