import AppShell from "@/components/layout/AppShell";
import HandInputUkeireApp from "@/components/ukeire/HandInputUkeireApp";

export const metadata = {
  title: "とりあえずこれ切っとけ君 | 麻雀",
  description: "14枚の手牌を入力すると、何を切れば受け入れる牌が最大になるかを表示します",
};

export default function UkeirePage() {
  return (
    <AppShell title="とりあえずこれ切っとけ君">
      <HandInputUkeireApp />
    </AppShell>
  );
}
