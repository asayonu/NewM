import MatchResultForm from "@/components/MatchResultForm";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-6 pt-2">
        <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
          Mahjong Score
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">対局結果を登録</h1>
        <p className="mt-2 text-sm text-stone-600">
          日付・順位・素点・収支・メモを入力してください
        </p>
        <a
          href="/ukeire"
          className="mt-4 inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
        >
          受け入れ計算（14枚入力） →
        </a>
      </header>

      <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm shadow-stone-200/50">
        <MatchResultForm />
      </section>
    </main>
  );
}