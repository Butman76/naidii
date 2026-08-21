import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TopSpecialists from "@/components/TopSpecialists";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-zinc-50">
        <Hero />
        <TopSpecialists />
      </main>
      <Footer />
    </>
  );
}
