"use client";
import About from "@/components/landing/About";
import Hero from "@/components/landing/Hero";
import JoinSection from "@/components/landing/JoinSection";
import OrganizersFeatures from "@/components/landing/OrganizersFeatures";
import TravelersFeatures from "@/components/landing/TravelersFeatures";
import ScrollSection from "@/components/layout/ScrollSection";
import SectionNavbar from "@/components/layout/SectionNavbar";
import { useEffect } from "react";

export default function Home() {
  const totalSections = 5;

  // Force an initial scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="relative">
      {/* Navigation sidebar */}
      <SectionNavbar />

      <div className="fixed w-full">
        <ScrollSection index={0}>
          <Hero />
        </ScrollSection>

        <ScrollSection index={1}>
          <About />
        </ScrollSection>

        <ScrollSection index={2}>
          <TravelersFeatures />
        </ScrollSection>

        <ScrollSection index={3}>
          <OrganizersFeatures />
        </ScrollSection>

        <ScrollSection index={4}>
          <JoinSection />
        </ScrollSection>
      </div>

      {/* Add scrollable space to the page */}
      <div style={{ height: `${totalSections * 100}vh` }}></div>
    </main>
  );
}
