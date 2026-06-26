export function ukeireResultBoxClass(isTenpai: boolean): string {
  return isTenpai
    ? "rounded-xl border-2 border-yellow-600 bg-yellow-50 p-4"
    : "rounded-xl border border-emerald-200 bg-emerald-50 p-4";
}

export function shantenLabelClass(isTenpai: boolean): string {
  return isTenpai
    ? "mb-3 text-xs font-bold text-red-600"
    : "mb-3 text-xs text-stone-600";
}

export function ukeireOptionDividerClass(isTenpai: boolean): string {
  return isTenpai ? "border-yellow-300" : "border-emerald-200";
}
