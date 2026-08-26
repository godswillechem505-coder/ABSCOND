import React from "react";
import { campusesData } from "../data/homeData";

export default function CampusesSection() {
  return (
    <section className="campuses-section" id="campuses">
      <div className="section-container">
        <h2 className="section-heading">Our Campuses</h2>
        <div className="campuses-2x2-grid">
          {campusesData.map((campus) => (
            <div
              key={campus.id}
              className="campus-image-card"
              style={{ backgroundImage: `url(${campus.image})` }}
            >
              <div className="campus-card-overlay">
                <div className="campus-badge-box">
                  <div className="campus-badge-header">
                    <div
                      className="campus-badge-icon"
                      style={{ backgroundColor: campus.badgeColor }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 21h18M3 7v14M21 7v14M6 11h12M6 15h12M6 7l6-4 6 4" />
                      </svg>
                    </div>
                    <h3 className="campus-title">{campus.name}</h3>
                  </div>

                  <div className="campus-programs-list">
                    {campus.programs.map((prog, i) => (
                      <div key={i} className="campus-program-item">
                        <span className="check-mark">&#10003;</span>
                        <span>{prog}</span>
                      </div>
                    ))}
                  </div>

                  <a href={`#campus-${campus.id}`} className="campus-learn-more">
                    <span>Learn More</span>
                    <span className="arrow-char">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
