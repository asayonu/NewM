import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function AppShell({ title, children }: Props) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-stone-200/80 bg-white/95 px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur">
        <nav
          className="flex items-center gap-1.5 text-sm"
          aria-label="パンくずリスト"
        >
          <Link
            href="/"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            ホーム
          </Link>
          <span className="text-stone-400" aria-hidden>
            /
          </span>
          <span className="font-semibold text-stone-800">{title}</span>
        </nav>
      </header>
      <div className="flex min-h-0 flex-1 flex-col pt-12">{children}</div>
    </div>
  );
}
