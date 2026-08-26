import eventsHero from "../assets/img/Events.png";
import contactHero from "../assets/img/Contact Us.png";
import faqsHero from "../assets/img/FAQs.png";

// Keep page copy in one replaceable module so an admin API can supply this shape later.
export const innerPageData = {
  events: {
    title: "Events",
    description:
      "Stay connected with conferences, workshops, seminars, ceremonies, sporting activities, and important academic events across all ABSCONS campuses.",
    heroImage: eventsHero,
    featured: {
      category: "Conference",
      title: "2026 Nursing Leadership Conference",
      date: "20 August 2026",
      time: "9:00 AM",
      location: "Main Auditorium, Aba Campus",
      description:
        "Bringing together healthcare professionals, educators and nursing students to discuss leadership, innovation and the future of nursing practice.",
    },
    items: [
      {
        month: "JUN",
        day: "16",
        category: "Workshop",
        title: "Basic Life Support Workshop",
        time: "10:00 AM",
        location: "Skills Lab, Umuahia Campus",
        description:
          "Hands-on training session on BLS techniques and emergency response.",
      },
      {
        month: "JUL",
        day: "02",
        category: "Orientation",
        title: "New Student Orientation 2026",
        time: "9:00 AM",
        location: "Main Hall, Aba Campus",
        description: "Orientation programme for newly admitted students and parents.",
      },
      {
        month: "JUL",
        day: "15",
        category: "Seminar",
        title: "Research & Evidence Based Practice Seminar",
        time: "11:00 AM",
        location: "ICT Hall, Afikpo Campus",
        description:
          "Seminar on research methods and evidence based practice in nursing.",
      },
      {
        month: "AUG",
        day: "05",
        category: "Sports",
        title: "Inter-Campus Sports Competition",
        time: "8:00 AM",
        location: "Sports Complex, Umuahia",
        description:
          "Annual sporting event featuring team competitions across all campuses.",
      },
    ],
  },
  contact: {
    title: "Contact Us",
    description:
      "We're here to answer your questions and help you take the next step toward your nursing career.",
    heroImage: contactHero,
    intro: "Fill out the form and our team will get back to you as soon as possible.",
    departments: [
      {
        title: "Admissions Office",
        email: "admissions@abscons.edu.ng",
        phone: "+234 000 0000 000",
        color: "green",
      },
      {
        title: "Academic Affairs",
        email: "academic@abscons.edu.ng",
        phone: "+234 000 0000 001",
        color: "blue",
      },
      {
        title: "Student Affairs",
        email: "students@abscons.edu.ng",
        phone: "+234 000 0000 002",
        color: "purple",
      },
      {
        title: "ICT Support",
        email: "ict@abscons.edu.ng",
        phone: "+234 000 0000 003",
        color: "orange",
      },
    ],
  },
  faqs: {
    title: "FAQs",
    description:
      "Find answers to the most common questions about admissions, programmes, fees, campuses, and student life at ABSCONS.",
    heroImage: faqsHero,
    groups: [
      {
        title: "Admissions",
        items: [
          {
            question: "What programmes does ABSCONS offer?",
            answer:
              "ABSCONS offers National Diploma (ND) in Nursing Sciences and other approved nursing-related programmes.",
          },
          {
            question: "What is the JAMB cut-off mark for ABSCONS?",
            answer:
              "Cut-off marks and admission requirements are published with each admission cycle. Check the latest admissions announcement for the current session.",
          },
          {
            question: "Can I combine WAEC and NECO results?",
            answer:
              "Please confirm the accepted result combinations in the current admission requirements before applying.",
          },
        ],
      },
      {
        title: "Programmes",
        items: [
          {
            question: "How long is the Nursing programme?",
            answer:
              "Programme duration and requirements are published by the academic office for each approved programme.",
          },
        ],
      },
      {
        title: "Fees",
        items: [
          {
            question: "How much are the school fees?",
            answer:
              "Fee schedules are published for each session. Contact the bursary or admissions office for the current schedule.",
          },
        ],
      },
    ],
  },
};
