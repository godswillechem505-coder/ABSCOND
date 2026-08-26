import React from "react";
import { testimonialsData } from "../data/homeData";

export default function TestimonialsSection() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-container">
        <h2 className="section-heading text-center">What Our Students Say</h2>

        <div className="testimonials-grid">
          {testimonialsData.map((item) => (
            <div key={item.id} className="testimonial-card">
              <p className="testimonial-quote">"{item.quote}"</p>

              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} className="author-avatar" />
                <div className="author-details">
                  <h4 className="author-name">{item.name}</h4>
                  <span className="author-level">{item.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
