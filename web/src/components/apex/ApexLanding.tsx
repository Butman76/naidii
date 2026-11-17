"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import s from "./ApexLanding.module.css";

/* ------------------------------------------------------------------ */
/* Иконки — инлайн-SVG (stroke: currentColor), без внешних зависимостей */
/* ------------------------------------------------------------------ */

function SvgBase({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function IconGamepad({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <rect x="2.5" y="7.5" width="19" height="10" rx="5" />
      <path d="M8 11v3M6.5 12.5h3" />
      <circle cx="15.8" cy="11.8" r="1" />
      <circle cx="18" cy="14" r="1" />
    </SvgBase>
  );
}

function IconGrowth({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M3.5 20h17" />
      <rect x="5" y="13" width="3.4" height="6" rx="1" />
      <rect x="10.3" y="9" width="3.4" height="10" rx="1" />
      <rect x="15.6" y="5" width="3.4" height="14" rx="1" />
    </SvgBase>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M4 20.5h16" />
      <path d="M6 20.5V6.5l6-3 6 3v14" />
      <path d="M9.5 9.5h1.5M13 9.5h1.5M9.5 13h1.5M13 13h1.5" />
      <path d="M11 20.5v-3.5h2v3.5" />
    </SvgBase>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M12 3.5 2.5 8.2 12 13l9.5-4.8L12 3.5Z" />
      <path d="M2.5 12.8 12 17.5l9.5-4.7" />
    </SvgBase>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M13 2.5 4.5 13.5H11l-1 8L18.5 10H12l1-7.5Z" />
    </SvgBase>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.9a3 3 0 0 1 0 5.2" />
      <path d="M17.6 14.3a5.5 5.5 0 0 1 2.9 5.2" />
    </SvgBase>
  );
}

function IconArrowOut({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.6 15.4 15.4 8.6" />
      <path d="M10 8.6h5.4V14" />
    </SvgBase>
  );
}

function IconNetwork({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <circle cx="6" cy="7" r="2.4" />
      <circle cx="18" cy="7" r="2.4" />
      <circle cx="12" cy="17.5" r="2.4" />
      <path d="M8.3 8.4 10.6 15.5" />
      <path d="M15.7 8.4 13.4 15.5" />
      <path d="M8.4 7h7.2" />
    </SvgBase>
  );
}

function IconCoins({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <ellipse cx="12" cy="6.4" rx="7" ry="3" />
      <path d="M5 6.4v5.1c0 1.66 3.13 3 7 3s7-1.34 7-3V6.4" />
      <path d="M5 11.5v5.1c0 1.66 3.13 3 7 3s7-1.34 7-3v-5.1" />
    </SvgBase>
  );
}

function IconBulb({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M9.6 17.5h4.8" />
      <path d="M10.2 20.5h3.6" />
      <path d="M12 3.5a5.5 5.5 0 0 0-3.2 9.9c.5.4.8 1 .8 1.6v.5h4.8v-.5c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 3.5Z" />
    </SvgBase>
  );
}

function IconGraduation({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M2.5 8.5 12 4.5l9.5 4-9.5 4-9.5-4Z" />
      <path d="M6 10.6V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.4" />
      <path d="M21.5 8.7V14" />
    </SvgBase>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.6h18" />
    </SvgBase>
  );
}

function IconTelegram({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M21.6 3.6 2.9 10.9a.75.75 0 0 0 .06 1.42l4.5 1.42 1.7 5.3a.75.75 0 0 0 1.32.2l2.4-3.4 4.6 3.4a.75.75 0 0 0 1.18-.42l3.2-13.8a.75.75 0 0 0-.96-.86Z" />
      <path d="m9.3 14.4 12.2-10.7" />
    </SvgBase>
  );
}

function IconVk({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <path d="M7.6 8.8 10.4 15l2.8-6.2" />
      <path d="M17.4 8.8v6.2" />
      <path d="M17.4 12.1 20 8.8M17.4 12.1 20.2 15" />
    </SvgBase>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <SvgBase className={className}>
      <rect x="2.4" y="6" width="19.2" height="12.4" rx="4" />
      <path d="M10.4 9.7 15.2 12.2 10.4 14.7V9.7Z" fill="currentColor" />
    </SvgBase>
  );
}

/* ------------------------------------------------------------------ */
/* Появление при скролле (IntersectionObserver, без внешних библиотек)  */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${s.reveal} ${shown ? s.revealIn : ""} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Контент                                                             */
/* ------------------------------------------------------------------ */

type Tone = "violet" | "blue" | "gold";

const TONE_CLASS: Record<Tone, string> = {
  violet: s.iconViolet,
  blue: s.iconBlue,
  gold: s.iconGold,
};

const STEPS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Игровая песочница",
    text: "Проходи бизнес-кейсы в игровом формате. Создавай компании, принимай решения, учись на ошибках без риска потерять реальные деньги.",
    icon: <IconGamepad />,
  },
  {
    title: "Путь роста",
    text: "Продвигайся от стажёра до CEO. Открывай новые уровни, получай навыки, строй репутацию в сообществе.",
    icon: <IconGrowth />,
  },
  {
    title: "Реальный бизнес",
    text: "Лучшие игроки выходят в реальный бизнес-сегмент. Знакомства с предпринимателями, реальные сделки, живые деньги. От виртуального успеха к настоящей империи.",
    icon: <IconBuilding />,
  },
];

