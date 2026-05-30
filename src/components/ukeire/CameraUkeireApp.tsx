"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeFourteen,
  formatUkeireList,
  type HandAnalysis,
} from "@/lib/mahjong/ukeire";
import {
  defaultSlotRects,
  scanSlotsFromCanvas,
  type SlotRect,
} from "@/lib/mahjong/vision";
import { nextTile, tileLabel, type TileId } from "@/lib/mahjong/tiles";
import MahjongTile from "./MahjongTile";
import TilePicker from "./TilePicker";

const SLOT_COUNT = 14;

type SlotState = {
  tile: TileId | null;
  rect: SlotRect;
};

function rectsToPixels(rect: SlotRect) {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
  };
}

export default function CameraUkeireApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [slots, setSlots] = useState<SlotState[]>(() =>
    defaultSlotRects(SLOT_COUNT).map((rect) => ({ tile: null, rect })),
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [analysis, setAnalysis] = useState<HandAnalysis | null>(null);

  const tiles = useMemo(
    () => slots.map((s) => s.tile).filter((t): t is TileId => t !== null),
    [slots],
  );

  const bestDiscard = analysis?.best?.discard ?? null;

  const startCamera = useCallback(async () => {
    setCameraError(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
    } catch {
      setCameraError(
        "カメラを起動できませんでした。ブラウザの権限を確認してください。",
      );
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (tiles.length === SLOT_COUNT) {
      setAnalysis(analyzeFourteen(tiles));
    } else {
      setAnalysis(null);
    }
  }, [tiles]);

  const captureFrameToCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return false;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(video, 0, 0);
    return true;
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true);
    try {
      if (!captureFrameToCanvas()) return;
      const canvas = canvasRef.current!;
      const detected = scanSlotsFromCanvas(
        canvas,
        slots.map((s) => s.rect),
      );
      setSlots((prev) =>
        prev.map((slot, i) => ({
          ...slot,
          tile: detected[i] ?? slot.tile,
        })),
      );
    } finally {
      setScanning(false);
    }
  }, [captureFrameToCanvas, slots]);

  const openPickerFor = (index: number) => {
    setActiveSlot(index);
    setPickerOpen(true);
  };

  const setSlotTile = (index: number, tile: TileId) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, tile } : s)),
    );
  };

  const resetHand = () => {
    setSlots(defaultSlotRects(SLOT_COUNT).map((rect) => ({ tile: null, rect })));
    setAnalysis(null);
  };

  const isBestSlot = (index: number) => {
    if (!bestDiscard) return false;
    return slots[index]?.tile === bestDiscard;
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-stone-950 text-white">
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="flex h-full min-h-[50dvh] items-center justify-center p-6 text-center text-sm text-stone-300">
            {cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
        )}

        {/* 14枚のスロット枠 */}
        <div className="pointer-events-none absolute inset-0">
          {slots.map((slot, index) => {
            const style = rectsToPixels(slot.rect);
            const isBest = isBestSlot(index);
            const hasTile = slot.tile !== null;

            return (
              <div
                key={index}
                className="absolute box-border transition-colors duration-200"
                style={{
                  ...style,
                  borderColor: isBest
                    ? "#34d399"
                    : hasTile
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(255,255,255,0.25)",
                  borderWidth: hasTile ? 0 : 2,
                  borderStyle: "dashed",
                  backgroundColor: isBest
                    ? "rgba(16,185,129,0.25)"
                    : hasTile
                      ? "transparent"
                      : "rgba(0,0,0,0.15)",
                  boxShadow: isBest
                    ? "0 0 0 3px rgba(52,211,153,0.9), 0 0 24px rgba(52,211,153,0.6)"
                    : undefined,
                }}
              >
                {isBest && (
                  <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap">
                    <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                      ▼ 切る
                    </span>
                  </div>
                )}
                {hasTile && (
                  <div className="absolute inset-0 flex items-center justify-center p-px">
                    <MahjongTile
                      tile={slot.tile!}
                      size="fill"
                      highlight={isBest}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* タップ用ヒットエリア */}
        <div className="absolute inset-0">
          {slots.map((slot, index) => (
            <button
              key={`hit-${index}`}
              type="button"
              className="absolute touch-manipulation"
              style={rectsToPixels(slot.rect)}
              onClick={() => openPickerFor(index)}
              onTouchStart={(e) => {
                const timer = window.setTimeout(() => {
                  setSlotTile(index, nextTile(slot.tile));
                }, 550);
                (e.currentTarget as HTMLButtonElement).dataset.lpTimer =
                  String(timer);
              }}
              onTouchEnd={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                const id = el.dataset.lpTimer;
                if (id) window.clearTimeout(Number(id));
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setSlotTile(index, nextTile(slot.tile));
              }}
              aria-label={`${index + 1}枚目: ${slot.tile ? tileLabel(slot.tile) : "未設定"}`}
            />
          ))}
        </div>
      </div>

      {/* 結果パネル */}
      <section className="border-t border-stone-800 bg-stone-900/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-stone-400">
              {tiles.length}/{SLOT_COUNT} 枚認識
            </p>
            {analysis?.best ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-300">切り</span>
                  <MahjongTile tile={analysis.best.discard} size="sm" highlight />
                  <span className="text-lg font-bold text-emerald-400">
                    受入 {analysis.best.totalUkeire} 枚
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  向聴 {analysis.shanten} → 切後{" "}
                  {analysis.best.shantenAfterDiscard}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-stone-500">
                  {formatUkeireList(analysis.best.ukeire)}
                </p>
              </>
            ) : tiles.length === SLOT_COUNT ? (
              <p className="mt-1 text-sm text-amber-300">
                向聴を戻さない切りがありません
              </p>
            ) : (
              <p className="mt-1 text-sm text-stone-300">
                牌を枠に合わせて「スキャン」または各枠をタップして設定
              </p>
            )}
          </div>
        </div>

        {tiles.length > 0 && (
          <div className="mb-3 overflow-x-auto pb-1">
            <div className="flex min-w-min gap-0.5">
              {slots.map((slot, i) =>
                slot.tile ? (
                  <MahjongTile
                    key={i}
                    tile={slot.tile}
                    size="xs"
                    highlight={isBestSlot(i)}
                  />
                ) : (
                  <div
                    key={i}
                    className="h-8 w-6 shrink-0 rounded border border-dashed border-stone-600 bg-stone-800/50"
                  />
                ),
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runScan}
            disabled={scanning || !!cameraError}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {scanning ? "認識中…" : "スキャン"}
          </button>
          <button
            type="button"
            onClick={() =>
              setFacingMode((f) => (f === "environment" ? "user" : "environment"))
            }
            className="rounded-xl border border-stone-600 px-3 py-3 text-sm text-stone-200"
          >
            カメラ切替
          </button>
          <button
            type="button"
            onClick={resetHand}
            className="rounded-xl border border-stone-600 px-3 py-3 text-sm text-stone-200"
          >
            リセット
          </button>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-stone-500">
          左クリックで牌選択・長押し相当は右クリックで牌を切替。自動認識は照明や牌面で誤ることがあるため、枠タップで補正してください。
        </p>
      </section>

      <TilePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setActiveSlot(null);
        }}
        onSelect={(tile) => {
          if (activeSlot !== null) setSlotTile(activeSlot, tile);
        }}
      />
    </div>
  );
}
