import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import DirectionsStrip from "@/components/DirectionsStrip";
import TrustStats from "@/components/TrustStats";
import TopServices from "@/components/TopServices";
import Footer from "@/components/Footer";

// Без этого страница считалась полностью статической (собранной один раз
// при билде) — карточки услуг/специалистов и счётчики на главной не видели
// изменений в PocketBase (например, публикацию профиля админом) до
// следующего git-деплоя. См. STATUS.md.
export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <HeroCarousel />
        <DirectionsStrip />
        <TrustStats />
        <TopServices />
      </main>
      <Footer />
    </>
  );
}
