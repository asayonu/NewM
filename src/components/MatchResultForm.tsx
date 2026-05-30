"use client";

import { FormEvent, useState } from "react";
import { MatchResultInput, RANK_OPTIONS } from "@/types/match";

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const initialForm: MatchResultInput = {
  date: todayISO(),
  rank: 1,
  rawScore: 0,
  profit: 0,
  memo: "",
};

const rankLabels: Record<MatchResultInput["rank"], string> = {
  1: "1位",
  2: "2位",
  3: "3位",
  4: "4位",
};

export default function MatchResultForm() {
  const [form, setForm] = useState<MatchResultInput>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log("対局結果:", form);
  };

  const handleReset = () => {
    setForm({ ...initialForm, date: todayISO() });
    setSubmitted(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      <fieldset className="flex flex-col gap-2">
        <label htmlFor="date" className="text-sm font-medium text-stone-700">
          日付
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={form.date}
          onChange={(e) => {
            setSubmitted(false);
            setForm((prev) => ({ ...prev, date: e.target.value }));
          }}
          className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base text-stone-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-stone-700">順位</legend>
        <div className="grid grid-cols-4 gap-2" role="group">
          {RANK_OPTIONS.map((rank) => {
            const selected = form.rank === rank;
            return (
              <button
                key={rank}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setSubmitted(false);
                  setForm((prev) => ({ ...prev, rank }));
                }}
                className={`min-h-12 rounded-xl border text-base font-semibold transition active:scale-[0.98] ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                    : "border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                {rankLabels[rank]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <fieldset className="flex flex-col gap-2">
          <label htmlFor="rawScore" className="text-sm font-medium text-stone-700">
            素点
          </label>
          <input
            id="rawScore"
            name="rawScore"
            type="number"
            inputMode="numeric"
            step={100}
            required
            value={form.rawScore === 0 ? "" : form.rawScore}
            placeholder="0"
            onChange={(e) => {
              setSubmitted(false);
              const value = e.target.value === "" ? 0 : Number(e.target.value);
              setForm((prev) => ({ ...prev, rawScore: value }));
            }}
            className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-base text-stone-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="text-xs text-stone-500">例: 25000、30000</p>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label htmlFor="profit" className="text-sm font-medium text-stone-700">
            収支
          </label>
          <input
            id="profit"
            name="profit"
            type="number"
            inputMode="numeric"
            step={100}
            required
            value={form.profit === 0 ? "" : form.profit}
            placeholder="0"
            onChange={(e) => {
              setSubmitted(false);
              const value = e.target.value === "" ? 0 : Number(e.target.value);
              setForm((prev) => ({ ...prev, profit: value }));
            }}
            className={`min-h-12 w-full rounded-xl border bg-white px-4 text-base font-medium shadow-sm outline-none transition focus:ring-2 ${
              form.profit > 0
                ? "border-emerald-300 text-emerald-700 focus:border-emerald-500 focus:ring-emerald-500/20"
                : form.profit < 0
                  ? "border-rose-300 text-rose-700 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-stone-200 text-stone-900 focus:border-emerald-500 focus:ring-emerald-500/20"
            }`}
          />
          <p className="text-xs text-stone-500">円（+勝ち / −負け）</p>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-2">
        <label htmlFor="memo" className="text-sm font-medium text-stone-700">
          メモ
        </label>
        <textarea
          id="memo"
          name="memo"
          rows={4}
          value={form.memo}
          placeholder="場所、ルール、反省点など"
          onChange={(e) => {
            setSubmitted(false);
            setForm((prev) => ({ ...prev, memo: e.target.value }));
          }}
          className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </fieldset>

      {submitted && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          入力内容を確認しました（保存機能は今後追加予定です）
        </p>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          className="min-h-12 flex-1 rounded-xl bg-emerald-600 px-6 text-base font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          登録する
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="min-h-12 rounded-xl border border-stone-200 bg-white px-6 text-base font-medium text-stone-700 transition hover:bg-stone-50 active:scale-[0.99] sm:min-w-[7rem]"
        >
          クリア
        </button>
      </div>
    </form>
  );
}
