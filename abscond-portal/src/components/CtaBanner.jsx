import React from "react";
import { Link } from "react-router-dom";

export default function CtaBanner() {
  return (
    <section className="cta-banner-section">
      <div className="section-container">
        <div className="cta-banner-card">
          <div className="cta-left-content">
            <div className="cta-icon-circle">
              {/* Graduation Cap / Education Icon */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0047b3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div className="cta-text-content">
              <h2 className="cta-title">Ready to Learn More?</h2>
              <p className="cta-description">
                Explore our campuses, discover our programmes, and stay connected
                through ABSCONS One.
              </p>
            </div>
          </div>

          <div className="cta-buttons-group">
            <Link to="/#programmes" className="btn-cta-explore">
              Explore Programmes
            </Link>
            <Link to="/contact" className="btn-cta-contact">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
