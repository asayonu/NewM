"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import GameModeToggle from "@/components/shared/GameModeToggle";
import MahjongTile from "@/components/ukeire/MahjongTile";
import UkeireTileList from "@/components/ukeire/UkeireTileList";
import {
  generateWaitQuizHand,
  WaitQuizExhaustedError,
} from "@/lib/mahjong/randomHand";
import { getWaitQuizCatalogSize } from "@/lib/mahjong/waitQuizCatalog";
import {
  handSignature,
  isTileId,
  tilesForMode,
  tileLabel,
  type GameMode,
  type TileId,
} from "@/lib/mahjong/tiles";
import type { TenpaiAnalysis } from "@/lib/mahjong/ukeire";

const HAND_SIZE = 13;

const SUITS: { key: "m" | "p" | "s" | "z"; title: string }[] = [
  { key: "m", title: "萬子" },
  { key: "p", title: "筒子" },
  { key: "s", title: "索子" },
  { key: "z", title: "字牌" },
];

function setsEqual(a: Set<TileId>, b: Set<TileId>): boolean {
  if (a.size !== b.size) return false;
  for (const tile of a) {
    if (!b.has(tile)) return false;
  }
  return true;
}

export default function WaitQuizApp() {
  const [mode, setMode] = useState<GameMode>("sanma");
  const [hand, setHand] = useState<TileId[]>([]);
  const [analysis, setAnalysis] = useState<TenpaiAnalysis | null>(null);
  const [selectedWaits, setSelectedWaits] = useState<Set<TileId>>(new Set());
  const [answered, setAnswered] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [problemNumber, setProblemNumber] = useState(0);

  const seenHandsRef = useRef<Map<GameMode, Set<string>>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSeenHands = (nextMode: GameMode) => {
    let seen = seenHandsRef.current.get(nextMode);
    if (!seen) {
      seen = new Set();
      seenHandsRef.current.set(nextMode, seen);
    }
    return seen;
  };

  const loadProblem = useCallback(
    (nextMode: GameMode, resetHistory = false) => {
      setLoading(true);
      setSelectedWaits(new Set());
      setAnswered(false);
      setLoadError(null);

      window.setTimeout(() => {
        try {
          if (resetHistory) {
            seenHandsRef.current.set(nextMode, new Set());
          }

          const seen = getSeenHands(nextMode);
          const { hand: nextHand, analysis: nextAnalysis } =
            generateWaitQuizHand(nextMode, seen);

          seen.add(handSignature(nextHand));
          setHand(nextHand);
          setAnalysis(nextAnalysis);
          setProblemNumber((n) => n + 1);
          scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
          setHand([]);
          setAnalysis(null);
          if (error instanceof WaitQuizExhaustedError) {
            setLoadError(
              `出題可能な問題（${getWaitQuizCatalogSize(nextMode)}問）をすべて出しました。「問題を始める」で履歴をリセットして続けられます。`,
            );
          } else {
            setLoadError("問題の生成に失敗しました。もう一度お試しください。");
          }
        } finally {
          setLoading(false);
        }
      }, 0);
    },
    [],
  );

  const switchMode = (next: GameMode) => {
    if (next === mode || loading) return;
    setMode(next);
    loadProblem(next, true);
  };

  const startQuiz = () => {
    loadProblem(mode, true);
  };

  const correctWaitSet = useMemo(() => {
    const set = new Set<TileId>();
    if (!analysis) return set;
    for (const tile of Object.keys(analysis.ukeire)) {
      if (isTileId(tile)) set.add(tile);
    }
    return set;
  }, [analysis]);

  const toggleWait = (tile: TileId) => {
    if (answered || loading) return;
    setSelectedWaits((prev) => {
      const next = new Set(prev);
      if (next.has(tile)) next.delete(tile);
      else next.add(tile);
      return next;
    });
  };

  const submitAnswer = () => {
    if (answered || loading || selectedWaits.size === 0 || correctWaitSet.size === 0) {
      return;
    }
    setAnswered(true);
    window.setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 0);
  };

  const isCorrect = answered && setsEqual(selectedWaits, correctWaitSet);

  const pickerBase =
    "relative flex w-fit justify-self-center self-center items-center justify-center rounded-md p-0.5";

  const pickerClassName = (tile: TileId) => {
    const selected = selectedWaits.has(tile);
    if (!answered) {
      return selected
        ? `${pickerBase} ring-2 ring-emerald-500 bg-emerald-50`
        : `${pickerBase} transition hover:bg-emerald-50 active:scale-95`;
    }
    const isWait = correctWaitSet.has(tile);
    if (selected && isWait) {
      return `${pickerBase} ring-2 ring-emerald-500`;
    }
    if (selected && !isWait) {
      return `${pickerBase} ring-2 ring-red-500 opacity-90`;
    }
    if (!selected && isWait) {
      return `${pickerBase} ring-2 ring-amber-400`;
    }
    return `${pickerBase} opacity-40`;
  };

  const paletteTiles = tilesForMode(mode);

  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-100">
      <section className="z-20 shrink-0 border-b border-stone-200 bg-white px-2 pb-3 pt-5 sm:px-4 sm:pt-6">
        {hand.length > 0 && !answered && (
          <p className="mb-2 text-[11px] text-stone-500">
            テンパイ（リーチ）— 待っている牌を選んで「回答する」を押してください
          </p>
        )}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="shrink-0 text-sm font-medium text-stone-600">
              {problemNumber > 0 ? `第 ${problemNumber} 問` : "問題"}
            </p>
            <GameModeToggle mode={mode} onChange={switchMode} />
          </div>
          <div className="flex shrink-0 gap-2">
            {hand.length > 0 && (
              <button
                type="button"
                onClick={() => loadProblem(mode)}
                disabled={loading}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 disabled:opacity-40"
              >
                {loading ? "読込中…" : "次の問題"}
              </button>
            )}
          </div>
        </div>

        {hand.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
            {loadError && (
              <p className="mb-3 text-sm text-red-700">{loadError}</p>
            )}
            <p className="text-sm text-stone-600">
              テンパイの13枚が出題されます（待ち2〜4種類）
            </p>
            <button
              type="button"
              onClick={startQuiz}
              disabled={loading}
              className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-40"
            >
              {loading ? "問題を生成中…" : "問題を始める"}
            </button>
          </div>
        ) : (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80">
                <p className="text-sm font-medium text-emerald-700">
                  次の問題を準備中…
                </p>
              </div>
            )}
            <div
              key={problemNumber}
              className="grid w-full gap-0.5 rounded-xl border border-stone-200 bg-stone-50 p-1.5 sm:gap-1 sm:p-2"
              style={{
                gridTemplateColumns: `repeat(${HAND_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {hand.map((tile, index) => (
                <div key={`${tile}-${index}`} className="relative min-w-0">
                  <div className="block aspect-[3/4] w-full rounded-md">
                    <MahjongTile tile={tile} size="fill" />
                  </div>
                </div>
              ))}
            </div>
            {answered && (
              <p className="mt-2 text-[11px] text-stone-500">
                結果を確認できます。次の問題へ進めます
              </p>
            )}
          </div>
        )}
      </section>

      {hand.length > 0 && (
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          <section className="border-t border-stone-200 bg-white px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-stone-800">待ち牌を選ぶ</p>
              <p className="text-xs text-stone-500">
                選択 {selectedWaits.size} 種類
              </p>
            </div>
            <div className="space-y-3">
              {SUITS.map(({ key, title }) => {
                const suitTiles = paletteTiles.filter((t) => t[1] === key);
                if (suitTiles.length === 0) return null;

                return (
                  <section key={key}>
                    <p className="mb-1.5 text-xs font-medium text-stone-500">
                      {title}
                    </p>
                    <div
                      className={
                        key === "z"
                          ? "grid grid-cols-7 gap-1"
                          : "grid grid-cols-9 gap-1"
                      }
                    >
                      {suitTiles.map((tile) => (
                        <button
                          key={tile}
                          type="button"
                          disabled={answered || loading}
                          onClick={() => toggleWait(tile)}
                          className={pickerClassName(tile)}
                          aria-label={`${tileLabel(tile)}を待ち牌として選択`}
                          aria-pressed={selectedWaits.has(tile)}
                        >
                          <MahjongTile tile={tile} size="sm" />
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            {!answered && (
              <button
                type="button"
                onClick={submitAnswer}
                disabled={loading || selectedWaits.size === 0}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                回答する
              </button>
            )}
          </section>

          {answered && (
            <section className="px-4 py-3">
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
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-stone-700">
                    正解の待ち（{correctWaitSet.size}種類・受入{" "}
                    {analysis?.totalUkeire ?? 0} 枚）
                  </p>
                  {analysis && (
                    <UkeireTileList ukeire={analysis.ukeire} size="sm" />
                  )}
                </div>
                {!isCorrect && (
                  <p className="mt-2 text-xs text-stone-600">
                    黄枠は見逃した待ち、赤枠は誤って選んだ牌です
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => loadProblem(mode)}
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  {loading ? "読込中…" : "次の問題"}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
