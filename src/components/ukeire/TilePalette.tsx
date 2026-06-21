"use client";

import { ALL_TILES, tileLabel, type TileId } from "@/lib/mahjong/tiles";
import MahjongTile from "./MahjongTile";

type Props = {
  hand: TileId[];
  onAdd: (tile: TileId) => void;
  disabled?: boolean;
};

const SUITS: { key: "m" | "p" | "s" | "z"; title: string }[] = [
  { key: "m", title: "萬子" },
  { key: "p", title: "筒子" },
  { key: "s", title: "索子" },
  { key: "z", title: "字牌" },
];

function countInHand(hand: TileId[], tile: TileId): number {
  return hand.filter((t) => t === tile).length;
}

export default function TilePalette({ hand, onAdd, disabled }: Props) {
  const handFull = hand.length >= 14;

  return (
    <div className="space-y-3">
      {SUITS.map(({ key, title }) => (
        <section key={key}>
          <p className="mb-1.5 text-xs font-medium text-stone-500">{title}</p>
          <div
            className={
              key === "z"
                ? "grid grid-cols-7 gap-1"
                : "grid grid-cols-9 gap-1"
            }
          >
            {ALL_TILES.filter((t) => t[1] === key).map((tile) => {
              const count = countInHand(hand, tile);
              const canAdd = !disabled && !handFull && count < 4;

              return (
                <button
                  key={tile}
                  type="button"
                  disabled={!canAdd}
                  onClick={() => onAdd(tile)}
                  className={
                    canAdd
                      ? "relative flex items-center justify-center rounded-lg p-0.5 transition hover:bg-emerald-50 active:scale-95 active:bg-emerald-100"
                      : "relative flex cursor-not-allowed items-center justify-center rounded-lg p-0.5 opacity-40"
                  }
                  aria-label={`${tileLabel(tile)}を追加${count > 0 ? `（${count}枚）` : ""}`}
                >
                  <MahjongTile tile={tile} size="sm" />
                  {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