const FEATURES: { title: string; text: string; tone: Tone; icon: ReactNode }[] = [
  {
    title: "Реальные бизнес-кейсы из разных индустрий",
    text: "Задачи из практики действующих компаний, а не учебные примеры.",
    tone: "violet",
    icon: <IconLayers />,
  },
  {
    title: "Обучение через действие, а не теорию",
    text: "Решения, их последствия и результат — всё проверяется на практике.",
    tone: "blue",
    icon: <IconBolt />,
  },
  {
    title: "Сообщество предпринимателей и менторов",
    text: "Люди, у которых можно спросить и с которыми можно расти.",
    tone: "gold",
    icon: <IconUsers />,
  },
  {
    title: "Переход из игры в реальный бизнес",
    text: "Лучшие результаты открывают доступ к настоящим сделкам.",
    tone: "blue",
    icon: <IconArrowOut />,
  },
  {
    title: "Нетворкинг и партнёрства",
    text: "Знакомства, из которых вырастают совместные проекты.",
    tone: "violet",
    icon: <IconNetwork />,
  },
  {
    title: "Доступ к инвестициям и сделкам",
    text: "Выход на инвесторов и предпринимателей, готовых вкладываться.",
    tone: "gold",
    icon: <IconCoins />,
  },
];

const AUDIENCE: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "Начинающие предприниматели",
    text: "Проверь свою бизнес-идею без риска",
    icon: <IconBulb />,
  },
  {
    title: "Студенты и молодые специалисты",
    text: "Получи навыки, которых нет в учебниках",
    icon: <IconGraduation />,
  },
  {
    title: "Действующие бизнесмены",
    text: "Найди партнёров и выйди на новый уровень",
    icon: <IconBriefcase />,
  },
];

// Ссылки на соцсети пока декоративные — заменить на реальные аккаунты,
// когда они появятся.
const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Telegram", href: "#", icon: <IconTelegram /> },
  { label: "ВКонтакте", href: "#", icon: <IconVk /> },
  { label: "YouTube", href: "#", icon: <IconYoutube /> },
];

const MAIN_SITE = "https://naidii.ru";

/* ------------------------------------------------------------------ */
/* Страница                                                            */
/* ------------------------------------------------------------------ */

