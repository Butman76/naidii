import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StandardSpecialistProfile from "@/components/StandardSpecialistProfile";
import PremiumSpecialistProfile from "@/components/PremiumSpecialistProfile";
import { fetchSpecialists } from "@/lib/specialists";

// generateStaticParams тоже на живых данных - см. web/src/lib/specialists.ts
// и STATUS.md (переход с моков на живые данные, 2026-08-24).
export async function generateStaticParams() {
  const specialists = await fetchSpecialists();
  return specialists.map((s) => ({ slug: s.slug }));
}

// Без этого страница была полностью статической (собранной один раз при
// билде) и не видела изменений в PocketBase до следующего git-деплоя —
// см. STATUS.md. Не влияет на STATIC_EXPORT-сборку (там сервера нет,
// значение просто игнорируется).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialists = await fetchSpecialists();
  const specialist = specialists.find((s) => s.slug === slug);
  if (!specialist) return {};
  return {
    title: `${specialist.name} — ${specialist.title} — НайдИИ`,
    description: specialist.shortDescription,
  };
}

export default async function SpecialistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const specialists = await fetchSpecialists();
  const specialist = specialists.find((s) => s.slug === slug);
  if (!specialist) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        {specialist.premium ? (
          <PremiumSpecialistProfile specialist={specialist} />
        ) : (
          <StandardSpecialistProfile specialist={specialist} />
        )}
      </main>
      <Footer />
    </>
  );
}
