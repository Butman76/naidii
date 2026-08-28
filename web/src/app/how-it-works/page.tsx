import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES } from "@/data/categories";
import { getCategory3D } from "@/data/category-style";

export const metadata: Metadata = {
  title: "Как это работает — НайдИИ",
  description:
    "Как НайдИИ помогает бизнесу найти специалиста по AI-автоматизации: от регистрации до заявки и общения с исполнителем.",
};

interface FaqBlock {
  question: string;
  answer: string;
}

const FAQ_GROUPS: { title: string; items: FaqBlock[] }[] = [
  {
    title: "Регистрация",
    items: [
      {
        question: "Как зарегистрироваться заказчиком?",
        answer:
          "На странице регистрации выберите «Я заказчик», укажите email и пароль (минимум 8 символов). Аккаунт создастся сразу, но кабинетом можно будет пользоваться только после подтверждения почты.",
      },
      {
        question: "Зачем подтверждать почту и как это сделать?",
        answer:
          "Сразу после регистрации на указанный email придёт письмо со ссылкой «Подтвердить почту». Перейдите по ней — аккаунт активируется. Письмо не пришло? В кабинете есть кнопка «Отправить письмо ещё раз».",
      },
      {
        question: "Можно ли пользоваться сайтом без регистрации?",
        answer:
          "Смотреть каталог, карточки услуг и профили специалистов — можно. А вот отправить заявку или написать специалисту — нет: это осознанное ограничение, чтобы по обе стороны сделки были реальные, подтверждённые аккаунты, а не анонимные сообщения.",
      },
    ],
  },
  {
    title: "Как заказать услугу",
    items: [
      {
        question: "Что такое карточка услуги?",
        answer:
          "Это конкретное предложение специалиста: результат, цена, срок и условия. Один и тот же тип результата (например, «AI-агент для приёма заявок») может предлагать сразу несколько специалистов со своими ценами — сравнивайте и выбирайте.",
      },
      {
        question: "Как отправить заявку специалисту?",
        answer:
          "Откройте карточку понравившегося предложения и нажмите «Заказать». Если вы ещё не вошли — сайт предложит зарегистрироваться или войти. После входа заявка уходит специалисту, а в вашем кабинете появляется подтверждение.",
      },
      {
        question: "Что происходит после отправки заявки?",
        answer:
          "Заявка появляется в кабинете специалиста, и дальше всё общение идёт прямо на площадке — в разделе «Мои заявки» открывается чат с историей переписки. Когда договоритесь об условиях, обе стороны нажимают «Заключить сделку» — результат, стоимость и срок фиксируются отдельной записью.",
      },
      {
        question: "Почему в чате иногда замазан текст?",
        answer:
          "Система автоматически скрывает от собеседника телефоны, email и юзернеймы, которыми кто-то попытался обменяться в чате — это защищает обе стороны: пока сделка ведётся внутри площадки, можно гарантировать соблюдение условий по качеству, срокам и стоимости работ.",
      },
    ],
  },
  {
    title: "Навигация по сайту",
    items: [
      {
        question: "Что означают цвета на карточках и кнопках?",
        answer:
          "У каждого из 9 направлений площадки — свой фирменный цвет: AI-агенты синие, RAG изумрудные, голосовые агенты розово-оранжевые и так далее. Один и тот же цвет сопровождает направление везде — в каталоге, в кабинете специалиста и в ваших заявках, — чтобы быстро находить нужное взглядом, не читая текст целиком.",
      },
      {
        question: "Чем отличаются частники от студий?",
        answer:
          "На площадке размещаются и независимые специалисты, и продвинутые студии с командой. Тип исполнителя виден в его профиле — рейтинг, количество заказов и отзывы помогают сделать выбор независимо от того, один человек работает над задачей или целая команда.",
      },
    ],
  },
  {
    title: "Если чего-то не хватает",
    items: [
      {
        question: "Не нашли на сайте то, что искали?",
        answer:
          "В кабинете заказчика есть раздел «Не нашли то, что вам надо?» — опишите там, какая доработка или автоматизация вам нужна. Сообщение уйдёт прямо команде площадки, мы рассмотрим и постараемся найти или привлечь подходящего специалиста.",
      },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        {/* Верхний блок — примерно две трети экрана, яркое описание сути
            площадки. Полоса направлений ниже — та же 3D-плашка, что и на
            главной (DirectionsStrip) и на /categories, для единообразия. */}
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
              Как это работает
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
              Площадка, где бизнес находит тех, кто умеет автоматизировать его
              с помощью AI
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              Если вам нужно улучшить и автоматизировать процессы в компании
              с учётом современных технологий искусственного интеллекта —
              НайдИИ помогает найти исполнителя, который это реально сделает:
              от независимого специалиста-одиночки до продвинутой студии с
              полной командой.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
              >
                Зарегистрироваться
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Посмотреть каталог услуг
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
            <h2 className="text-center text-lg font-bold text-zinc-900">
              Направления автоматизации и сервиса
            </h2>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {CATEGORIES.filter((c) => c.slug !== "other").map((category) => {
                const classes = getCategory3D(category.slug);
                return (
                  <Link
                    key={category.slug}
                    href={`/category/${category.slug}`}
                    className={`rounded-full border-b-4 bg-gradient-to-br px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:border-b-2 ${classes}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* FAQ-туториал */}
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title} className="mb-10 last:mb-0">
              <h2 className="text-lg font-bold text-zinc-900">{group.title}</h2>
              <div className="mt-4 flex flex-col gap-2">
                {group.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-zinc-200 bg-white p-4"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium text-zinc-900 marker:content-none">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
