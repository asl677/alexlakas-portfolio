import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import MarqueeBanner from "@/components/MarqueeBanner";
import About from "@/components/About";
import Work from "@/components/Work";
import Press from "@/components/Press";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <MarqueeBanner />
      <About />
      <MarqueeBanner />
      <Work />
      <Press />
      <Contact />
      <Footer />
    </main>
  );
}
