import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import heroCampus from '../assets/hero-campus.jpg';
import campusLibrary from '../assets/campus-library.jpg';
import clinicalTraining from '../assets/clinical-training.jpg';
import nursingStudents from '../assets/nursing-students.jpg';


const FALLBACK_CAMPUSES = [
  {
    id: 1,
    name: 'Aba Campus',
    code: 'ABA',
    city: 'Aba',
    address: 'School of Nursing Road, off Brass Junction, Aba, Abia State',
    image: heroCampus,
    director: 'Mrs. M. O. Nwachukwu (RN/RM, M.Sc)',
    phone: '+234 803 111 2221',
    email: 'aba.campus@abscons.edu.ng',
    programmes: ['Basic Nursing', 'Basic Midwifery', 'Post-Basic Nursing'],
    facilities: [
      'Advanced Patient Simulation Lab',
      'Digital E-Library (150+ Computer Workstations)',
      '300-Seat Lecture Theatre',
      'Affiliation with Abia State University Teaching Hospital (ABSUTH), Aba',
    ],
  },
  {
    id: 2,
    name: 'Amachara Main Campus',
    code: 'AMA',
    city: 'Amachara',
    address: 'General Hospital Complex, Amachara, Umuahia South LGA, Abia State',
    image: clinicalTraining,
    director: 'Dr. C. I. Anyanwu (FWACN, Ph.D)',
    phone: '+234 803 111 2222',
    email: 'amachara.campus@abscons.edu.ng',
    programmes: ['Basic Midwifery', 'Community Midwifery', 'Basic Nursing'],
    facilities: [
      'Maternal & Child Clinical Skills Unit',
      'Modern Anatomy & Physiology Demonstration Room',
      'Student Residential Hostels & Sports Ground',
      'Affiliation with General Hospital Amachara',
    ],
  },
  {
    id: 3,
    name: 'Umuahia Campus',
    code: 'UMU',
    city: 'Umuahia',
    address: 'Federal Medical Centre Road, Bende Road, Umuahia, Abia State',
    image: campusLibrary,
    director: 'Mr. P. E. Ogbonna (RN/RNE, B.Sc)',
    phone: '+234 803 111 2223',
    email: 'umuahia.campus@abscons.edu.ng',
    programmes: ['Basic Nursing', 'Post-Basic Nursing', 'Community Nursing'],
    facilities: [
      'Central Collegiate ICT & Examination Hall',
      'Biochemistry & Microbiology Practical Lab',
      'Multi-Purpose College Auditorium',
      'Affiliation with Federal Medical Centre (FMC), Umuahia',
    ],
  },
  {
    id: 4,
    name: 'Abiriba Campus',
    code: 'ABI',
    city: 'Abiriba',
    address: 'College Road, Agboji, Abiriba, Ohafia LGA, Abia State',
    image: nursingStudents,
    director: 'Mrs. H. N. Okoro (RN/RM, B.Sc)',
    phone: '+234 803 111 2224',
    email: 'abiriba.campus@abscons.edu.ng',
    programmes: ['Community Nursing', 'Basic Midwifery'],
    facilities: [
      'Community Outreach & Rural Health Clinic',
      'Clinical Demonstration Skills Lab',
      'Standard College Library & Study Rooms',
      'Affiliation with General Hospital Abiriba',
    ],
  },
];

