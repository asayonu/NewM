"use client";

import { useCallback, useMemo, useState } from "react";
import GameModeToggle from "@/components/shared/GameModeToggle";
import MahjongTile from "@/components/ukeire/MahjongTile";
import UkeireTileList from "@/components/ukeire/UkeireTileList";
import { generateQuizHand } from "@/lib/mahjong/randomHand";
import { tileLabel, type GameMode, type TileId } from "@/lib/mahjong/tiles";
import type { HandAnalysis } from "@/lib/mahjong/ukeire";

const HAND_SIZE = 14;

export default function DiscardQuizApp() {
  const [mode, setMode] = useState<GameMode>("sanma");
  const [hand, setHand] = useState<TileId[]>([]);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);
  const [selectedDiscard, setSelectedDiscard] = useState<TileId | null>(null);
  const [selectedDiscardIndex, setSelectedDiscardIndex] = useState<number | null>(
    null,
  );
  const [answered, setAnswered] = useState(false);

  const loadProblem = useCallback((nextMode: GameMode) => {
    const { hand: nextHand, analysis: nextAnalysis } = generateQuizHand(nextMode);
    setHand(nextHand);
    setAnalysis(nextAnalysis);
    setSelectedDiscard(null);
    setSelectedDiscardIndex(null);
    setAnswered(false);
  }, []);

  const switchMode = (next: GameMode) => {
    if (next === mode) return;
    setMode(next);
    loadProblem(next);
  };

  const startQuiz = () => {
    loadProblem(mode);
  };

  const bestDiscardTiles = useMemo(() => {
    if (!analysis?.bestOptions.length) return new Set<TileId>();
    return new Set(analysis.bestOptions.map((o) => o.discard));
  }, [analysis]);

  const chooseDiscard = (tile: TileId, index: number) => {
    if (answered || !analysis?.best) return;
    setSelectedDiscard(tile);
    setSelectedDiscardIndex(index);
    setAnswered(true);
  };

  const isCorrect =
    answered &&
    selectedDiscard !== null &&
    bestDiscardTiles.has(selectedDiscard);

  const tileHighlight = (tile: TileId, index: number) => {
    if (!answered) return false;
    if (!isCorrect && index === selectedDiscardIndex) return false;
    return bestDiscardTiles.has(tile);
  };

  const tileClassName = (tile: TileId, index: number) => {
    if (!answered) {
      return "block aspect-[3/4] w-full rounded-md transition hover:ring-2 hover:ring-emerald-400 active:scale-95";
    }
    if (!isCorrect && index === selectedDiscardIndex) {
      return "block aspect-[3/4] w-full rounded-md ring-2 ring-red-500";
    }
    if (bestDiscardTiles.has(tile)) {
      return "block aspect-[3/4] w-full rounded-md ring-2 ring-emerald-500";
    }
    return "block aspect-[3/4] w-full rounded-md opacity-70";
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-100">
      <section className="z-20 shrink-0 border-b border-stone-200 bg-white px-2 pb-3 pt-5 sm:px-4 sm:pt-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 text-sm font-medium text-stone-600">問題</p>
            <GameModeToggle mode={mode} onChange={switchMode} />
          </div>
          <div className="flex shrink-0 gap-2">
            {hand.length > 0 && (
              <button
                type="button"
                onClick={() => loadProblem(mode)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700"
              >
                次の問題
              </button>
            )}
          </div>
        </div>

        {hand.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
            <p className="text-sm text-stone-600">
              ランダムな14枚の手牌が出題されます
            </p>
            <button
              type="button"
              onClick={startQuiz}
              className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              問題を始める
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid w-full gap-0.5 rounded-xl border border-stone-200 bg-stone-50 p-1.5 sm:gap-1 sm:p-2"
              style={{
                gridTemplateColumns: `repeat(${HAND_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {hand.map((tile, index) => (
                <div key={`${tile}-${index}`} className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => chooseDiscard(tile, index)}
                    disabled={answered}
                    className={tileClassName(tile, index)}
                    aria-label={`${tileLabel(tile)}を切る`}
                  >
                    <MahjongTile
                      tile={tile}
                      size="fill"
                      highlight={tileHighlight(tile, index)}
                    />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-stone-500">
              {answered
                ? "正解の切り牌と受け入れを確認できます"
                : "受入最大の切り牌を1枚選んでください"}
            </p>
          </>
        )}
      </section>

      {hand.length > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3">
          {answered ? (
            <div
              className={
                isCorrect
                  ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                  : "rounded-xl border border-red-200 bg-red-50 p-4"
              }
            >
              <p
                className={
                  isCorrect
                    ? "text-base font-bold text-emerald-800"
                    : "text-base font-bold text-red-800"
                }
              >
                {isCorrect ? "正解！" : "不正解"}
              </p>
              {!isCorrect && selectedDiscard && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-700">
                  <span>あなたの回答:</span>
                  <MahjongTile tile={selectedDiscard} size="sm" />
                </div>
              )}
              {analysis?.best ? (
                <div className="mt-3 space-y-4">
                  {analysis.bestOptions.map((opt, i) => (
                    <div
                      key={opt.discard}
                      className={
                        i > 0 ? "border-t border-emerald-200/80 pt-4" : undefined
                      }
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">
                          正解
                        </span>
                        <MahjongTile tile={opt.discard} size="sm" highlight />
                        <span className="text-lg font-bold text-emerald-700">
                          受入 {opt.totalUkeire} 枚
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-stone-600">
                        向聴 {analysis.shanten} → 切後{" "}
                        {opt.shantenAfterDiscard}
                      </p>
                      <div className="mt-2">
                        <p className="mb-1 text-[11px] font-medium text-stone-500">
                          待ち
                        </p>
                        <UkeireTileList ukeire={opt.ukeire} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-stone-600">
                  この手牌には向聴を戻さない切りがありません
                </p>
              )}
              <button
                type="button"
                onClick={() => loadProblem(mode)}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                次の問題
              </button>
            </div>
          ) : (
            <p className="text-sm text-stone-500">
              手牌から切る牌を1枚タップしてください
            </p>
          )}
        </div>
      )}
    </div>
  );
}
