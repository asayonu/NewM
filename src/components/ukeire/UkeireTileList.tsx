import { ukeireEntries, type UkeireEntry } from "@/lib/mahjong/ukeire";
import { tileLabel } from "@/lib/mahjong/tiles";
import MahjongTile from "./MahjongTile";

type Props = {
  ukeire: Record<string, number>;
  size?: "xs" | "sm";
};

function UkeireItem({
  tile,
  count,
  size,
}: UkeireEntry & { size: "xs" | "sm" }) {
  return (
    <div
      className="relative shrink-0"
      title={`${tileLabel(tile)} ${count}枚`}
      aria-label={`${tileLabel(tile)} ${count}枚`}
    >
      <MahjongTile tile={tile} size={size} />
      <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-700 px-1 text-[10px] font-bold leading-none text-white shadow">
        {count}
      </span>
    </div>
  );
}

export default function UkeireTileList({ ukeire, size = "xs" }: Props) {
  const entries = ukeireEntries(ukeire);

  if (entries.length === 0) {
    return <p className="text-xs text-stone-500">受け入れなし</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(({ tile, count }) => (
        <UkeireItem key={tile} tile={tile} count={count} size={size} />
      ))}
    </div>
  );
}