export default function CampusesPage() {
  const [campuses, setCampuses] = useState(FALLBACK_CAMPUSES);
  const [selectedCampus, setSelectedCampus] = useState(FALLBACK_CAMPUSES[0]);

  useEffect(() => {
    document.title = 'Collegiate Campuses | ABSCONS One';
    ApiClient.get('/reference/campuses', {})
      .then((data) => {
        if (data.campuses && data.campuses.length > 0) {
          // Merge API data with rich fallback details
          const merged = data.campuses.map((apiCam, idx) => {
            const fallback = FALLBACK_CAMPUSES.find((f) => f.code === apiCam.code) || FALLBACK_CAMPUSES[idx % FALLBACK_CAMPUSES.length];
            return {
              ...fallback,
              ...apiCam,
              facilities: fallback.facilities,
              director: fallback.director,
              phone: fallback.phone,
              email: fallback.email,
              programmes: fallback.programmes,
            };
          });
          setCampuses(merged);
          setSelectedCampus(merged[0]);
        }
      })
      .catch(() => {
        // Fallback already in state
      });
  }, []);

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${heroCampus}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Collegiate Infrastructure</p>
          <h2>Our Campuses Across Abia State</h2>
          <p>
            Experience state-of-the-art simulation laboratories, comprehensive medical libraries, and leading teaching hospital affiliations.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Campus Selector Cards */}
        <section className="campuses-selector-section">
          <div className="section-heading text-center">
            <h2>Explore Our Four Distinct Campuses</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Each campus offers unique clinical specializations while maintaining the unified collegiate standards of ABSCONS One.
            </p>
          </div>

          <div className="campuses-grid">
            {campuses.map((campus) => (
              <article
                key={campus.id}
                className={`campus-card-interactive ${selectedCampus.id === campus.id ? 'active-campus' : ''}`}
                onClick={() => setSelectedCampus(campus)}
              >
                <div
                  className="campus-card-hero-img"
                  style={{ '--campus-img': `url("${campus.image || heroCampus}")` }}
                >
                  <span className="campus-badge">{campus.code} CAMPUS</span>
                </div>
                <div className="campus-card-content">
                  <h3>{campus.name}</h3>
                  <p className="campus-city-line">📍 {campus.city}, Abia State</p>
                  <p className="campus-desc-snippet">{campus.address}</p>
                  <button type="button" className="btn-view-campus">
                    {selectedCampus.id === campus.id ? 'Viewing Details ✓' : 'View Campus Details →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Selected Campus Deep Dive Spotlight */}
        {selectedCampus && (
          <section className="campus-spotlight-panel">
            <div className="spotlight-header">
              <div>
                <span className="eyebrow">Campus Spotlight</span>
                <h2>{selectedCampus.name}</h2>
                <p>📍 {selectedCampus.address}</p>
              </div>
              <Link to="/contact" className="btn-green-arrow">
                Contact this Campus <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="spotlight-body-grid">
              <div className="spotlight-info-card">
                <h3>Campus Administration</h3>
                <div className="spotlight-meta-list">
                  <p><strong>Campus Director:</strong> {selectedCampus.director}</p>
                  <p><strong>Direct Line:</strong> <a href={`tel:${selectedCampus.phone?.replaceAll(' ', '')}`}>{selectedCampus.phone}</a></p>
                  <p><strong>Email Address:</strong> <a href={`mailto:${selectedCampus.email}`}>{selectedCampus.email}</a></p>
                </div>

                <h3 style={{ marginTop: '24px' }}>Accredited Programmes Offered</h3>
                <div className="spotlight-programmes-chips">
                  {selectedCampus.programmes?.map((p, idx) => (
                    <span key={idx} className="programme-chip">🎓 {p}</span>
                  ))}
                </div>
              </div>

              <div className="spotlight-facilities-card">
                <h3>Key Facilities & Clinical Affiliations</h3>
                <ul className="facilities-checklist">
                  {selectedCampus.facilities?.map((facility, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      <span>{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Hospital Affiliations & Practical Rotation Network */}
        <section className="affiliations-banner">
          <div className="section-heading text-center">
            <h2>Teaching & Specialist Hospital Network</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Our students gain hands-on clinical exposure through mandatory rotations across Abia State's top healthcare facilities.
            </p>
          </div>

          <div className="affiliations-grid">
            <div className="affiliation-card">
              <h4>Federal Medical Centre (FMC), Umuahia</h4>
              <p>Tertiary referral hospital offering specialized surgery, oncology, ICU, and pediatric rotations.</p>
            </div>
            <div className="affiliation-card">
              <h4>Abia State University Teaching Hospital (ABSUTH), Aba</h4>
              <p>Comprehensive clinical training in internal medicine, surgery, obstetrics, and neonatology.</p>
            </div>
            <div className="affiliation-card">
              <h4>General Hospital, Amachara</h4>
              <p>Specialized secondary center for maternal healthcare, obstetrics, and child health nursing.</p>
            </div>
            <div className="affiliation-card">
              <h4>General Hospital, Abiriba & Ohafia</h4>
              <p>Community healthcare, primary care nursing, and rural healthcare delivery immersion.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
