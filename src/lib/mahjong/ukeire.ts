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
  return ALL_TILES.indexOf(a) - ALL_TILES.indexOf(b);
}

/** 七対子形で進める手牌か（向聴が七対子側で決まる） */
function isChiitoitsuOriented(hand: ReturnType<typeof tilesToHand>): boolean {
  const menzu = cal.calShantenMenzu(hand);
  const chiitoi = cal.calShantenChiitoi(hand);
  const kokushi = cal.calShantenKokushi(hand);
  const overall = Math.min(menzu, chiitoi, kokushi);
  return chiitoi === overall && chiitoi <= menzu;
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

  const options: DiscardOption[] = Object.entries(raw.normalDiscard ?? {}).map(
    ([discard, ukeire]) => {
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
    },
  );

  options.sort(sortOptions);

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
