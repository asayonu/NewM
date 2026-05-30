import Link from "next/link";
import CameraUkeireApp from "@/components/ukeire/CameraUkeireApp";

export const metadata = {
  title: "受け入れカメラ | 麻雀",
  description: "14枚の手牌から受け入れ最大の切り牌をカメラで示す",
};

export default function UkeirePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/55"
        >
          ← 戻る
        </Link>
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          受け入れカメラ
        </span>
      </header>
      <CameraUkeireApp />
    </div>
  );
}
