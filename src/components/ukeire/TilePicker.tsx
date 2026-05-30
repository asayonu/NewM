"use client";

import { ALL_TILES, tileLabel, type TileId } from "@/lib/mahjong/tiles";
import MahjongTile from "./MahjongTile";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (tile: TileId) => void;
};

export default function TilePicker({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  const suits: { key: "m" | "p" | "s" | "z"; title: string }[] = [
    { key: "m", title: "萬子" },
    { key: "p", title: "筒子" },
    { key: "s", title: "索子" },
    { key: "z", title: "字牌" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="牌を選択"
    >
      <div
        className="max-h-[75dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-stone-100 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">牌を選択</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-stone-500 hover:bg-stone-200"
          >
            閉じる
          </button>
        </div>
        {suits.map(({ key, title }) => (
          <section key={key} className="mb-4">
            <p className="mb-2 text-xs font-medium text-stone-500">{title}</p>
            <div
              className={
                key === "z"
                  ? "grid grid-cols-7 gap-2"
                  : "grid grid-cols-9 gap-1.5"
              }
            >
              {ALL_TILES.filter((t) => t[1] === key).map((tile) => (
                <button
                  key={tile}
                  type="button"
                  onClick={() => {
                    onSelect(tile);
                    onClose();
                  }}
                  className="flex items-center justify-center rounded-lg p-1 transition hover:bg-emerald-100 active:scale-95"
                  aria-label={tileLabel(tile)}
                >
                  <MahjongTile tile={tile} size="md" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
