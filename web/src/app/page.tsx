import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import DirectionsStrip from "@/components/DirectionsStrip";
import TrustStats from "@/components/TrustStats";
import TopServices from "@/components/TopServices";
import PartnerAdsCarousel from "@/components/PartnerAdsCarousel";
import Footer from "@/components/Footer";
import { fetchActivePartnerAds } from "@/lib/partner-ads";

// Без этого страница считалась полностью статической (собранной один раз
// при билде) — карточки услуг/специалистов и счётчики на главной не видели
// изменений в PocketBase (например, публикацию профиля админом) до
// следующего git-деплоя. См. STATUS.md.
export const revalidate = 60;

export default async function Home() {
  const partnerAds = await fetchActivePartnerAds();

  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <HeroCarousel />
        <DirectionsStrip />
        <TrustStats />
        <PartnerAdsCarousel ads={partnerAds} />
        <TopServices />
      </main>
      <Footer />
    </>
  );
}
