import type { Metadata } from "next";
import ApexLanding from "@/components/apex/ApexLanding";

// Страница-заглушка для поддомена apex.naidii.ru (пункт меню «Царь горы»).
// Пока поддомен ведёт сюда через middleware.ts, но страница доступна и по
// прямому адресу naidii.ru/apex — удобно для проверки без DNS.
export const metadata: Metadata = {
  title: "APEX · Царь горы — скоро запуск",
  description:
    "APEX («Царь горы») — игровая бизнес-песочница: проходи бизнес-кейсы, расти от стажёра до CEO и выходи в реальный бизнес. Оставь email, чтобы первым узнать о запуске.",
  openGraph: {
    title: "APEX · Царь горы — скоро запуск",
    description:
      "Бизнес-песочница. От идеи до империи. Игровая платформа, где ты строишь бизнес с нуля и выходишь в реальный рынок.",
    type: "website",
  },
};

export default function ApexPage() {
  return <ApexLanding />;
}
