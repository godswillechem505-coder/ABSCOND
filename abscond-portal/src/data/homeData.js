// Mock data prepared for future backend API integration (e.g. GET /api/announcements, GET /api/campuses, etc.)
import abiaLogo from '../assets/img/IMG_20260825_130301_533@556851714.jpg';
import abaImg from '../assets/img/IMG-20260825-WA0002.jpg';
import amacharaImg from '../assets/img/IMG-20260825-WA0005.jpg';
import abiribaImg from '../assets/img/IMG-20260825-WA0001.jpg';
import buildingImg from '../assets/hero-campus.jpg';
import libraryImg from '../assets/campus-library.jpg';
import clinicalImg from '../assets/clinical-training.jpg';
import studentsImg from '../assets/nursing-students.jpg';

export const siteConfig = {
  institutionName: "Abia State Ministry of Health",
  brandName: "ABSCONS One",
  tagline: "One Institution. One System. Endless possibilities",
  description: "The unified digital platform for the Abia State College of Nursing Sciences",
  logo: abiaLogo,
  contact: {
    address: "P.M.B.7160, Aba, Abia State, Nigeria",
    phone: "+234 000 0000 000",
    email: "info@abscons.edu.ng"
  }
};

export const aboutData = {
  title: "About ABSCONS",
  paragraphs: [
    "The Abia State College of Nursing Sciences is committed to developing highly skilled, ethical, and compassionate healthcare professionals through quality education, practical clinical experience, and innovation.",
    "ABSCONS One connects prospective and current students with the information and services they need throughout their academic journey."
  ],
  buttonText: "Learn More About Us",
  image: buildingImg
};

export const announcementsData = [
  {
    id: 1,
    title: "Academic Calendar for 2026/2027 Session Available",
    date: "May 12, 2026",
    link: "#calendar"
  },
  {
    id: 2,
    title: "Admission List Released",
    date: "May 12, 2026",
    link: "#admissions"
  },
  {
    id: 3,
    title: "Orientation Schedule For Fresh Students",
    date: "May 12, 2026",
    link: "#orientation"
  }
];

export const campusesData = [
  {
    id: "aba",
    name: "College of Nursing Sciences, Aba",
    programs: ["Nursing Program", "Midwifery Program"],
    motto: "Motto: Nurturing the Caring Hands",
    image: abaImg,
    badgeColor: "#0b57d0"
  },
  {
    id: "amachara",
    name: "College of Nursing Sciences, Amachara",
    programs: ["Nursing Program", "Midwifery Program"],
    motto: "Ministry of Health Amachara",
    image: amacharaImg,
    badgeColor: "#e65100"
  },
  {
    id: "umuahia",
    name: "College of Nursing Sciences, Umuahia",
    programs: ["Nursing Program", "Midwifery Program"],
    motto: "Federal Medical Centre Umuahia",
    image: libraryImg,
    badgeColor: "#00897b"
  },
  {
    id: "abiriba",
    name: "College of Nursing Sciences, Abiriba",
    programs: ["Midwifery Program"],
    motto: "Community Healthcare Excellence",
    image: abiribaImg,
    badgeColor: "#f57c00"
  }
];

export const whyChooseData = [
  {
    id: 1,
    title: "Accredited Programmes",
    description: "Approved by the Nursing & Midwifery Council of Nigeria and other regulatory bodies",
    iconType: "certificate",
    iconColor: "#22c55e",
    bgColor: "#f0fdf4"
  },
  {
    id: 2,
    title: "Experienced Faculty",
    description: "Learn from qualified and experienced educators committed to excellence",
    iconType: "faculty",
    iconColor: "#16a34a",
    bgColor: "#f0fdf4"
  },
  {
    id: 3,
    title: "Practical Clinical Training",
    description: "Gain hands-on experience in well-equipped health care facilities",
    iconType: "clinical",
    iconColor: "#0ea5e9",
    bgColor: "#f0fdf4"
  },
  {
    id: 4,
    title: "Student-Centered Learning",
    description: "Gain hands-on experience in well-equipped health care facilities",
    iconType: "student",
    iconColor: "#3b82f6",
    bgColor: "#f0fdf4"
  }
];

export const studentServicesData = [
  {
    id: "results",
    title: "Results",
    description: "Secure access to semester results and academic performance",
    icon: "results",
    accentColor: "#2563eb"
  },
  {
    id: "fees",
    title: "Fees",
    description: "View payment history and information",
    icon: "fees",
    accentColor: "#16a34a"
  },
  {
    id: "calendar",
    title: "Academic Calender",
    description: "Stay updated with important academic dates and events",
    icon: "calendar",
    accentColor: "#f59e0b"
  },
  {
    id: "ward-postings",
    title: "Ward Postings",
    description: "Know your clinical schedule and posting",
    icon: "postings",
    accentColor: "#9333ea"
  }
];

export const studentPortalFeatures = {
  title: "Student Portal",
  description: "Access everything you need as a student in one secure place.",
  featuresCol1: [
    "Check your results",
    "View fee status and payment history",
    "Access academic calendar"
  ],
  featuresCol2: [
    "View ward posting",
    "Receive important updates",
    "Download scheme of work"
  ],
  buttonText: "Login to Student Portal"
};

export const testimonialsData = [
  {
    id: 1,
    quote: "ABSCONS has given me the knowledge, confidence, and clinical experience to pursue my passion for nursing.",
    name: "Peace U.",
    level: "300 Level, Nursing",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    quote: "The College has provided me with a supportive learning environment where I can develop both the knowledge and practical skills I need to become a competent nurse.",
    name: "Favour Okafor",
    level: "300 Level, Nursing",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    quote: "What I appreciate most about the College is the commitment of the lecturers. They encourage us to work hard, ask questions, and take our nursing education seriously.",
    name: "Chiamaka Nwosu",
    level: "300 Level, Nursing",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    quote: "The learning environment encourages students to be dedicated, respectful, and compassionate. I am proud of the progress I have made since beginning my nursing education here.",
    name: "Adaeze Okorie",
    level: "200 Level, Nursing",
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80"
  }
];

export const newsData = [
  {
    id: 1,
    title: "ABSCONS Students Excel in State-wide Health Quiz",
    date: "May 5, 2025",
    image: studentsImg,
    link: "#news-1"
  },
  {
    id: 2,
    title: "BLS Training Day at ABSCONS",
    date: "August 15, 2025",
    image: libraryImg,
    link: "#news-2"
  },
  {
    id: 3,
    title: "Clinical Experience at ABSUTH",
    date: "November 12, 2025",
    image: clinicalImg,
    link: "#news-3"
  },
  {
    id: 4,
    title: "Clinical Experience at FMC Umuahia",
    date: "February 20, 2026",
    image: buildingImg,
    link: "#news-4"
  }
];

export const footerLinks = {
  quickLinks: [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Campuses", href: "#campuses" },
    { name: "Programmes", href: "#programmes" },
    { name: "News", href: "#news" }
  ],
  information: [
    { name: "Admission Requirements", href: "#admissions" },
    { name: "FAQs", href: "#faqs" },
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Use", href: "#terms" }
  ],
  studentServices: [
    { name: "Student Portal", href: "#portal" },
    { name: "Academic Calender", href: "#calendar" },
    { name: "Results", href: "#results" },
    { name: "Fees", href: "#fees" },
    { name: "Downloads", href: "#downloads" }
  ]
};
