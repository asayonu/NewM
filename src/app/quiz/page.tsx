import AppShell from "@/components/layout/AppShell";
import DiscardQuizApp from "@/components/quiz/DiscardQuizApp";

export const metadata = {
  title: "どれを捨てればええんやろクイズ | 麻雀",
  description: "ランダムな手牌で受け入れる牌が最大になる牌を当てる練習問題です",
};

export default function QuizPage() {
  return (
    <AppShell title="どれを捨てればええんやろクイズ">
      <DiscardQuizApp />
    </AppShell>
  );
}
