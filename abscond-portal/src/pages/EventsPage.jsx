import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import eventsHero from '../assets/img/Events.png';
import clinicalTraining from '../assets/clinical-training.jpg';
import heroCampus from '../assets/hero-campus.jpg';
import nursingStudents from '../assets/nursing-students.jpg';


const FALLBACK_EVENTS = [
  {
    id: 1,
    title: '28th Matriculation Ceremony for Fresh Nursing & Midwifery Students',
    category: 'Ceremony',
    eventDate: '2026-03-15',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    location: 'College Auditorium, Umuahia Main Campus',
    description:
      'Official matriculation and oath-taking ceremony for newly admitted students across all four campuses (Aba, Amachara, Umuahia, and Abiriba).',
    isFeatured: true,
    coverImage: heroCampus,
  },
  {
    id: 2,
    title: 'Annual Nursing Sciences & Midwifery Research Symposium',
    category: 'Academic',
    eventDate: '2026-04-20',
    startTime: '09:00 AM',
    endTime: '04:00 PM',
    location: 'Conference Hall, Aba Campus',
    description:
      'Showcasing student and faculty clinical innovations in maternal health, neonatal care, and community disease prevention.',
    isFeatured: false,
    coverImage: clinicalTraining,
  },
  {
    id: 3,
    title: 'Basic Life Support (BLS) & CPR Advanced Skills Workshop',
    category: 'Workshop',
    eventDate: '2026-05-10',
    startTime: '08:30 AM',
    endTime: '03:00 PM',
    location: 'Clinical Simulation Laboratory, Amachara Campus',
    description:
      'Mandatory hands-on resuscitation and emergency triage practical intensive training for Year 2 & 3 students.',
    isFeatured: false,
    coverImage: nursingStudents,
  },
  {
    id: 4,
    title: 'Inter-Collegiate Sports Festival & Health Week',
    category: 'Sports',
    eventDate: '2026-06-05',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    location: 'Sports Ground, Umuahia Campus',
    description:
      'Annual collegiate track & field tournament, football finals, and health outreach exhibition.',
    isFeatured: false,
    coverImage: heroCampus,
  },
];

const PAST_GALLERY = [
  { title: 'Graduation & Induction 2025', image: heroCampus, subtitle: '280 New Nurses Inducted' },
  { title: 'Community Rural Health Outreach', image: nursingStudents, subtitle: 'Over 1,200 Patients Screened' },
  { title: 'World Health Day Symposium', image: clinicalTraining, subtitle: 'Keynote by NMCN Registrar' },
];

export default function EventsPage() {
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    document.title = 'Collegiate Events & Calendar | ABSCONS One';
    ApiClient.get('/reference/events', {})
      .then((data) => {
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Ceremony', 'Academic', 'Workshop', 'Sports'];

  const filteredEvents = events.filter((e) => {
    if (filterCategory === 'All') return true;
    return e.category?.toLowerCase() === filterCategory.toLowerCase();
  });

  const featuredEvent = events.find((e) => e.isFeatured) || events[0];
  const upcomingEvents = filteredEvents.filter((e) => e.id !== featuredEvent?.id);

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${eventsHero}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Collegiate Life & Calendar</p>
          <h2>Events & Academic Highlights</h2>
          <p>
            Conferences, practical clinical workshops, matriculation ceremonies, and student community engagements.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Featured Event Banner */}
        {featuredEvent && (
          <section className="featured-event-banner">
            <div
              className="featured-event-image-box"
              style={{ '--feat-img': `url("${featuredEvent.coverImage || heroCampus}")` }}
            />
            <div className="featured-event-details">
              <span className="eyebrow">Featured Institution Event</span>
              <span className="event-category-tag">{featuredEvent.category}</span>
              <h2>{featuredEvent.title}</h2>
              <div className="event-meta-bar">
                <span>📅 {new Date(featuredEvent.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>⏱ {featuredEvent.startTime} – {featuredEvent.endTime}</span>
                <span>📍 {featuredEvent.location}</span>
              </div>
              <p>{featuredEvent.description}</p>
              <div className="featured-event-actions">
                <Link to="/contact" className="btn-green-arrow">
                  Inquire / Register Attendance <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Category Filters & Upcoming Grid */}
        <section className="upcoming-events-section">
          <div className="events-header-row">
            <div>
              <h2>Upcoming Calendar Events</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Browse scheduled institutional events across all four campuses.
              </p>
            </div>

            <div className="events-category-pills">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="events-cards-grid">
            {upcomingEvents.map((event) => {
              const eventDateObj = new Date(event.eventDate);
              const monthName = eventDateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
              const dayNum = eventDateObj.getDate();

              return (
                <article key={event.id} className="event-grid-card">
                  <div
                    className="event-card-img"
                    style={{ '--card-img': `url("${event.coverImage || clinicalTraining}")` }}
                  >
                    <span className="event-pill-badge">{event.category}</span>
                  </div>
                  <div className="event-grid-body">
                    <div className="event-date-badge">
                      <strong>{monthName}</strong>
                      <b>{dayNum}</b>
                    </div>
                    <div className="event-grid-info">
                      <h4>{event.title}</h4>
                      <p className="event-timing">
                        ⏱ {event.startTime} - {event.endTime}
                        <br />
                        📍 {event.location}
                      </p>
                      <p className="event-snippet">{event.description}</p>
                    </div>
                  </div>
                </article>
              );
            })}

            {upcomingEvents.length === 0 && (
              <div className="empty-state">
                <p>No upcoming events found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Past Events & Gallery */}
        <section className="past-events-gallery-section">
          <div className="section-heading text-center">
            <h2>Campus Life & Past Events Gallery</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Highlights from our vibrant student community, clinical missions, and academic milestones.
            </p>
          </div>

          <div className="gallery-cards-grid">
            {PAST_GALLERY.map((g, idx) => (
              <div key={idx} className="gallery-item-card">
                <div
                  className="gallery-img"
                  style={{ '--gallery-img': `url("${g.image}")` }}
                />
                <div className="gallery-caption">
                  <h4>{g.title}</h4>
                  <small>{g.subtitle}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
