import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Текст новости/статьи: Markdown → вёрстка. Сырой HTML react-markdown не
// пропускает (рисует как обычный текст), поэтому админский текст не может
// вставить на страницу скрипт. Заголовки трёх уровней (## / ### / ####),
// **жирный**, *курсив*, ***жирный курсив***, цитаты, списки, ссылки,
// таблицы, разделитель и картинки с подписью: ![подпись](url).
// Используется и на странице новости, и в предпросмотре редактора в админке.

const components: Components = {
  h1: ({ children }) => <h2 className="mt-10 text-3xl font-extrabold leading-tight text-zinc-900">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 text-2xl font-bold leading-tight text-zinc-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold leading-snug text-zinc-900">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 text-lg font-medium leading-snug text-zinc-800">{children}</h4>,
  h5: ({ children }) => <h5 className="mt-5 text-base font-medium italic text-zinc-700">{children}</h5>,
  p: ({ children }) => <p className="mt-4 text-[17px] leading-relaxed text-zinc-800">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-zinc-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    const external = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-700"
        {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-[17px] leading-relaxed text-zinc-800 marker:text-zinc-400">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-[17px] leading-relaxed text-zinc-800 marker:font-semibold marker:text-zinc-500">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 rounded-r-xl border-l-4 border-blue-500 bg-blue-50/60 px-5 py-1 text-zinc-700 [&_p]:text-lg [&_p]:italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-zinc-200" />,
  code: ({ children }) => <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">{children}</code>,
  pre: ({ children }) => <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-zinc-100">{children}</pre>,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200">
      <table className="w-full min-w-[400px] text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">{children}</th>,
  td: ({ children }) => <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">{children}</td>,
  img: ({ src, alt }) => (
    <span className="mt-6 block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="block h-auto w-full rounded-2xl border border-zinc-200" />
      {alt && <span className="mt-2 block text-center text-sm italic text-zinc-500">{alt}</span>}
    </span>
  ),
};

export default function NewsBody({ body }: { body: string }) {
  return (
    <div className="[&>*:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
