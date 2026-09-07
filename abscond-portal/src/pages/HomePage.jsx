import React from "react";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import AnnouncementsSection from "../components/AnnouncementsSection";
import CampusesSection from "../components/CampusesSection";
import WhyChooseSection from "../components/WhyChooseSection";
import ServicesSection from "../components/ServicesSection";
import StudentPortalSection from "../components/StudentPortalSection";
import TestimonialsSection from "../components/TestimonialsSection";
import NewsSection from "../components/NewsSection";
import CtaBanner from "../components/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <AnnouncementsSection />
      <CampusesSection />
      <WhyChooseSection />
      <ServicesSection />
      <StudentPortalSection />
      <TestimonialsSection />
      <NewsSection />
      <CtaBanner />
    </>
  );
}
