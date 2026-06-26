import AppShell from "@/components/layout/AppShell";
import WaitQuizApp from "@/components/quiz/WaitQuizApp";

export const metadata = {
  title: "待ち牌なんじゃろな | 麻雀",
  description: "テンパイの牌姿から待ち牌を当てる練習問題（待ち2〜4種類）",
};

export default function WaitQuizPage() {
  return (
    <AppShell title="待ち牌なんじゃろな">
      <WaitQuizApp />
    </AppShell>
  );
}
