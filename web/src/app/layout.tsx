import type { Metadata } from "next";
import { Geist, Geist_Mono, Golos_Text, Unbounded } from "next/font/google";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import YandexMetrika from "@/components/YandexMetrika";
import { METRIKA_ID } from "@/lib/metrika";
import "./globals.css";

// Метрика только на реальном домене (сборка на VPS). Статический экспорт для
// GitHub Pages (STATIC_EXPORT=true) — это временная витрина на другом хосте,
// её просмотры не должны попадать в счётчик naidii.ru.
const metrikaEnabled = process.env.STATIC_EXPORT !== "true";

const METRIKA_INIT = `(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}', 'ym');
ym(${METRIKA_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

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
      <head>
        {metrikaEnabled && <script dangerouslySetInnerHTML={{ __html: METRIKA_INIT }} />}
      </head>
      <body className="min-h-full flex flex-col text-zinc-900">
        {metrikaEnabled && (
          <>
            <noscript>
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
            <YandexMetrika />
          </>
        )}
        <ImpersonationBanner />
        {children}
      </body>
    </html>
  );
}
