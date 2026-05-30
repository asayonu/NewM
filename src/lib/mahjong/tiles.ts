/** 34種の牌（mahjong-tile-efficiency 形式: 1m-9m, 1p-9p, 1s-9s, 1z-7z） */
export type TileId =
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}m`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}p`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}s`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7}z`;

export const ALL_TILES: TileId[] = [
  "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
  "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
  "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
  "1z", "2z", "3z", "4z", "5z", "6z", "7z",
];

const HONOR_LABELS = ["東", "南", "西", "北", "白", "發", "中"] as const;

export function tileLabel(id: TileId): string {
  const num = id[0];
  const suit = id[1];
  if (suit === "m") return `${num}萬`;
  if (suit === "p") return `${num}筒`;
  if (suit === "s") return `${num}索`;
  return HONOR_LABELS[Number(num) - 1] ?? id;
}

export function tileSuit(id: TileId): "m" | "p" | "s" | "z" {
  return id[1] as "m" | "p" | "s" | "z";
}

export function isTileId(value: string): value is TileId {
  return ALL_TILES.includes(value as TileId);
}

export function nextTile(id: TileId | null): TileId {
  if (!id) return "1m";
  const idx = ALL_TILES.indexOf(id);
  return ALL_TILES[(idx + 1) % ALL_TILES.length];
}

export function prevTile(id: TileId | null): TileId {
  if (!id) return "7z";
  const idx = ALL_TILES.indexOf(id);
  return ALL_TILES[(idx - 1 + ALL_TILES.length) % ALL_TILES.length];
}
