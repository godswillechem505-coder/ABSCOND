import React, { useState } from "react";
import { Link } from "react-router-dom";
import { innerPageData } from "../data/pageData";

function PageHero({ page }) {
  return (
    <section
      className="inner-page-hero"
      style={{ "--hero-image": `url("${page.heroImage}")` }}
    >
      <div className="inner-page-hero-content">
        <p className="hero-kicker">ABSCONS One</p>
        <h2>{page.title}</h2>
        <p>{page.description}</p>
      </div>
    </section>
  );
}

function EventsPage({ page }) {
  return (
    <>
      <section className="inner-section">
        <div className="featured-event">
          <div
            className="featured-event-image"
            style={{ "--event-image": `url("${page.heroImage}")` }}
          />
          <div className="featured-event-copy">
            <span className="eyebrow">Featured event</span>
            <p className="event-category">{page.featured.category}</p>
            <h3>{page.featured.title}</h3>
            <p className="event-meta">
              {page.featured.date} &nbsp;|&nbsp; {page.featured.time} &nbsp;|&nbsp;{" "}
              {page.featured.location}
            </p>
            <p>{page.featured.description}</p>
            <Link className="btn-green-arrow" to="/contact">
              Register now <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
        <div className="inner-section-heading">
          <h3>Upcoming events</h3>
          <Link to="/#calendar">View academic calendar -&gt;</Link>
        </div>
        <div className="events-grid">
          {page.items.map((event) => (
            <article className="event-card" key={event.title}>
              <div
                className="event-card-image"
                style={{ "--event-image": `url("${page.heroImage}")` }}
              >
                <span>{event.category}</span>
              </div>
              <div className="event-card-body">
                <div className="event-date">
                  <strong>{event.month}</strong>
                  <b>{event.day}</b>
                </div>
                <div>
                  <h4>{event.title}</h4>
                  <p className="event-meta">
                    {event.time}
                    <br />
                    {event.location}
                  </p>
                  <p>{event.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ContactPage({ page }) {
  return (
    <section className="inner-section contact-layout">
      <div className="contact-form-panel">
        <span className="eyebrow">Get in touch</span>
        <h3>Send us a message</h3>
        <p>{page.intro}</p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Full name
            <input type="text" placeholder="Your full name" required />
          </label>
          <label>
            Email address
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Message
            <textarea placeholder="How can we help?" rows="5" required />
          </label>
          <button className="btn-green-arrow" type="submit">
            Send message <span aria-hidden="true">-&gt;</span>
          </button>
        </form>
      </div>
      <div className="contact-side">
        <div
          className="contact-image"
          style={{ "--event-image": `url("${page.heroImage}")` }}
        />
        <h3>Frequently contacted departments</h3>
        <div className="departments-grid">
          {page.departments.map((department) => (
            <article
              className={`department-card ${department.color}`}
              key={department.title}
            >
              <span aria-hidden="true">+</span>
              <h4>{department.title}</h4>
              <a href={`mailto:${department.email}`}>{department.email}</a>
              <a href={`tel:${department.phone.replaceAll(" ", "")}`}>
                {department.phone}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqGroup({ group }) {
  const [openQuestion, setOpenQuestion] = useState(group.items[0]?.question);
  return (
    <section className="faq-group">
      <h3>{group.title}</h3>
      {group.items.map((item) => {
        const isOpen = openQuestion === item.question;
        return (
          <article className={`faq-item ${isOpen ? "open" : ""}`} key={item.question}>
            <button
              type="button"
              onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
              aria-expanded={isOpen}
            >
              <span>{item.question}</span>
              <b aria-hidden="true">{isOpen ? "-" : "+"}</b>
            </button>
            {isOpen && <p>{item.answer}</p>}
          </article>
        );
      })}
    </section>
  );
}

function FaqsPage({ page }) {
  const [search, setSearch] = useState("");
  const groups = page.groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.question} ${item.answer}`.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length);
  return (
    <section className="inner-section faq-layout">
      <label className="faq-search">
        Search FAQs
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by keyword..."
        />
      </label>
      <div className="faq-groups">
        {groups.map((group) => (
          <FaqGroup group={group} key={group.title} />
        ))}
      </div>
      {!groups.length && <p className="empty-state">No questions match your search.</p>}
    </section>
  );
}

export default function InnerPage({ pageKey }) {
  const page = innerPageData[pageKey];
  return (
    <>
      <PageHero page={page} />
      {pageKey === "events" && <EventsPage page={page} />}
      {pageKey === "contact" && <ContactPage page={page} />}
      {pageKey === "faqs" && <FaqsPage page={page} />}
    </>
  );
}
