import { Link } from 'react-router-dom';
import campusLibrary from '../assets/campus-library.jpg';




export default function AdmissionsPage() {
  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${campusLibrary}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Start Your Healthcare Journey</p>
          <h2>Admissions & Application Guide</h2>
          <p>
            Join the next generation of professional nurses and midwives. Comprehensive guidelines for 2025/2026 and 2026/2027 admissions.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Step-by-Step Application Roadmap */}
        <section className="admissions-steps-section">
          <div className="section-heading text-center">
            <h2>Step-by-Step Application Process</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Follow these simple steps to successfully complete and submit your application for admission into ABSCONS.
            </p>
          </div>

          <div className="admissions-steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <h3>Online Registration</h3>
              <p>
                Visit the ABSCONS One portal, generate an Application Invoice, and pay the non-refundable application fee via Remita/Bank transfer.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <h3>Document Upload</h3>
              <p>
                Complete your bio-data form and upload clear scanned copies of your O-Level certificates, birth certificate, and passport photographs.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <h3>CBT Entrance Exam</h3>
              <p>
                Print your examination slip and sit for the Computer-Based Entrance Examination (CBT) covering English, Mathematics, Biology, Chemistry, and Physics.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>
              <h3>Oral Interview & Selection</h3>
              <p>
                Shortlisted candidates participate in the oral selection interview and document verification before the College Admissions Board.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">05</span>
              <h3>Acceptance & Enrollment</h3>
              <p>
                Successful candidates receive their official admission letter, pay the acceptance fee, and receive login credentials for the Student Portal.
              </p>
            </div>
          </div>
        </section>

        {/* Eligibility & Entry Requirements */}
        <section className="eligibility-panel">
          <div className="eligibility-grid">
            <div className="eligibility-copy">
              <span className="eyebrow">Eligibility Criteria</span>
              <h2>General Entry Requirements</h2>
              <p>
                Candidates seeking admission into Basic Nursing or Basic Midwifery must possess the following minimum qualifications:
              </p>
              <ul className="eligibility-list">
                <li>
                  <strong>Academic Credentials:</strong> Five (5) O-Level credit passes in WAEC, NECO, or NABTEB in English Language, Mathematics, Biology, Chemistry, and Physics.
                </li>
                <li>
                  <strong>Sitting Combination:</strong> A maximum of two (2) examination sittings is permitted. WAEC and NECO results may be combined; NABTEB results must be in one sitting.
                </li>
                <li>
                  <strong>Age Requirement:</strong> Candidates must be at least 16 years of age at the commencement of the academic session.
                </li>
                <li>
                  <strong>Post-Basic Nursing Applicants:</strong> Must be a Registered Midwife (RM) with a valid NMCN license and at least 1 year post-qualification clinical experience.
                </li>
              </ul>
            </div>

            <div className="eligibility-dates-card">
              <h3>🗓 Key Admissions Dates (2026)</h3>
              <div className="dates-timeline">
                <div className="date-item">
                  <b>March 1, 2026</b>
                  <span>Online Application Portal Opens</span>
                </div>
                <div className="date-item">
                  <b>May 31, 2026</b>
                  <span>Application Deadline & Form Submission Closes</span>
                </div>
                <div className="date-item">
                  <b>June 15–18, 2026</b>
                  <span>Computer-Based Entrance Examination (CBT)</span>
                </div>
                <div className="date-item">
                  <b>July 10, 2026</b>
                  <span>Oral Interviews for Shortlisted Applicants</span>
                </div>
                <div className="date-item">
                  <b>August 1, 2026</b>
                  <span>Release of Official Merit Admission List</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tuition & Fee Schedule Transparency */}
        <section className="fee-schedule-section">
          <div className="section-heading text-center">
            <h2>Estimated Fee Structure & Transparency</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: '#64748b' }}>
              Statutory tuition, clinical levies, and laboratory fees approved by the Abia State Ministry of Health.
            </p>
          </div>

          <div className="fee-comparison-cards">
            <div className="fee-card">
              <span className="fee-plan">Year 1 (Fresh Students)</span>
              <p className="fee-amount">₦150,000 / session</p>
              <ul className="fee-breakdown">
                <li>Tuition & Lecture Levies</li>
                <li>Clinical Skills Simulation Lab</li>
                <li>Library & Digital ICT Access</li>
                <li>Student Identity Card & Insurance</li>
                <li>NMCN Indexing & Examination Fee</li>
              </ul>
            </div>

            <div className="fee-card popular">
              <span className="popular-tag">Returning Students</span>
              <span className="fee-plan">Year 2 & Year 3</span>
              <p className="fee-amount">₦120,000 / session</p>
              <ul className="fee-breakdown">
                <li>Tuition & Practicum Levies</li>
                <li>Hospital Ward Posting Rotations</li>
                <li>Library & Electronic Journals</li>
                <li>Semester Examination Assessments</li>
                <li>Clinical Preceptor Mentorship</li>
              </ul>
            </div>

            <div className="fee-card">
              <span className="fee-plan">Post-Basic Students</span>
              <p className="fee-amount">₦140,000 / session</p>
              <ul className="fee-breakdown">
                <li>Advanced Clinical Modules</li>
                <li>Specialist Hospital Rotations</li>
                <li>Research & Thesis Mentorship</li>
                <li>Professional Licensing Review</li>
                <li>Final Council Certification</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Help & Portal Link */}
        <section className="admissions-help-card">
          <div>
            <h3>Have Questions About Admissions?</h3>
            <p>Our admissions desk is available Monday through Friday (8:00 AM – 4:00 PM) to assist you.</p>
          </div>
          <div className="admissions-help-buttons">
            <Link to="/faqs" className="btn-white-outline">
              Read Admissions FAQs
            </Link>
            <Link to="/contact" className="btn-green-arrow">
              Contact Admissions Desk <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
