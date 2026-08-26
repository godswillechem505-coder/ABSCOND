import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import nursingStudents from '../assets/nursing-students.jpg';
import clinicalTraining from '../assets/clinical-training.jpg';


const FALLBACK_PROGRAMMES = [
  {
    id: 1,
    name: 'General Nursing (Basic Nursing)',
    code: 'BNUR',
    durationYears: 3,
    department: 'Department of Nursing Science',
    award: 'Registered Nurse (RN) Certification — NMCN Licensed',
    description:
      'A comprehensive 3-year full-time professional programme preparing candidates in fundamental anatomy, medical-surgical nursing, pharmacology, behavioral sciences, and clinical nursing interventions.',
    requirements: [
      '5 O-Level Credit passes in WAEC/NECO/NABTEB (English, Mathematics, Biology, Chemistry, Physics) in not more than two sittings.',
      'Minimum age of 16 years at the time of admission.',
      'Successful performance in the ABSCONS Computer-Based Entrance Examination and Oral Interview.',
    ],
    curriculumHighlights: [
      'Foundations of Nursing & Health Assessment',
      'Medical-Surgical Nursing I, II & III',
      'Pharmacology & Therapeutics in Nursing',
      'Mental Health & Psychiatric Nursing Rotation',
      'Intensive Care & Emergency Nursing',
    ],
  },
  {
    id: 2,
    name: 'Basic Midwifery',
    code: 'BMID',
    durationYears: 3,
    department: 'Department of Midwifery & Maternal Health',
    award: 'Registered Midwife (RM) Certification — NMCN Licensed',
    description:
      'A 3-year rigorous clinical programme specializing in ante-natal care, labor management, neonatal resuscitation, postnatal care, and community reproductive healthcare.',
    requirements: [
      '5 O-Level Credit passes in WAEC/NECO/NABTEB (English, Mathematics, Biology, Chemistry, Physics) in not more than two sittings.',
      'Pass in ABSCONS Entrance Examination and Oral Interview.',
    ],
    curriculumHighlights: [
      'Anatomy & Physiology of Human Reproduction',
      'Normal Pregnancy & Antenatal Care Protocols',
      'Complications of Pregnancy & Obstetric Emergencies',
      'Neonatal Resuscitation & Newborn Intensive Care',
      'Community Midwifery & Family Planning Strategies',
    ],
  },
  {
    id: 3,
    name: 'Post-Basic Nursing',
    code: 'PBNUR',
    durationYears: 2,
    department: 'Department of Nursing Science',
    award: 'Advanced Professional Practice Diploma',
    description:
      'A specialized 2-year post-registration pathway designed for practicing Registered Midwives seeking full double-qualification as Registered Nurses.',
    requirements: [
      'Current Practicing License as a Registered Midwife (RM) with the Nursing and Midwifery Council of Nigeria.',
      '5 O-Level Credits in science subjects.',
      'At least one year of post-qualification clinical experience.',
    ],
    curriculumHighlights: [
      'Advanced Pathophysiology & Clinical Assessment',
      'Critical Care Nursing & Anaesthetic Principles',
      'Healthcare Management & Clinical Leadership',
      'Evidence-Based Nursing Research Project',
    ],
  },
  {
    id: 4,
    name: 'Community Midwifery & Nursing',
    code: 'CMID',
    durationYears: 2,
    department: 'Department of Community Health Sciences',
    award: 'Community Midwife/Nurse Certificate — NMCN Licensed',
    description:
      'Specialized community-centered healthcare training focused on primary healthcare delivery, maternal-child rural outreach, immunizations, and preventive health education.',
    requirements: [
      '5 O-Level Credits in science subjects.',
      'Nomination/sponsorship by local government or community health board is advantageous.',
    ],
    curriculumHighlights: [
      'Primary Healthcare & Rural Epidemiology',
      'Maternal & Child Health Field Immersions',
      'Preventive Healthcare & Vaccination Protocols',
      'Community Health Education & Health Promotion',
    ],
  },
];

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState(FALLBACK_PROGRAMMES);
  const [selectedProg, setSelectedProg] = useState(FALLBACK_PROGRAMMES[0]);

  useEffect(() => {
    document.title = 'Accredited Programmes | ABSCONS One';
    ApiClient.get('/reference/programmes', {})
      .then((data) => {
        if (data.programmes && data.programmes.length > 0) {
          const merged = data.programmes.map((apiProg, idx) => {
            const fallback = FALLBACK_PROGRAMMES.find((f) => f.code === apiProg.code) || FALLBACK_PROGRAMMES[idx % FALLBACK_PROGRAMMES.length];
            return {
              ...fallback,
              ...apiProg,
              department: fallback.department,
              award: fallback.award,
              requirements: fallback.requirements,
              curriculumHighlights: fallback.curriculumHighlights,
            };
          });
          setProgrammes(merged);
          setSelectedProg(merged[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${clinicalTraining}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Academic & Clinical Excellence</p>
          <h2>Accredited Academic Programmes</h2>
          <p>
            Nationally accredited nursing and midwifery programmes designed to cultivate world-class clinical competence, critical thinking, and compassionate care.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Programmes Cards Grid */}
        <section className="programmes-section">
          <div className="section-heading text-center">
            <h2>Select a Programme of Study</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              All programmes are fully approved and accredited by the Nursing and Midwifery Council of Nigeria (NMCN).
            </p>
          </div>

          <div className="programmes-grid-list">
            {programmes.map((prog) => (
              <article
                key={prog.id}
                className={`prog-card-item ${selectedProg.id === prog.id ? 'active-prog' : ''}`}
                onClick={() => setSelectedProg(prog)}
              >
                <div className="prog-card-header">
                  <span className="matric-badge">{prog.code}</span>
                  <span className="prog-duration">⏱ {prog.durationYears} Years Full-Time</span>
                </div>
                <h3>{prog.name}</h3>
                <p className="prog-dept">{prog.department}</p>
                <p className="prog-desc-snippet">{prog.description}</p>
                <div className="prog-card-footer">
                  <span className="prog-award">🎖 {prog.award}</span>
                  <button type="button" className="btn-prog-select">
                    {selectedProg.id === prog.id ? 'Curriculum Selected ✓' : 'View Requirements →'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Selected Programme Deep Dive Details */}
        {selectedProg && (
          <section className="programme-deep-dive-panel">
            <div className="deep-dive-header">
              <div>
                <span className="eyebrow">{selectedProg.department}</span>
                <h2>{selectedProg.name} ({selectedProg.code})</h2>
                <p className="award-line">🎖 Professional Award: <strong>{selectedProg.award}</strong></p>
              </div>
              <div className="deep-dive-action-buttons">
                <Link to="/admissions" className="btn-green-arrow">
                  Apply for this Programme <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="deep-dive-grid">
              <div className="deep-dive-requirements-card">
                <h3>📋 Admission Requirements</h3>
                <ul className="requirements-checklist">
                  {selectedProg.requirements?.map((req, idx) => (
                    <li key={idx}>
                      <span className="bullet-point">📌</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: '24px' }}>🎯 Career Pathways</h3>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                  Graduates of this programme are licensed to practice across state and federal hospitals, military healthcare facilities, private medical centers, international health organizations (WHO, UNICEF, MSF), and pursue advanced nursing specialty degrees globally.
                </p>
              </div>

              <div className="deep-dive-curriculum-card">
                <h3>📚 Core Curriculum Highlights</h3>
                <ul className="curriculum-list">
                  {selectedProg.curriculumHighlights?.map((item, idx) => (
                    <li key={idx}>
                      <span className="module-badge">Module {idx + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Learning Facilities & Practicum */}
        <section className="practical-training-showcase">
          <div className="training-grid">
            <div className="training-copy">
              <span className="eyebrow">Practical Learning</span>
              <h2>High-Fidelity Simulation & Clinical Immersion</h2>
              <p>
                At ABSCONS One, theory meets practice immediately. Our students train on advanced robotic patient simulators that mimic realistic clinical scenarios—from acute cardiac emergencies to complex child delivery procedures.
              </p>
              <p>
                Every student completes a mandatory 1,200+ hours of verified hospital ward rotations under the direct supervision of qualified clinical preceptors and chief nursing officers.
              </p>
              <Link to="/admissions" className="btn-green-arrow">
                Learn About Admissions <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="training-image">
              <img src={nursingStudents} alt="Students practicing in skills laboratory" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
