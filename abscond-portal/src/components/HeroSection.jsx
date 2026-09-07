import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/homeData";
import heroCampus from "../assets/hero-campus.jpg";
import nursingStudents from "../assets/nursing-students.jpg";
import clinicalTraining from "../assets/clinical-training.jpg";

const SLIDES = [
  { image: heroCampus, label: "Main Campus, Aba" },
  { image: nursingStudents, label: "Nursing Students" },
  { image: clinicalTraining, label: "Clinical Training" },
];

const STATS = [
  { value: "3", label: "Campuses" },
  { value: "500+", label: "Students Enrolled" },
  { value: "30+", label: "Years of Excellence" },
  { value: "100%", label: "Accredited" },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goToSlide = useCallback(
    (index) => {
      if (animating || index === activeSlide) return;
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide(index);
        setAnimating(false);
      }, 400);
    },
    [animating, activeSlide],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((activeSlide + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeSlide, goToSlide]);

  return (
    <section className="hero-section" aria-label="Welcome hero">
      {/* Background image carousel */}
      <div className="hero-bg-layer" aria-hidden="true">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`hero-bg-slide ${i === activeSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content section-container">
        <div className="hero-text-block">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Abia State College of Nursing Sciences
          </span>

          <h1 className="hero-heading">
            Shaping the Future of
            <br />
            <span className="hero-heading-accent">Healthcare in Nigeria</span>
          </h1>

          <p className="hero-tagline">{siteConfig.tagline}</p>

          <div className="hero-cta-group">
            <a href="#admissions" className="hero-btn-primary" id="hero-apply-now-btn">
              Apply Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <Link to="/portal" className="hero-btn-secondary" id="hero-student-portal-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Student Portal
            </Link>
          </div>
        </div>

        <div className="hero-slide-indicators" role="tablist" aria-label="Image slides">
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeSlide}
              aria-label={`View ${slide.label}`}
              className={`hero-indicator ${i === activeSlide ? "active" : ""}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats-bar">
        <div className="section-container">
          <ul className="hero-stats-list" aria-label="Institution highlights">
            {STATS.map(({ value, label }) => (
              <li key={label} className="hero-stat-item">
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
