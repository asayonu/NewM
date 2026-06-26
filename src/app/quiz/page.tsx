import AppShell from "@/components/layout/AppShell";
import DiscardQuizApp from "@/components/quiz/DiscardQuizApp";

export const metadata = {
  title: "受け入れMAX何切る | 麻雀",
  description: "ランダムな手牌で受け入れ最大の牌を当てる練習問題",
};

export default function QuizPage() {
  return (
    <AppShell title="受け入れMAX何切る">
      <DiscardQuizApp />
    </AppShell>
  );
}
