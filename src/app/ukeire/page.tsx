import Link from "next/link";
import HandInputUkeireApp from "@/components/ukeire/HandInputUkeireApp";

export const metadata = {
  title: "受け入れ計算 | 麻雀",
  description: "14枚の手牌から受け入れ最大の切り牌を表示",
};

export default function UkeirePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center gap-2 border-b border-stone-200/80 bg-white/95 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
        <Link
          href="/"
          className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm hover:bg-white"
        >
          ← 戻る
        </Link>
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm">
          受け入れ計算
        </span>
      </header>
      <HandInputUkeireApp />
    </div>
  );
}
