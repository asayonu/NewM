import Link from "next/link";

const MENU_ITEMS = [
  {
    href: "/ukeire",
    title: "とりあえずこれ切っとけ君",
    description: "14枚の手牌を入力すると何を切れば\n受け入れる牌が最大になるかを表示します",
  },
  {
    href: "/quiz",
    title: "どれを捨てればええんやろクイズ",
    description: "ランダムな手牌で受け入れる牌が最大になる牌を当てる\n練習問題です",
  },
  {
    href: "/wait-quiz",
    title: "待ち牌なんじゃろな",
    description:
      "テンパイ（リーチ）の状態で何の牌を待っているかを当てる\n練習問題です\n（待ち2〜4種類）",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-center">
      <header className="mb-8 w-full pt-2">
        <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
          Mahjong Tools
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">
          麻雀ツール・練習問題
        </h1>
      </header>

      <nav className="flex w-full max-w-md flex-col gap-3">
        {MENU_ITEMS.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm shadow-stone-200/50 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm text-stone-600">
              {description}
            </p>
          </Link>
        ))}
      </nav>
    </main>
  );
}
