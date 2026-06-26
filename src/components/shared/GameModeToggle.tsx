import type { GameMode } from "@/lib/mahjong/tiles";

type Props = {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
};

export default function GameModeToggle({ mode, onChange }: Props) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-stone-300 bg-stone-50 p-0.5"
      role="group"
      aria-label="麻雀モード"
    >
      <button
        type="button"
        onClick={() => onChange("sanma")}
        className={
          mode === "sanma"
            ? "rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:text-xs"
            : "rounded-md px-2 py-0.5 text-[11px] font-medium text-stone-600 hover:text-stone-900 sm:px-2.5 sm:text-xs"
        }
      >
        三麻
      </button>
      <button
        type="button"
        onClick={() => onChange("yonma")}
        className={
          mode === "yonma"
            ? "rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white sm:px-2.5 sm:text-xs"
            : "rounded-md px-2 py-0.5 text-[11px] font-medium text-stone-600 hover:text-stone-900 sm:px-2.5 sm:text-xs"
        }
      >
        四麻
      </button>
    </div>
  );
}
