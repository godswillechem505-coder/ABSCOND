import React from "react";
import { Link } from "react-router-dom";
import { studentPortalFeatures } from "../data/homeData";

export default function StudentPortalSection() {
  return (
    <section className="student-portal-section" id="portal">
      <div className="section-container">
        <div className="student-portal-wrapper">
          <div className="portal-header-block">
            <h2 className="portal-main-heading">{studentPortalFeatures.title}</h2>
            <p className="portal-main-subtext">{studentPortalFeatures.description}</p>
          </div>

          <div className="portal-checklist-grid">
            <div className="portal-checklist-col">
              {studentPortalFeatures.featuresCol1.map((feat, i) => (
                <div key={i} className="portal-check-item">
                  <span className="portal-bullet"></span>
                  <span className="portal-item-text">{feat}</span>
                </div>
              ))}
            </div>

            <div className="portal-checklist-col">
              {studentPortalFeatures.featuresCol2.map((feat, i) => (
                <div key={i} className="portal-check-item">
                  <span className="portal-bullet"></span>
                  <span className="portal-item-text">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="portal-action-row">
            <Link to="/login" className="btn-portal-login">
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
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>{studentPortalFeatures.buttonText}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
