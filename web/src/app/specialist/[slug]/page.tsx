import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StandardSpecialistProfile from "@/components/StandardSpecialistProfile";
import PremiumSpecialistProfile from "@/components/PremiumSpecialistProfile";
import { mockSpecialists } from "@/data/mock-specialists";

function getSpecialist(slug: string) {
  return mockSpecialists.find((s) => s.slug === slug);
}

export function generateStaticParams() {
  return mockSpecialists.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialist = getSpecialist(slug);
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
  const specialist = getSpecialist(slug);
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
