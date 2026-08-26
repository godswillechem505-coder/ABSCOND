import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import faqsHero from '../assets/img/FAQs.png';

const FALLBACK_FAQS = [
  {
    id: 1,
    question: 'How do I complete online semester course registration?',
    category: 'portal',
    answer:
      'Log in to the Student Portal with your Matric Number and password, click on "Course Registration" on the left navigation, select your registered programme and current level, mark the core and elective course units, and click "Submit Registration". Ensure all fees are verified by Bursary.',
  },
  {
    id: 2,
    question: 'What are the basic admission requirements for General Nursing?',
    category: 'admissions',
    answer:
      'Candidates must possess five (5) O-Level credit passes in WAEC, NECO, or NABTEB in English Language, Mathematics, Biology, Chemistry, and Physics in not more than two sittings, and attain a passing score in the ABSCONS Entrance Examination.',
  },
  {
    id: 3,
    question: 'How are manual bank payments verified and credited to my portal balance?',
    category: 'fees',
    answer:
      'After making a bank transfer or direct teller deposit to the official Abia State College of Nursing Sciences Polaris Bank account, bring your original stamped bank teller or transfer transaction receipt to the Bursary unit. Bursary staff will instantly reconcile and issue your verified digital receipt.',
  },
  {
    id: 4,
    question: 'What is the duration of the Basic Midwifery programme?',
    category: 'programmes',
    answer:
      'The Basic Midwifery programme is a 3-year full-time professional clinical programme accredited by the Nursing and Midwifery Council of Nigeria (NMCN), leading to the award of the Registered Midwife (RM) license.',
  },
  {
    id: 5,
    question: 'Where are the four collegiate campuses located?',
    category: 'campuses',
    answer:
      'ABSCONS operates four accredited campuses across Abia State: Aba Campus (School of Nursing Road, Aba), Amachara Main Campus (General Hospital Complex, Amachara), Umuahia Campus (FMC Bende Road, Umuahia), and Abiriba Campus (Agboji, Abiriba).',
  },
  {
    id: 6,
    question: 'How are clinical posting hospital rotations assigned?',
    category: 'student_life',
    answer:
      'The Directorate of Clinical Training assigns clinical hospital rotations based on your academic level and curriculum requirements. Clinical postings take place across accredited tertiary and secondary teaching hospitals, including FMC Umuahia, ABSUTH Aba, and General Hospital Amachara.',
  },
  {
    id: 7,
    question: 'Can I combine WAEC and NECO results for admission?',
    category: 'admissions',
    answer:
      'Yes, you may combine WAEC and NECO results across a maximum of two examination sittings, provided you meet the minimum requirement of five credits in the required science subjects (English, Maths, Biology, Chemistry, Physics).',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All FAQs' },
  { key: 'admissions', label: 'Admissions' },
  { key: 'programmes', label: 'Programmes' },
  { key: 'fees', label: 'Fees & Payments' },
  { key: 'portal', label: 'Student Portal' },
  { key: 'campuses', label: 'Campuses' },
  { key: 'student_life', label: 'Clinical & Student Life' },
];

export default function FaqsPage() {
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState(new Set([1, 2]));

  useEffect(() => {
    document.title = 'Frequently Asked Questions (FAQs) | ABSCONS One';
    ApiClient.get('/reference/faqs', {})
      .then((data) => {
        if (data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs);
          setOpenIds(new Set([data.faqs[0].id]));
        }
      })
      .catch(() => {});
  }, []);

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchCat = selectedCat === 'all' || f.category?.toLowerCase() === selectedCat.toLowerCase();
    const matchSearch =
      search.trim() === '' ||
      `${f.question} ${f.answer}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${faqsHero}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Help & Knowledge Center</p>
          <h2>Frequently Asked Questions</h2>
          <p>
            Find instant answers to common questions regarding admissions, accredited programmes, fees, clinical postings, and portal access.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Search Bar */}
        <section className="faq-search-hero-panel">
          <div className="faq-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              placeholder="Search by question, keyword, or topic (e.g., fees, registration, entry requirements)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* Two-Column Layout: Filter Chips + Accordion & Quick Help Sidebar */}
        <div className="faq-two-col-layout">
          {/* Main FAQ Content */}
          <div className="faq-main-content">
            {/* Category Filter Chips */}
            <div className="faq-category-pills">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  className={`filter-chip ${selectedCat === cat.key ? 'active' : ''}`}
                  onClick={() => setSelectedCat(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion Questions List */}
            <div className="faq-accordion-list">
              {filteredFaqs.map((faq) => {
                const isOpen = openIds.has(faq.id);
                return (
                  <article key={faq.id} className={`faq-accordion-card ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleAccordion(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="question-title-group">
                        <span className="faq-cat-tag">{faq.category}</span>
                        <h3>{faq.question}</h3>
                      </div>
                      <span className="accordion-toggle-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-drawer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}

              {filteredFaqs.length === 0 && (
                <div className="empty-state">
                  <p>No questions matched your search query. Try searching with different keywords.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Help & Department Directory Sidebar */}
          <aside className="faq-help-sidebar">
            <div className="help-box-card">
              <h3>Need Further Assistance?</h3>
              <p>Cannot find the answer you are looking for? Our student support and admissions desk is ready to help.</p>

              <div className="help-contacts-list">
                <div className="help-contact-item">
                  <strong>Admissions Desk</strong>
                  <a href="mailto:admissions@abscons.edu.ng">admissions@abscons.edu.ng</a>
                  <a href="tel:+2348031112220">+234 803 111 2220</a>
                </div>
                <div className="help-contact-item">
                  <strong>Academic & Results Office</strong>
                  <a href="mailto:academic@abscons.edu.ng">academic@abscons.edu.ng</a>
                </div>
                <div className="help-contact-item">
                  <strong>Bursary & Fee Inquiries</strong>
                  <a href="mailto:bursary@abscons.edu.ng">bursary@abscons.edu.ng</a>
                </div>
              </div>

              <Link to="/contact" className="btn-green-arrow" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                Send Direct Message <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="portal-prompt-card">
              <h4>Current Enrolled Student?</h4>
              <p>Log in to access your registered courses, exam results, and payment history.</p>
              <Link to="/login" className="btn-white-outline" style={{ display: 'block', textAlign: 'center', marginTop: '12px' }}>
                Login to Student Portal
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
