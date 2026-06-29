import AppShell from "@/components/layout/AppShell";
import WaitQuizApp from "@/components/quiz/WaitQuizApp";

export const metadata = {
  title: "待ち牌なんじゃろなクイズ | 麻雀",
  description: "テンパイ（リーチ）の状態で何の牌を待っているかを当てる練習問題です（待ち2〜4種類）",
};

export default function WaitQuizPage() {
  return (
    <AppShell title="待ち牌なんじゃろなクイズ">
      <WaitQuizApp />
    </AppShell>
  );
}
