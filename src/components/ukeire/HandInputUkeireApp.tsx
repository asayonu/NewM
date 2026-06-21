"use client";

import { useEffect, useMemo, useState } from "react";
import {
  analyzeFourteen,
  formatUkeireList,
  type HandAnalysis,
} from "@/lib/mahjong/ukeire";
import { tileLabel, type TileId } from "@/lib/mahjong/tiles";
import MahjongTile from "./MahjongTile";
import TilePalette from "./TilePalette";

const HAND_SIZE = 14;

export default function HandInputUkeireApp() {
  const [hand, setHand] = useState<TileId[]>([]);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);

  const bestDiscard = analysis?.best?.discard ?? null;

  useEffect(() => {
    if (hand.length === HAND_SIZE) {
      setAnalysis(analyzeFourteen(hand));
    } else {
      setAnalysis(null);
    }
  }, [hand]);

  const addTile = (tile: TileId) => {
    setHand((prev) => {
      if (prev.length >= HAND_SIZE) return prev;
      if (prev.filter((t) => t === tile).length >= 4) return prev;
      return [...prev, tile];
    });
  };

  const removeAt = (index: number) => {
    setHand((prev) => prev.filter((_, i) => i !== index));
  };

  const undoLast = () => {
    setHand((prev) => prev.slice(0, -1));
  };

  const resetHand = () => {
    setHand([]);
    setAnalysis(null);
  };

  const isBestDiscard = (tile: TileId, index: number) => {
    if (!bestDiscard || tile !== bestDiscard) return false;
    return hand.findIndex((t) => t === bestDiscard) === index;
  };

  const emptySlots = useMemo(
    () => Array.from({ length: Math.max(0, HAND_SIZE - hand.length) }),
    [hand.length],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-stone-100 pt-12">
      {/* 手牌エリア（常に表示） */}
<<<<<<< HEAD
      <section className="shrink-0 border-b border-stone-200 bg-white px-4 py-3">
=======
      <section className="shrink-0 border-b border-stone-200 bg-white px-2 py-3 sm:px-4">
>>>>>>> 5681e8f7 (初めてのコミット)
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-stone-600">
            手牌{" "}
            <span className="font-bold text-stone-900">
              {hand.length}/{HAND_SIZE}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={undoLast}
              disabled={hand.length === 0}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 disabled:opacity-40"
            >
              1枚戻す
            </button>
            <button
              type="button"
              onClick={resetHand}
              disabled={hand.length === 0}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 disabled:opacity-40"
            >
              リセット
            </button>
          </div>
        </div>

<<<<<<< HEAD
        <div className="overflow-x-auto pb-1">
          <div className="flex min-h-16 min-w-min items-end gap-1 rounded-xl border border-stone-200 bg-stone-50 p-2">
            {hand.map((tile, index) => {
              const isBest = isBestDiscard(tile, index);
              return (
                <div key={`${tile}-${index}`} className="relative shrink-0">
                  {isBest && (
                    <span className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                      切る
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="block rounded-md transition hover:ring-2 hover:ring-stone-300 active:scale-95"
                    aria-label={`${tileLabel(tile)}を削除`}
                  >
                    <MahjongTile tile={tile} size="md" highlight={isBest} />
                  </button>
                </div>
              );
            })}
            {emptySlots.map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-16 w-12 shrink-0 rounded-md border border-dashed border-stone-300 bg-white/80"
                aria-hidden
              />
            ))}
          </div>
=======
        <div
          className="grid w-full gap-0.5 rounded-xl border border-stone-200 bg-stone-50 p-1.5 sm:gap-1 sm:p-2"
          style={{ gridTemplateColumns: `repeat(${HAND_SIZE}, minmax(0, 1fr))` }}
        >
          {hand.map((tile, index) => {
            const isBest = isBestDiscard(tile, index);
            return (
              <div key={`${tile}-${index}`} className="relative min-w-0">
                {isBest && (
                  <span className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-1 py-px text-[8px] font-bold leading-tight text-white shadow sm:-top-5 sm:px-2 sm:py-0.5 sm:text-[10px]">
                    切る
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="block aspect-[3/4] w-full rounded-md transition hover:ring-2 hover:ring-stone-300 active:scale-95"
                  aria-label={`${tileLabel(tile)}を削除`}
                >
                  <MahjongTile tile={tile} size="fill" highlight={isBest} />
                </button>
              </div>
            );
          })}
          {emptySlots.map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-[3/4] w-full min-w-0 rounded-md border border-dashed border-stone-300 bg-white/80"
              aria-hidden
            />
          ))}
>>>>>>> 5681e8f7 (初めてのコミット)
        </div>

        <p className="mt-2 text-[11px] text-stone-500">
          下の牌をタップして追加。手牌の牌をタップすると削除できます。
        </p>
      </section>

      {/* 結果 */}
      <section className="shrink-0 px-4 py-3">
        {analysis?.best ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-stone-700">切り</span>
              <MahjongTile tile={analysis.best.discard} size="sm" highlight />
              <span className="text-lg font-bold text-emerald-700">
                受入 {analysis.best.totalUkeire} 枚
              </span>
            </div>
            <p className="mt-2 text-xs text-stone-600">
              向聴 {analysis.shanten} → 切後 {analysis.best.shantenAfterDiscard}
            </p>
            <p className="mt-1 break-all text-[11px] text-stone-500">
              {formatUkeireList(analysis.best.ukeire)}
            </p>
          </div>
        ) : hand.length === HAND_SIZE ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            向聴を戻さない切りがありません
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            14枚そろえると、受け入れ最大の切り牌を表示します
          </p>
        )}
      </section>

      {/* 牌パレット（スクロール可能） */}
      <section className="min-h-0 flex-1 overflow-y-auto border-t border-stone-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="mb-3 text-sm font-bold text-stone-800">牌を選ぶ</p>
        <TilePalette hand={hand} onAdd={addTile} />
      </section>
    </div>
  );
}
