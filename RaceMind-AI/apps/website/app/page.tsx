import { Hero } from "@/components/sections/Hero";
import { ProductIntro } from "@/components/sections/ProductIntro";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductIntro />
      <FeatureShowcase />
      <CTA />
    </>
  );
}
