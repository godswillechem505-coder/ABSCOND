import React from "react";
import { newsData } from "../data/homeData";

export default function NewsSection() {
  return (
    <section className="news-section-framed" id="news">
      <div className="section-container">
        <div className="news-section-header">
          <h2 className="section-heading-inline">Latest News</h2>
          <a href="#all-news" className="view-all-news-link">
            <span>View all news</span>
            <span className="arrow-char">&rarr;</span>
          </a>
        </div>

        <div className="news-cards-grid">
          {newsData.map((item) => (
            <div key={item.id} className="news-item-card">
              <div className="news-thumb-wrap">
                <img src={item.image} alt={item.title} className="news-thumb-img" />
              </div>
              <div className="news-item-body">
                <h3 className="news-item-title">{item.title}</h3>
                <span className="news-item-date">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
