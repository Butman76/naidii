import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import DirectionsStrip from "@/components/DirectionsStrip";
import TrustStats from "@/components/TrustStats";
import TopServices from "@/components/TopServices";
import Footer from "@/components/Footer";

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
