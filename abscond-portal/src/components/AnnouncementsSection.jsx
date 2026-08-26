import React from "react";
import { Link } from "react-router-dom";
import { announcementsData } from "../data/homeData";

export default function AnnouncementsSection() {
  return (
    <section className="announcements-section" id="announcements">
      <div className="section-container">
        <h2 className="section-heading">Latest Announcements</h2>
        <div className="announcements-grid">
          {announcementsData.map((item) => (
            <div key={item.id} className="announcement-card">
              <div className="announcement-card-header">
                <div className="announcement-icon-bubble">
                  {/* Megaphone / Bullhorn Icon */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 11 18-5v12L3 14v-3z" />
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                  </svg>
                </div>
                <div className="announcement-info">
                  <h3 className="announcement-title">{item.title}</h3>
                  <span className="announcement-date">{item.date}</span>
                </div>
              </div>
              <Link to={item.link} className="card-link-arrow">
                <span>View Details</span>
                <span className="arrow-char">&rarr;</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
