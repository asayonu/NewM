import Link from "next/link";

const MENU_ITEMS = [
  {
    href: "/ukeire",
    title: "受け入れMAX君",
    description: "14枚を入力して、受入最大の切り牌と待ちを表示します",
  },
  {
    href: "/quiz",
    title: "受け入れMAX何切る",
    description: "ランダムな手牌で、最善の切り牌を当てる練習問題です",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-center">
      <header className="mb-8 w-full pt-2">
        <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
          Mahjong Tools
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">ホーム</h1>
        <p className="mt-2 text-sm text-stone-600">
          麻雀の練習・計算メニュー
        </p>
      </header>

      <nav className="flex w-full max-w-md flex-col gap-3">
        {MENU_ITEMS.map(({ href, title, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm shadow-stone-200/50 transition hover:border-emerald-200 hover:bg-emerald-50/40"
          >
            <h2 className="text-lg font-bold text-stone-900">{title}</h2>
            <p className="mt-1.5 text-sm text-stone-600">{description}</p>
          </Link>
        ))}
      </nav>
    </main>
  );
}
