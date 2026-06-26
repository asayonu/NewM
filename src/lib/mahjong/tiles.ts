/** 34種の牌（mahjong-tile-efficiency 形式: 1m-9m, 1p-9p, 1s-9s, 1z-7z） */
export type TileId =
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}m`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}p`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}s`
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7}z`;

export type GameMode = "yonma" | "sanma";

export const ALL_TILES: TileId[] = [
  "1m", "2m", "3m", "4m", "5m", "6m", "7m", "8m", "9m",
  "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p",
  "1s", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s",
  "1z", "2z", "3z", "4z", "5z", "6z", "7z",
];

/** 三麻（108枚）: 2m-8m を除く（受け入れMAX君） */
export const SANMA_TILES: TileId[] = ALL_TILES.filter(
  (t) => t[1] !== "m" || t[0] === "1" || t[0] === "9",
);

/** 受け入れMAX何切る: 字牌は東・南のみ */
export const QUIZ_HONOR_TILES: TileId[] = ["1z", "2z"];

export function tilesForMode(mode: GameMode): TileId[] {
  return mode === "sanma" ? SANMA_TILES : ALL_TILES;
}

export function tilesForQuiz(mode: GameMode): TileId[] {
  return tilesForMode(mode)
    .filter((t) => t[1] !== "z" || QUIZ_HONOR_TILES.includes(t))
    .filter((t) => mode !== "sanma" || (t !== "1m" && t !== "9m"));
}

export type TileContext = "default" | "quiz";

export function tilesForContext(
  mode: GameMode,
  context: TileContext = "default",
): TileId[] {
  return context === "quiz" ? tilesForQuiz(mode) : tilesForMode(mode);
}

export function isTileInMode(tile: TileId, mode: GameMode): boolean {
  return tilesForMode(mode).includes(tile);
}

/** 萬子→筒子→索子→字牌の順に理牌 */
export function sortHand(tiles: TileId[]): TileId[] {
  return [...tiles].sort((a, b) => ALL_TILES.indexOf(a) - ALL_TILES.indexOf(b));
}

/** 手牌の一意キー（重複判定用） */
export function handSignature(tiles: TileId[]): string {
  return sortHand(tiles).join(",");
}

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