export default function ApexLanding() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const scrollTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    // Форма пока декоративная: заявка никуда не отправляется, только в консоль.
    console.log("[APEX] заявка на ранний доступ:", value);
    setSent(true);
    setEmail("");
  };

  return (
    <div className={s.root}>
      <div className={s.bg} aria-hidden="true">
        <div className={s.grid} />
        <div className={s.glowTop} />
        <span className={`${s.blob} ${s.blobViolet}`} />
        <span className={`${s.blob} ${s.blobBlue}`} />
        <span className={`${s.blob} ${s.blobGold}`} />
        <div className={s.vignette} />
      </div>

      <div className={s.shell}>
        <header className={s.topbar}>
          <a className={s.brand} href={MAIN_SITE}>
            <span>
              Найд<span className={s.brandMarkAccent}>ИИ</span>
            </span>
            <span className={s.brandSlash}>/</span>
            <span className={s.brandProduct}>APEX</span>
          </a>
          <a className={s.topLink} href={MAIN_SITE}>
            Вернуться на главный сайт →
          </a>
        </header>

        {/* ---------------- HERO ---------------- */}
        <section className={s.hero}>
          <Reveal>
            <span className={s.badge}>
              <span className={s.badgeDot} />
              Скоро запуск
            </span>
          </Reveal>

          <Reveal delay={60}>
            <p className={s.heroKicker}>Царь горы</p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className={s.heroTitle}>
              <span className={s.heroTitleApex}>APEX</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className={s.heroSubtitle}>Бизнес-песочница. От идеи до империи.</p>
          </Reveal>

          <Reveal delay={240}>
            <p className={s.heroLead}>
              Игровая платформа, где ты строишь бизнес с нуля и выходишь в реальный рынок.
            </p>
          </Reveal>

          <Reveal delay={300} className={s.heroActions}>
            <a className={s.btnPrimary} href="#join" onClick={(e) => scrollTo(e, "join")}>
              Записаться
            </a>
            <a className={s.btnGhost} href="#how" onClick={(e) => scrollTo(e, "how")}>
              Как это работает
            </a>
          </Reveal>
        </section>

        {/* ---------------- КАК ЭТО РАБОТАЕТ ---------------- */}
        <section id="how" className={s.section}>
          <Reveal className={s.head}>
            <p className={s.eyebrow}>Как это работает</p>
            <h2 className={s.title}>От песочницы до империи</h2>
            <p className={s.lead}>Три этапа, которые ведут от игры к реальному бизнесу.</p>
          </Reveal>

          <div className={s.steps}>
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 120} className={s.revealCard}>
                <article className={s.step}>
                  <span className={s.stepNum}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={s.stepIcon}>{step.icon}</span>
                  <h3 className={s.stepTitle}>{step.title}</h3>
                  <p className={s.stepText}>{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- ЧТО ТЕБЯ ЖДЁТ ---------------- */}
        <section className={s.section}>
          <Reveal className={s.head}>
            <p className={s.eyebrow}>Возможности</p>
            <h2 className={s.title}>Что тебя ждёт</h2>
            <p className={s.lead}>Всё, что превращает игровой опыт в реальные навыки и связи.</p>
          </Reveal>

          <div className={s.cards}>
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 100} className={s.revealCard}>
                <article className={s.card}>
                  <span className={`${s.cardIcon} ${TONE_CLASS[feature.tone]}`}>
                    {feature.icon}
                  </span>
                  <h3 className={s.cardTitle}>{feature.title}</h3>
                  <p className={s.cardText}>{feature.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- ДЛЯ КОГО ЭТО ---------------- */}
        <section className={s.section}>
          <Reveal className={s.head}>
            <p className={s.eyebrow}>Аудитория</p>
            <h2 className={s.title}>Для кого это</h2>
            <p className={s.lead}>APEX подойдёт и тем, кто только начинает, и тем, кто уже в деле.</p>
          </Reveal>

          <div className={s.audience}>
            {AUDIENCE.map((item, index) => (
              <Reveal key={item.title} delay={index * 120} className={s.revealCard}>
                <article className={s.col}>
                  <span className={s.colIcon}>{item.icon}</span>
                  <h3 className={s.colTitle}>{item.title}</h3>
                  <p className={s.colText}>{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- ФИНАЛЬНЫЙ CTA ---------------- */}
        <section id="join" className={s.section}>
          <Reveal>
            <div className={s.ctaCard}>
              <h2 className={s.ctaTitle}>Готов построить свою империю?</h2>
              <p className={s.ctaLead}>Оставь email, чтобы первым узнать о запуске</p>

              <form className={s.form} onSubmit={onSubmit} noValidate>
                <input
                  className={s.input}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email"
                  autoComplete="email"
                  required
                />
                <button className={s.btnPrimary} type="submit">
                  Записаться
                </button>
              </form>

              {sent && (
                <p className={s.formOk} role="status">
                  Спасибо! Сообщим, когда APEX откроется.
                </p>
              )}

              <p className={s.formNote}>
                Нажимая «Записаться», вы соглашаетесь получать письмо о запуске платформы.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ---------------- ФУТЕР ---------------- */}
        <footer className={s.footer}>
          <div className={s.footerTop}>
            <div>
              <div className={s.footerLogo}>
                <span className="neon-green">Найд</span>
                <span className="neon-red">ИИ</span>
              </div>
              <p className={s.footerText}>
                naidii.ru — биржа специалистов по AI и автоматизации. APEX — игровая
                бизнес-песочница «Царь горы».
              </p>
            </div>

            <nav className={s.footerLinks}>
              <a href={MAIN_SITE}>Главная naidii.ru</a>
              <a href="#join" onClick={(e) => scrollTo(e, "join")}>
                Записаться в список
              </a>
            </nav>

            <div className={s.socials}>
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  className={s.social}
                  href={social.href}
                  aria-label={social.label}
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className={s.footerBottom}>
            <span>© {new Date().getFullYear()} НайдИИ · naidii.ru</span>
            <span>APEX · скоро запуск</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
