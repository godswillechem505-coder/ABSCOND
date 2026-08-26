import React from "react";
import { aboutData } from "../data/homeData";

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="section-container about-grid">
        {/* Left: Building Image */}
        <div className="about-image-wrapper">
          <img
            src={aboutData.image}
            alt="Abia State College of Nursing Sciences Building"
            className="about-image"
          />
        </div>

        {/* Right: Content */}
        <div className="about-content">
          <h2 className="about-heading">{aboutData.title}</h2>
          <div className="about-text-body">
            {aboutData.paragraphs.map((p, idx) => (
              <p key={idx} className="about-paragraph">
                {p}
              </p>
            ))}
          </div>
          <a href="#about-details" className="btn-green-arrow">
            <span>{aboutData.buttonText}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
