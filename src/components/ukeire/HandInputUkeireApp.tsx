"use client";

import { useEffect, useMemo, useState } from "react";
import {
  analyzeFourteen,
  type HandAnalysis,
} from "@/lib/mahjong/ukeire";
import { tileLabel, sortHand, type GameMode, type TileId } from "@/lib/mahjong/tiles";
import GameModeToggle from "@/components/shared/GameModeToggle";
import MahjongTile from "./MahjongTile";
import TilePalette from "./TilePalette";
import UkeireTileList from "./UkeireTileList";

const HAND_SIZE = 14;

export default function HandInputUkeireApp() {
  const [hand, setHand] = useState<TileId[]>([]);
  const [mode, setMode] = useState<GameMode>("sanma");
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);

  const bestDiscardTiles = useMemo(() => {
    if (!analysis?.bestOptions.length) return new Set<TileId>();
    return new Set(analysis.bestOptions.map((o) => o.discard));
  }, [analysis]);

  useEffect(() => {
    if (hand.length === HAND_SIZE) {
      setAnalysis(analyzeFourteen(hand, mode));
    } else {
      setAnalysis(null);
    }
  }, [hand, mode]);

  const switchMode = (next: GameMode) => {
    if (next === mode) return;
    setMode(next);
    setHand([]);
    setAnalysis(null);
  };

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

  const organizeHand = () => {
    setHand((prev) => sortHand(prev));
  };

  const isBestDiscard = (tile: TileId) => bestDiscardTiles.has(tile);

  const emptySlots = useMemo(
    () => Array.from({ length: Math.max(0, HAND_SIZE - hand.length) }),
    [hand.length],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-100">
      {/* 手牌エリア（スクロールしても固定） */}
      <section className="z-20 shrink-0 border-b border-stone-200 bg-white px-2 pb-3 pt-5 sm:px-4 sm:pt-6">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 text-sm font-medium text-stone-600">
              手牌{" "}
              <span className="font-bold text-stone-900">
                {hand.length}/{HAND_SIZE}
              </span>
            </p>
            <GameModeToggle mode={mode} onChange={switchMode} />
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={organizeHand}
              disabled={hand.length === 0}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 disabled:opacity-40"
            >
              理牌
            </button>
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

        <div
          className="grid w-full gap-0.5 rounded-xl border border-stone-200 bg-stone-50 p-1.5 sm:gap-1 sm:p-2"
          style={{ gridTemplateColumns: `repeat(${HAND_SIZE}, minmax(0, 1fr))` }}
        >
          {hand.map((tile, index) => {
            const isBest = isBestDiscard(tile);
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
        </div>

        <p className="mt-2 text-[11px] text-stone-500">
          下の牌をタップして追加。手牌の牌をタップすると削除できます。
        </p>
      </section>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {/* 結果 */}
        <section className="px-4 py-3">
          {analysis?.best ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              {analysis.bestOptions.map((opt, i) => (
                <div
                  key={opt.discard}
                  className={i > 0 ? "mt-4 border-t border-emerald-200 pt-4" : undefined}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-stone-700">切り</span>
                    <MahjongTile tile={opt.discard} size="sm" highlight />
                    <span className="text-lg font-bold text-emerald-700">
                      受入 {opt.totalUkeire} 枚
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-600">
                    向聴 {analysis.shanten} → 切後 {opt.shantenAfterDiscard}
                  </p>
                  <div className="mt-2">
                    <p className="mb-1 text-[11px] font-medium text-stone-500">待ち</p>
                    <UkeireTileList ukeire={opt.ukeire} />
                  </div>
                </div>
              ))}
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

        {/* 牌パレット */}
        <section className="border-t border-stone-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-3 text-sm font-bold text-stone-800">牌を選ぶ</p>
          <TilePalette hand={hand} mode={mode} onAdd={addTile} />
        </section>
      </div>
    </div>
  );
}
