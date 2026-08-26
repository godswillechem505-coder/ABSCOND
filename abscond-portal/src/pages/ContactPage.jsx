import { useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import contactHero from '../assets/img/Contact Us.png';
import heroCampus from '../assets/hero-campus.jpg';


const CAMPUSES_INFO = [
  {
    name: 'Aba Campus',
    address: 'School of Nursing Road, off Brass Junction, Aba, Abia State',
    phone: '+234 803 111 2221',
    email: 'aba.campus@abscons.edu.ng',
  },
  {
    name: 'Amachara Main Campus',
    address: 'General Hospital Complex, Amachara, Umuahia South LGA, Abia State',
    phone: '+234 803 111 2222',
    email: 'amachara.campus@abscons.edu.ng',
  },
  {
    name: 'Umuahia Campus',
    address: 'Federal Medical Centre Road, Bende Road, Umuahia, Abia State',
    phone: '+234 803 111 2223',
    email: 'umuahia.campus@abscons.edu.ng',
  },
  {
    name: 'Abiriba Campus',
    address: 'College Road, Agboji, Abiriba, Ohafia LGA, Abia State',
    phone: '+234 803 111 2224',
    email: 'abiriba.campus@abscons.edu.ng',
  },
];

const DEPARTMENTS = [
  { title: 'Admissions Office', email: 'admissions@abscons.edu.ng', phone: '+234 803 111 2220', color: 'green' },
  { title: 'Academic Affairs', email: 'academic@abscons.edu.ng', phone: '+234 803 111 2221', color: 'blue' },
  { title: 'Bursary & Accounts', email: 'bursary@abscons.edu.ng', phone: '+234 803 111 2222', color: 'purple' },
  { title: 'Clinical Training Unit', email: 'clinical@abscons.edu.ng', phone: '+234 803 111 2223', color: 'orange' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    department: 'Admissions',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessNotice(null);
    setErrorMessage(null);

    try {
      const res = await ApiClient.post('/reference/contact', form, {});
      setSuccessNotice(res.message || 'Thank you! Your message has been sent to our administration.');
      setForm({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        department: 'Admissions',
        message: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${contactHero}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">We are Here to Assist You</p>
          <h2>Contact Us & Campus Directory</h2>
          <p>
            Connect with our admissions team, registry, bursary, academic directors, or visit any of our four collegiate campuses.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Contact Form & Primary Info Section */}
        <section className="contact-main-grid">
          {/* Interactive Form Panel */}
          <div className="contact-form-panel">
            <span className="eyebrow">Direct Inquiry</span>
            <h2>Send Us an Official Message</h2>
            <p>
              Fill out the inquiry form below and our institutional support desk will route your message to the appropriate department.
            </p>

            {successNotice && (
              <div className="admin-notice" role="status" style={{ marginTop: '16px' }}>
                ✓ {successNotice}
              </div>
            )}

            {errorMessage && (
              <div className="login-error" role="alert" style={{ marginTop: '16px' }}>
                ✕ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="public-contact-form">
              <div className="form-row-two">
                <label>
                  Full Name *
                  <input
                    type="text"
                    placeholder="e.g. Chinelo Okonkwo"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Email Address *
                  <input
                    type="email"
                    placeholder="e.g. chinelo@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </label>
              </div>

              <div className="form-row-two">
                <label>
                  Phone Number
                  <input
                    type="tel"
                    placeholder="e.g. +234 803 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label>
                  Target Department
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    <option value="Admissions">Admissions Office</option>
                    <option value="Academic Affairs">Academic Affairs</option>
                    <option value="Bursary">Bursary & Finance</option>
                    <option value="Clinical Training">Clinical Training Unit</option>
                    <option value="Registry">Registry / Transcripts</option>
                    <option value="ICT Support">ICT & Portal Help</option>
                  </select>
                </label>
              </div>

              <label>
                Subject / Purpose of Inquiry *
                <input
                  type="text"
                  placeholder="e.g. Inquiry regarding Basic Midwifery screening dates"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </label>

              <label>
                Message *
                <textarea
                  rows="5"
                  placeholder="Provide complete details regarding your inquiry..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </label>

              <button
                type="submit"
                className="btn-green-arrow"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                {submitting ? 'Submitting Message...' : 'Send Message →'}
              </button>
            </form>
          </div>

          {/* Side Info & Departments */}
          <div className="contact-side-panel">
            <div
              className="contact-side-image"
              style={{ '--contact-img': `url("${heroCampus}")` }}
            />

            <h3>Key Departmental Contacts</h3>
            <div className="contact-dept-grid">
              {DEPARTMENTS.map((dept, idx) => (
                <div key={idx} className={`contact-dept-card ${dept.color}`}>
                  <h4>{dept.title}</h4>
                  <a href={`mailto:${dept.email}`}>✉ {dept.email}</a>
                  <a href={`tel:${dept.phone.replaceAll(' ', '')}`}>📞 {dept.phone}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Four Campuses Location Directory */}
        <section className="contact-campuses-directory">
          <div className="section-heading text-center">
            <h2>Our Campus Locations & Offices</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Visit our administrative offices Monday through Friday, 8:00 AM to 4:00 PM.
            </p>
          </div>

          <div className="campuses-contact-cards-grid">
            {CAMPUSES_INFO.map((c, idx) => (
              <article key={idx} className="campus-contact-box">
                <span className="matric-badge">{c.name}</span>
                <p className="campus-address-text">📍 {c.address}</p>
                <div className="campus-direct-lines">
                  <p>📞 <a href={`tel:${c.phone.replaceAll(' ', '')}`}>{c.phone}</a></p>
                  <p>✉ <a href={`mailto:${c.email}`}>{c.email}</a></p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Embedded Interactive Map Component */}
        <section className="contact-map-section">
          <div className="section-heading text-center">
            <h2>Campus Location Map</h2>
          </div>
          <div className="interactive-map-frame">
            <iframe
              title="Abia State College of Nursing Sciences Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127163.66266155606!2d7.424364448574163!3d5.52491179612948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1042c3327d81081f%3A0x6a2c2049f50f38b2!2sUmuahia%2C%20Abia!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
