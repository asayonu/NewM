import AppShell from "@/components/layout/AppShell";
import HandInputUkeireApp from "@/components/ukeire/HandInputUkeireApp";

export const metadata = {
  title: "受け入れMAX君 | 麻雀",
  description: "14枚の手牌から受け入れ最大の切り牌を表示",
};

export default function UkeirePage() {
  return (
    <AppShell title="受け入れMAX君">
      <HandInputUkeireApp />
    </AppShell>
  );
}
