import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export interface LegalSection {
  number: string;
  heading: string;
  paragraphs: string[];
}

// Общий каркас для трёх юридических документов (/legal/*). Название
// юрлица-оператора называется один раз на документ — в преамбуле, где
// оно и обязано быть по ст. 437 ГК РФ (публичная оферта должна позволять
// идентифицировать оферента) — дальше по тексту везде используется уже
// определённый термин «Оператор». Полные реквизиты (ОГРН/ИНН) при этом
// не повторяются в конце документа — они и так на каждой странице сайта,
// в подвале ниже.
export default function LegalDocument({
  title,
  revisionDate,
  intro,
  sections,
}: {
  title: string;
  revisionDate: string;
  intro: string[];
  sections: LegalSection[];
}) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <div className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-600"
            >
              ← На главную
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-zinc-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Редакция от {revisionDate}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-zinc-700">
            {intro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.number}>
                <h2 className="text-base font-semibold text-zinc-900">
                  {section.number}. {section.heading}
                </h2>
                <div className="mt-2 flex flex-col gap-2.5 text-sm leading-relaxed text-zinc-700">
                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Контакты Оператора</p>
            <p className="mt-1">Сайт: naidii.ru · Email: info@naidii.ru</p>
            <p className="mt-1 text-xs text-zinc-400">
              Полные реквизиты юридического лица — в подвале сайта.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
