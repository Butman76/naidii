import type { Metadata } from "next";
import { Geist, Geist_Mono, Golos_Text, Unbounded } from "next/font/google";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

// Акцентный дисплейный шрифт для заголовков — geometric/tech, отличает
// площадку от дефолтного вида Next.js-стартера. Кириллица нужна.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

// Шрифт шапки сайта (лого + меню) — рисовался под кириллицу с нуля,
// выбран пользователем среди трёх вариантов взамен Unbounded/Geist,
// которые в шапке "не понравились". Используется только в Header.tsx.
const golosText = Golos_Text({
  variable: "--font-golos-text",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "800"],
});

export const metadata: Metadata = {
  title: "НайдИИ — сервис поиска специалистов по автоматизации и AI",
  description:
    "НайдИИ — биржа автоматизаторов, нейрокодировщиков и AI-интеграторов. AI-агенты, чат-боты, n8n, Make, CRM-интеграции и автоматизация бизнес-процессов.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} ${golosText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <ImpersonationBanner />
        {children}
      </body>
    </html>
  );
}
