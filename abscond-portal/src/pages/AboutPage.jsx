import { Link } from 'react-router-dom';
import heroCampus from '../assets/hero-campus.jpg';
import nursingStudents from '../assets/nursing-students.jpg';
import clinicalTraining from '../assets/clinical-training.jpg';


export default function AboutPage() {
  return (
    <div className="public-page-wrapper">
      {/* Page Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${heroCampus}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Abia State College of Nursing Sciences</p>
          <h2>About Our Institution</h2>
          <p>
            Pioneering academic excellence, clinical mastery, and compassionate healthcare leadership across Abia State and Nigeria.
          </p>
        </div>
      </section>

      {/* Main Content Flow */}
      <div className="inner-page-container">
        {/* Welcome & Overview */}
        <section className="about-overview-grid">
          <div className="about-overview-copy">
            <span className="eyebrow">Institutional Overview</span>
            <h2>Shaping the Future of Healthcare Professionals</h2>
            <p>
              The Abia State College of Nursing Sciences (ABSCONS) is the premier state-owned institution dedicated to the training, education, and professional development of registered nurses, midwives, and specialized healthcare practitioners.
            </p>
            <p>
              Established under the statutory authority of the Abia State Ministry of Health and fully accredited by the Nursing and Midwifery Council of Nigeria (NMCN), ABSCONS operates across four strategic collegiate campuses located in Aba, Amachara, Umuahia, and Abiriba.
            </p>
            <div className="about-stats-row">
              <div className="about-stat-item">
                <b>4</b>
                <span>Campuses</span>
              </div>
              <div className="about-stat-item">
                <b>100%</b>
                <span>NMCN Accredited</span>
              </div>
              <div className="about-stat-item">
                <b>3,500+</b>
                <span>Graduates Practicing</span>
              </div>
              <div className="about-stat-item">
                <b>12+</b>
                <span>Affiliated Hospitals</span>
              </div>
            </div>
          </div>
          <div className="about-overview-image">
            <img src={nursingStudents} alt="ABSCONS Nursing Students in Clinical Uniform" />
          </div>
        </section>

        {/* Mission, Vision & Core Values */}
        <section className="about-mission-section">
          <div className="section-heading text-center">
            <h2>Our Purpose & Guiding Principles</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              We are committed to delivering global standards in nursing science, community healthcare, and clinical compassion.
            </p>
          </div>

          <div className="mission-vision-grid">
            <div className="mission-card">
              <div className="mission-card-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To provide world-class nursing and midwifery education through evidence-based curriculum, advanced clinical simulation, ethical immersion, and rigorous mentorship, producing healthcare leaders capable of transforming patient outcomes locally and internationally.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-card-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                To be the pre-eminent collegiate center of excellence in nursing and midwifery education in West Africa, recognized globally for clinical competence, innovative research, and transformative community healthcare impact.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-card-icon">💎</div>
              <h3>Our Core Values</h3>
              <ul className="values-list">
                <li><strong>Clinical Excellence:</strong> Uncompromising standard of nursing care and clinical precision.</li>
                <li><strong>Integrity & Ethics:</strong> Absolute dedication to professional ethics and patient dignity.</li>
                <li><strong>Empathy & Compassion:</strong> Treating every patient and community with heartfelt humanity.</li>
                <li><strong>Innovation:</strong> Leveraging modern medical ICT and simulation technology.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* History & Collegiate Milestones */}
        <section className="about-history-section">
          <div className="history-grid">
            <div className="history-image">
              <img src={clinicalTraining} alt="Clinical Practical Training in Progress" />
            </div>
            <div className="history-copy">
              <span className="eyebrow">Institutional Journey</span>
              <h2>Collegiate Transformation & Growth</h2>
              <p>
                Originally established as individual specialized Schools of Nursing and Midwifery in Aba, Umuahia, and Amachara, the Abia State Government through legislative assent consolidated these institutions into a single unified collegiate body: <strong>Abia State College of Nursing Sciences (ABSCONS One)</strong>.
              </p>
              <p>
                This collegiate reform unified academic curricula, centralized student admissions, digitized semester results management, and expanded clinical posting rotations across Federal Medical Centres and specialist general hospitals throughout the state.
              </p>
              <div className="history-milestones">
                <div className="milestone-item">
                  <span className="milestone-year">1982</span>
                  <p>Inception of founding nursing & midwifery training institutions in Abia State.</p>
                </div>
                <div className="milestone-item">
                  <span className="milestone-year">2020</span>
                  <p>Collegiate unification bill signed into law creating the unified multi-campus ABSCONS system.</p>
                </div>
                <div className="milestone-item">
                  <span className="milestone-year">2025</span>
                  <p>Full NMCN re-accreditation across all four campuses and launch of ABSCONS One Portal.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership & Academic Council */}
        <section className="about-leadership-section">
          <div className="section-heading text-center">
            <h2>Institutional Leadership & Governance</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Guided by distinguished nursing scholars, clinical directors, and seasoned healthcare administrators.
            </p>
          </div>

          <div className="leadership-grid">
            <div className="leader-card">
              <div className="leader-avatar">👩‍⚕️</div>
              <h4>Dr. (Mrs.) N. C. Okpara</h4>
              <p className="leader-role">Provost & Chief Executive</p>
              <small>FWACN, Ph.D Nursing Science, RN/RM/RNE</small>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">👨‍⚕️</div>
              <h4>Barr. E. K. Nwankwo</h4>
              <p className="leader-role">College Registrar</p>
              <small>LL.B, BL, MPA (Public Admin)</small>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">👩‍⚕️</div>
              <h4>Mrs. A. I. Ezeh</h4>
              <p className="leader-role">Director of Academic Affairs</p>
              <small>M.Sc Nursing, FWACN, RN/RM</small>
            </div>
            <div className="leader-card">
              <div className="leader-avatar">👨‍⚕️</div>
              <h4>Dr. O. C. Kalu</h4>
              <p className="leader-role">Director of Clinical Training</p>
              <small>Ph.D Maternal & Child Health, RN/RM</small>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="about-cta-banner">
          <div className="about-cta-content">
            <h2>Ready to Begin Your Nursing Career?</h2>
            <p>Explore our accredited programmes or apply online for the upcoming academic session.</p>
            <div className="about-cta-buttons">
              <Link to="/programmes" className="btn-green-arrow">
                Explore Programmes <span aria-hidden="true">→</span>
              </Link>
              <Link to="/admissions" className="btn-white-outline">
                Admissions Guide
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
