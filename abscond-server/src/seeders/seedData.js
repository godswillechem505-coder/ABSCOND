import { STAFF_ROLES, USER_ROLES } from '../config/permissions.js';
import { connectDB, sequelize, syncDatabase } from '../config/database.js';
import {
  AcademicSession,
  Announcement,
  AuditLog,
  CalendarEntry,
  Campus,
  ClinicalPosting,
  ContactMessage,
  Course,
  Document,
  DownloadDocument,
  EmergencyContact,
  Event,
  Faq,
  FeeItem,
  FeeStructure,
  NextOfKin,
  Notification,
  Payment,
  Programme,
  Result,
  Semester,
  Student,
  User,
} from '../models/index.js';




const findOrCreateByUnique = async (model, where, defaults) => {
  const [record] = await model.findOrCreate({
    where,
    defaults: {
      ...where,
      ...defaults,
    },
  });

  return record;
};

const createSequentially = async (items) => {
  const records = [];

  for (const item of items) {
    records.push(await findOrCreateByUnique(item.model, item.where, item.defaults));
  }

  return records;
};

const seedCampuses = async () =>
  createSequentially([
    {
      model: Campus,
      where: { slug: 'aba' },
      defaults: {
        name: 'Aba Campus',
        code: 'ABA',
        city: 'Aba',
        address: 'Aba, Abia State',
      },
    },
    {
      model: Campus,
      where: { slug: 'amachara' },
      defaults: {
        name: 'Amachara Campus',
        code: 'AMA',
        city: 'Amachara',
        address: 'Amachara, Abia State',
      },
    },
    {
      model: Campus,
      where: { slug: 'umuahia' },
      defaults: {
        name: 'Umuahia Campus',
        code: 'UMU',
        city: 'Umuahia',
        address: 'Umuahia, Abia State',
      },
    },
    {
      model: Campus,
      where: { slug: 'abiriba' },
      defaults: {
        name: 'Abiriba Campus',
        code: 'ABI',
        city: 'Abiriba',
        address: 'Abiriba, Abia State',
      },
    },
  ]);

const seedProgrammes = async () =>
  createSequentially([
    {
      model: Programme,
      where: { slug: 'basic-nursing' },
      defaults: {
        name: 'Basic Nursing',
        code: 'BNUR',
        durationYears: 3,
        description:
          'Foundational nursing sciences programme for pre-service students.',
      },
    },
    {
      model: Programme,
      where: { slug: 'basic-midwifery' },
      defaults: {
        name: 'Basic Midwifery',
        code: 'BMID',
        durationYears: 3,
        description: 'Midwifery programme focused on maternal and newborn care.',
      },
    },
  ]);

const seedSessions = async () => {
  const currentSession = await findOrCreateByUnique(
    AcademicSession,
    { name: '2025/2026' },
    {
      startsOn: '2025-09-01',
      endsOn: '2026-08-31',
      isCurrent: true,
    },
  );

  await createSequentially([
    {
      model: Semester,
      where: {
        academicSessionId: currentSession.id,
        name: 'first',
      },
      defaults: {
        startsOn: '2025-09-01',
        endsOn: '2026-01-31',
        registrationOpensAt: '2025-09-01T08:00:00.000Z',
        registrationClosesAt: '2025-09-30T16:00:00.000Z',
        isActive: false,
      },
    },
    {
      model: Semester,
      where: {
        academicSessionId: currentSession.id,
        name: 'second',
      },
      defaults: {
        startsOn: '2026-02-01',
        endsOn: '2026-08-31',
        registrationOpensAt: '2026-02-01T08:00:00.000Z',
        registrationClosesAt: '2026-02-28T16:00:00.000Z',
        isActive: true,
      },
    },
  ]);

  return currentSession;
};

const seedCourses = async (programmes) => {
  const nursing = programmes.find((programme) => programme.slug === 'basic-nursing');
  const midwifery = programmes.find(
    (programme) => programme.slug === 'basic-midwifery',
  );

  const nursingFundamentals = await findOrCreateByUnique(
    Course,
    { code: 'NUR101' },
    {
      programmeId: nursing.id,
      title: 'Foundations of Nursing Practice',
      units: 3,
      level: '100',
      semester: 'first',
      type: 'core',
    },
  );

  await createSequentially([
    {
      model: Course,
      where: { code: 'ANA101' },
      defaults: {
        programmeId: nursing.id,
        title: 'Human Anatomy I',
        units: 3,
        level: '100',
        semester: 'first',
        type: 'core',
      },
    },
    {
      model: Course,
      where: { code: 'PHY101' },
      defaults: {
        programmeId: nursing.id,
        title: 'Human Physiology I',
        units: 3,
        level: '100',
        semester: 'first',
        type: 'core',
      },
    },
    {
      model: Course,
      where: { code: 'NUR102' },
      defaults: {
        programmeId: nursing.id,
        prerequisiteCourseId: nursingFundamentals.id,
        title: 'Medical-Surgical Nursing I',
        units: 4,
        level: '100',
        semester: 'second',
        type: 'core',
      },
    },
    {
      model: Course,
      where: { code: 'MID101' },
      defaults: {
        programmeId: midwifery.id,
        title: 'Foundations of Midwifery Practice',
        units: 3,
        level: '100',
        semester: 'first',
        type: 'core',
      },
    },
    {
      model: Course,
      where: { code: 'MID102' },
      defaults: {
        programmeId: midwifery.id,
        title: 'Maternal and Newborn Health I',
        units: 4,
        level: '100',
        semester: 'second',
        type: 'core',
      },
    },
  ]);
};

const seedUsers = async ({ campuses, programmes, currentSession }) => {
  const studentUser = await findOrCreateByUnique(
    User,
    { identifier: 'ABSCONS/2025/001' },
    {
      email: 'student001@abscons.edu.ng',
      password: 'Password123!',
      role: USER_ROLES.STUDENT,
    },
  );

  const studentProfile = await findOrCreateByUnique(
    Student,
    { matricNumber: 'ABSCONS/2025/001' },
    {
      userId: studentUser.id,
      campusId: campuses.find((campus) => campus.slug === 'umuahia').id,
      programmeId: programmes.find((programme) => programme.slug === 'basic-nursing')
        .id,
      firstName: 'Adaeze',
      lastName: 'Okoro',
      gender: 'female',
      phone: '+2348000000001',
      level: '100',
      admissionYear: 2025,
      currentSession: currentSession.name,
      status: 'active',
    },
  );

  // Add emergency contacts for student
  await createSequentially([
    {
      model: EmergencyContact,
      where: { studentId: studentProfile.id, isPrimary: true },
      defaults: {
        fullName: 'Okoro Ifeoma',
        relationship: 'Mother',
        phone: '+2348000000002',
        email: 'ifeoma.okoro@email.com',
        address: 'No. 5 Enugu Road, Umuahia, Abia State',
      },
    },
  ]);

  // Add next of kin
  await createSequentially([
    {
      model: NextOfKin,
      where: { studentId: studentProfile.id },
      defaults: {
        fullName: 'Okoro Chidi',
        relationship: 'Father',
        phone: '+2348000000003',
        email: 'chidi.okoro@email.com',
        address: 'No. 5 Enugu Road, Umuahia, Abia State',
        occupation: 'Banker',
      },
    },
  ]);

  // Add sample documents
  await createSequentially([
    {
      model: Document,
      where: { studentId: studentProfile.id, type: 'o-level-result' },
      defaults: {
        name: "Adaeze's WAEC Result",
        type: 'o-level-result',
        status: 'approved',
        fileUrl: '/documents/waec-result-001.pdf',
        fileName: 'waec-result-001.pdf',
        fileSize: 245000,
        mimeType: 'application/pdf',
        uploadedAt: new Date('2025-06-15'),
        verificationNotes: 'Verified against WAEC database',
        verifiedAt: new Date('2025-07-01'),
      },
    },
    {
      model: Document,
      where: { studentId: studentProfile.id, type: 'jamb-result' },
      defaults: {
        name: 'JAMB Score',
        type: 'jamb-result',
        status: 'approved',
        fileUrl: '/documents/jamb-result-001.pdf',
        fileName: 'jamb-result-001.pdf',
        fileSize: 180000,
        mimeType: 'application/pdf',
        uploadedAt: new Date('2025-06-20'),
        verificationNotes: 'Score confirmed: 258',
        verifiedAt: new Date('2025-07-05'),
      },
    },
    {
      model: Document,
      where: { studentId: studentProfile.id, type: 'passport-photo' },
      defaults: {
        name: 'Passport Photograph',
        type: 'passport-photo',
        status: 'approved',
        fileUrl: '/documents/passport-photo-001.jpg',
        fileName: 'passport-photo-001.jpg',
        fileSize: 85000,
        mimeType: 'image/jpeg',
        uploadedAt: new Date('2025-07-10'),
        verifiedAt: new Date('2025-07-12'),
      },
    },
    {
      model: Document,
      where: { studentId: studentProfile.id, type: 'admission-letter' },
      defaults: {
        name: 'Admission Letter',
        type: 'admission-letter',
        status: 'approved',
        fileUrl: '/documents/admission-letter-001.pdf',
        fileName: 'admission-letter-001.pdf',
        fileSize: 320000,
        mimeType: 'application/pdf',
        uploadedAt: new Date('2025-08-01'),
        verifiedAt: new Date('2025-08-02'),
      },
    },
    {
      model: Document,
      where: { studentId: studentProfile.id, type: 'medical-fitness' },
      defaults: {
        name: 'Medical Fitness Certificate',
        type: 'medical-fitness',
        status: 'pending',
        fileUrl: '/documents/medical-fitness-001.pdf',
        fileName: 'medical-fitness-001.pdf',
        fileSize: 210000,
        mimeType: 'application/pdf',
        uploadedAt: new Date('2025-08-18'),
      },
    },
  ]);

  await createSequentially([
    {
      model: User,
      where: { identifier: 'registry@abscons.edu.ng' },
      defaults: {
        email: 'registry@abscons.edu.ng',
        password: 'Password123!',
        role: USER_ROLES.STAFF,
        staffRole: STAFF_ROLES.REGISTRY,
      },
    },
    {
      model: User,
      where: { identifier: 'bursary@abscons.edu.ng' },
      defaults: {
        email: 'bursary@abscons.edu.ng',
        password: 'Password123!',
        role: USER_ROLES.STAFF,
        staffRole: STAFF_ROLES.BURSARY,
      },
    },
    {
      model: User,
      where: { identifier: 'academic@abscons.edu.ng' },
      defaults: {
        email: 'academic@abscons.edu.ng',
        password: 'Password123!',
        role: USER_ROLES.STAFF,
        staffRole: STAFF_ROLES.ACADEMIC_AFFAIRS,
      },
    },
    {
      model: User,
      where: { identifier: 'superadmin@abscons.edu.ng' },
      defaults: {
        email: 'superadmin@abscons.edu.ng',
        password: 'Password123!',
        role: USER_ROLES.SUPER_ADMIN,
      },
    },
  ]);
};

const seedFees = async ({ programmes, currentSession }) => {
  const nursing = programmes.find((programme) => programme.slug === 'basic-nursing');
  const midwifery = programmes.find(
    (programme) => programme.slug === 'basic-midwifery',
  );

  // 100 Level Basic Nursing Fee Structure
  const nursingStructure = await findOrCreateByUnique(
    FeeStructure,
    {
      academicSessionId: currentSession.id,
      programmeId: nursing.id,
      level: '100',
      semester: 'all',
    },
    {
      title: '100 Level Basic Nursing Compulsory Fees 2025/2026',
      dueDate: '2025-11-30',
      currency: 'NGN',
      totalAmount: 185000.0,
      status: 'published',
      description:
        'Standard annual fee structure for Year 1 Basic Nursing students including tuition, practical, and laboratory levies.',
    },
  );

  const nursingFeeItems = [
    { name: 'Tuition Fee', category: 'tuition', amount: 100000.0, isCompulsory: true },
    {
      name: 'Clinical & Practical Training',
      category: 'clinical',
      amount: 35000.0,
      isCompulsory: true,
    },
    { name: 'Laboratory Levy', category: 'laboratory', amount: 15000.0, isCompulsory: true },
    { name: 'Library Access & Journals', category: 'library', amount: 10000.0, isCompulsory: true },
    { name: 'ICT & Internet Levy', category: 'ict', amount: 10000.0, isCompulsory: true },
    { name: 'Student Welfare & Insurance', category: 'welfare', amount: 5000.0, isCompulsory: true },
    { name: 'Examination & Assessment', category: 'examination', amount: 10000.0, isCompulsory: true },
  ];

  for (const item of nursingFeeItems) {
    await findOrCreateByUnique(
      FeeItem,
      { feeStructureId: nursingStructure.id, name: item.name },
      item,
    );
  }

  // 100 Level Basic Midwifery Fee Structure
  const midwiferyStructure = await findOrCreateByUnique(
    FeeStructure,
    {
      academicSessionId: currentSession.id,
      programmeId: midwifery.id,
      level: '100',
      semester: 'all',
    },
    {
      title: '100 Level Basic Midwifery Compulsory Fees 2025/2026',
      dueDate: '2025-11-30',
      currency: 'NGN',
      totalAmount: 185000.0,
      status: 'published',
      description:
        'Standard annual fee structure for Year 1 Basic Midwifery students.',
    },
  );

  for (const item of nursingFeeItems) {
    await findOrCreateByUnique(
      FeeItem,
      { feeStructureId: midwiferyStructure.id, name: item.name },
      item,
    );
  }

  // Seed sample payment for student Adaeze Okoro
  const student = await Student.findOne({
    where: { matricNumber: 'ABSCONS/2025/001' },
  });
  const bursaryUser = await User.findOne({
    where: { identifier: 'bursary@abscons.edu.ng' },
  });

  if (student && bursaryUser) {
    await findOrCreateByUnique(
      Payment,
      { reference: 'ABSCONS-PAY-2025-001' },
      {
        studentId: student.id,
        feeStructureId: nursingStructure.id,
        academicSessionId: currentSession.id,
        semester: 'first',
        amount: 120000.0,
        currency: 'NGN',
        paymentMethod: 'bank_transfer',
        receiptNumber: 'REC-2025-00101',
        status: 'verified',
        paidAt: new Date('2025-09-12T10:30:00Z'),
        recordedBy: bursaryUser.id,
        notes: 'First installment payment via Polaris Bank transfer.',
      },
    );
  }
};

const seedClinicalPostings = async () => {
  const student = await Student.findOne({
    where: { matricNumber: 'ABSCONS/2025/001' },
  });

  if (student) {
    await findOrCreateByUnique(
      ClinicalPosting,
      { studentId: student.id, wardUnit: 'Male Medical Ward' },
      {
        hospitalName: 'Federal Medical Centre (FMC), Umuahia',
        wardUnit: 'Male Medical Ward',
        supervisorName: 'Matron E. N. Nwosu, RN/RM',
        supervisorContact: '+2348031234567',
        startDate: '2026-03-01',
        endDate: '2026-04-30',
        status: 'active',
        notes: 'General Medical Nursing Clinical Rotation. 8 weeks.',
      },
    );
  }
};

const seedAnnouncementsAndEvents = async ({ campuses }) => {
  const superAdmin = await User.findOne({
    where: { identifier: 'superadmin@abscons.edu.ng' },
  });

  await findOrCreateByUnique(
    Announcement,
    { title: '2025/2026 Academic Session Course Registration Notice' },
    {
      body: 'All returning and fresh students are reminded that online course registration for the second semester closes promptly at 11:59 PM on February 28, 2026. Ensure all fees are cleared with the Bursary department before submitting your course registration form.',
      excerpt: 'Second semester course registration window closes on February 28, 2026.',
      category: 'Academic',
      priority: 'urgent',
      isPinned: true,
      targetAudience: 'students',
      status: 'published',
      publishedAt: new Date('2026-02-01T08:00:00Z'),
      authorId: superAdmin?.id,
    },
  );

  await findOrCreateByUnique(
    Announcement,
    { title: 'Clinical Training Uniform & Equipment Guidelines' },
    {
      body: 'The Clinical Training Unit wishes to notify all Year 1 & 2 students regarding strict adherence to the prescribed clinical uniform and identification badges during hospital ward rounds.',
      excerpt: 'Mandatory clinical uniform guidelines for all nursing & midwifery students.',
      category: 'Clinical',
      priority: 'high',
      isPinned: false,
      targetAudience: 'students',
      status: 'published',
      publishedAt: new Date('2026-02-10T10:00:00Z'),
      authorId: superAdmin?.id,
    },
  );

  const umuahiaCampus = campuses.find((c) => c.slug === 'umuahia');

  await findOrCreateByUnique(
    Event,
    { title: '28th Matriculation Ceremony' },
    {
      description: 'Official matriculation ceremony for newly admitted students across all four campuses.',
      location: 'College Auditorium, Umuahia Main Campus',
      campusId: umuahiaCampus?.id,
      eventDate: '2026-03-15',
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      category: 'Ceremony',
      isFeatured: true,
      status: 'published',
      createdById: superAdmin?.id,
    },
  );

  await findOrCreateByUnique(
    Event,
    { title: 'Annual Nursing Sciences Research Symposium' },
    {
      description: 'Showcasing student and faculty clinical innovations in maternal and child healthcare.',
      location: 'Conference Hall, Aba Campus',
      campusId: campuses.find((c) => c.slug === 'aba')?.id,
      eventDate: '2026-04-20',
      startTime: '09:00 AM',
      endTime: '04:00 PM',
      category: 'Academic',
      isFeatured: false,
      status: 'published',
      createdById: superAdmin?.id,
    },
  );
};

const seedDownloads = async ({ currentSession }) => {
  const superAdmin = await User.findOne({
    where: { identifier: 'superadmin@abscons.edu.ng' },
  });

  await findOrCreateByUnique(
    DownloadDocument,
    { title: '2025/2026 Revised Academic Calendar' },
    {
      description: 'Official approved calendar of academic activities for all campuses.',
      category: 'academic',
      fileUrl: '/downloads/abscons-academic-calendar-2025-2026.pdf',
      fileName: 'abscons-academic-calendar-2025-2026.pdf',
      fileSize: 450000,
      academicSessionId: currentSession.id,
      status: 'published',
      uploadedBy: superAdmin?.id,
    },
  );

  await findOrCreateByUnique(
    DownloadDocument,
    { title: 'Student Handbook & Code of Conduct' },
    {
      description: 'Comprehensive guidelines on institutional rules, ethics, and examination conduct.',
      category: 'handbook',
      fileUrl: '/downloads/abscons-student-handbook.pdf',
      fileName: 'abscons-student-handbook.pdf',
      fileSize: 1200000,
      academicSessionId: currentSession.id,
      status: 'published',
      uploadedBy: superAdmin?.id,
    },
  );

  await findOrCreateByUnique(
    DownloadDocument,
    { title: 'Clinical Logbook Format & Guidelines' },
    {
      description: 'Standard template for logging patient procedures and clinical ward rotations.',
      category: 'academic',
      fileUrl: '/downloads/clinical-logbook-template.pdf',
      fileName: 'clinical-logbook-template.pdf',
      fileSize: 320000,
      academicSessionId: currentSession.id,
      status: 'published',
      uploadedBy: superAdmin?.id,
    },
  );
};

const seedFaqs = async () => {
  await findOrCreateByUnique(
    Faq,
    { question: 'How do I complete semester course registration?' },
    {
      answer: 'Log in to your Student Portal, click on Course Registration from the sidebar navigation, select your required core and elective courses within the allowed unit limits, and click Submit Registration.',
      category: 'portal',
      sortOrder: 1,
      isPublished: true,
    },
  );

  await findOrCreateByUnique(
    Faq,
    { question: 'What is the procedure for fee payment and receipt generation?' },
    {
      answer: 'Fees can be paid online via the Fees & Payments page using Remita/card, or manually via bank transfer/POS. For manual payments, present your bank teller or transaction receipt to the Bursary department for portal reconciliation.',
      category: 'fees',
      sortOrder: 2,
      isPublished: true,
    },
  );

  await findOrCreateByUnique(
    Faq,
    { question: 'What are the accredited programmes offered at ABSCONS?' },
    {
      answer: 'The college offers NMCN-accredited programmes including Basic Nursing, Basic Midwifery, Post-Basic Nursing, and Community Midwifery across its campuses in Aba, Amachara, Umuahia, and Abiriba.',
      category: 'programmes',
      sortOrder: 3,
      isPublished: true,
    },
  );
};

const seedContactMessages = async () => {
  await findOrCreateByUnique(
    ContactMessage,
    { email: 'chinedu.eze@gmail.com', subject: 'Inquiry regarding 2026/2027 Admissions' },
    {
      fullName: 'Chinedu Eze',
      phone: '+2348023456789',
      subject: 'Inquiry regarding 2026/2027 Admissions',
      message: 'Hello, I would like to inquire about the cutoff mark and application deadline for the Basic Midwifery programme for the upcoming academic session.',
      department: 'Admissions',
      status: 'new',
    },
  );

  await findOrCreateByUnique(
    ContactMessage,
    { email: 'amaka.nwanna@yahoo.com', subject: 'Transcript Verification Request' },
    {
      fullName: 'Amaka Nwanna',
      phone: '+2348056789012',
      subject: 'Transcript Verification Request',
      message: 'Kindly assist with the verification process for my official academic transcript from the Aba campus.',
      department: 'Registry',
      status: 'in_progress',
    },
  );
};

const seedAuditLogs = async () => {
  const superAdmin = await User.findOne({
    where: { identifier: 'superadmin@abscons.edu.ng' },
  });

  await findOrCreateByUnique(
    AuditLog,
    { action: 'SYSTEM_INITIALIZATION' },
    {
      userId: superAdmin?.id,
      userEmail: superAdmin?.email,
      action: 'SYSTEM_INITIALIZATION',
      resource: 'System',
      resourceId: 'ALL',
      details: JSON.stringify({ message: 'ABSCONS One initial system configuration and data seed.' }),
      ipAddress: '127.0.0.1',
    },
  );
};

const seedResults = async ({ currentSession }) => {
  const students = await Student.findAll();
  const courses = await Course.findAll();

  if (students.length === 0 || courses.length === 0) return;

  const demoScores = [
    { score: 84.0, grade: 'A', gradePoint: 5.0, units: 3 },
    { score: 76.5, grade: 'A', gradePoint: 5.0, units: 3 },
    { score: 68.0, grade: 'B', gradePoint: 4.0, units: 2 },
    { score: 62.0, grade: 'B', gradePoint: 4.0, units: 3 },
    { score: 55.0, grade: 'C', gradePoint: 3.0, units: 2 },
  ];

  for (const student of students) {
    for (let i = 0; i < Math.min(courses.length, 5); i++) {
      const course = courses[i];
      const scoreData = demoScores[i % demoScores.length];

      await findOrCreateByUnique(
        Result,
        {
          studentId: student.id,
          courseId: course.id,
          academicSessionId: currentSession.id,
          semester: 'first',
        },
        {
          score: scoreData.score,
          grade: scoreData.grade,
          gradePoint: scoreData.gradePoint,
          units: course.units || scoreData.units,
          status: 'published',
          enteredBy: 1,
          publishedAt: new Date(),
        },
      );
    }
  }
};

const seedCalendarEntries = async ({ currentSession }) => {
  const semesters = await Semester.findAll({
    where: { academicSessionId: currentSession.id },
    order: [['number', 'ASC']],
  });

  const firstSemester = semesters.find((s) => s.number === 1) || semesters[0];
  const secondSemester = semesters.find((s) => s.number === 2) || semesters[1];

  const calendarItems = [
    // --- 1st Semester Entries ---
    {
      title: 'Portal Course Registration & Fee Payment Window Opens',
      description: 'Online registration of courses and tuition fee installment clearance for all returning and freshman students across all campuses.',
      category: 'registration',
      startDate: '2025-10-15',
      endDate: '2025-11-15',
      startTime: '08:00',
      endTime: '23:59',
      location: 'Student Online Portal',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Freshmen Orientation & Induction Week',
      description: 'Comprehensive orientation programme for newly admitted Basic Nursing and Midwifery students.',
      category: 'general',
      startDate: '2025-10-20',
      endDate: '2025-10-24',
      startTime: '09:00',
      endTime: '15:00',
      location: 'Auditorium, Umuahia Main Campus',
      targetLevel: '100',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Commencement of 1st Semester Lectures',
      description: 'Formal start of classroom instruction, anatomy practicals, and foundational nursing science courses.',
      category: 'lectures',
      startDate: '2025-10-27',
      endDate: '2026-02-13',
      startTime: '08:00',
      endTime: '17:00',
      location: 'All Campuses (Aba, Amachara, Umuahia, Abiriba)',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Matriculation Ceremony for 2025/2026 Set',
      description: 'Official matriculation and capping ceremony for all admitted nursing & midwifery students.',
      category: 'matriculation',
      startDate: '2025-11-28',
      endDate: '2025-11-28',
      startTime: '10:00',
      endTime: '14:00',
      location: 'Convocation Arena, Umuahia Campus',
      targetLevel: '100',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: '1st Continuous Assessment (CA) Test Week',
      description: 'Mid-term continuous assessments and clinical skill station evaluations.',
      category: 'assessment',
      startDate: '2025-12-15',
      endDate: '2025-12-19',
      startTime: '09:00',
      endTime: '16:00',
      location: 'Designated Examination Halls',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Christmas & New Year Holiday Break',
      description: 'Statutory institutional break for students and academic staff.',
      category: 'break',
      startDate: '2025-12-22',
      endDate: '2026-01-04',
      startTime: '00:00',
      endTime: '23:59',
      location: 'All Campuses',
      targetLevel: 'all',
      isHoliday: true,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Resumption of Lectures & CA 2 Practical Tests',
      description: 'Resumption of lectures following holiday break and commencement of 2nd continuous assessment.',
      category: 'lectures',
      startDate: '2026-01-05',
      endDate: '2026-02-13',
      startTime: '08:00',
      endTime: '17:00',
      location: 'All Lecture Rooms & Labs',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Clinical Posting Block 1 (Hospital & PHC Rotations)',
      description: 'Mandatory clinical ward posting at Abia State University Teaching Hospital (ABSUTH) and Federal Medical Centre Umuahia.',
      category: 'clinical',
      startDate: '2026-01-12',
      endDate: '2026-02-27',
      startTime: '07:30',
      endTime: '16:30',
      location: 'ABSUTH Aba & FMC Umuahia Wards',
      targetLevel: '200,300',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Late Course Registration Deadline & Portal Closes',
      description: 'Final closure of portal registration for 1st semester. Penalty fees apply after this date.',
      category: 'registration',
      startDate: '2026-02-28',
      endDate: '2026-02-28',
      startTime: '23:59',
      endTime: '23:59',
      location: 'Online Portal',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: 'Revision & OSCE Practical Demonstration Week',
      description: 'Intensive revision lectures, tutorial consultations, and OSCE practical rehearsal for upcoming semester exams.',
      category: 'revision',
      startDate: '2026-03-02',
      endDate: '2026-03-06',
      startTime: '09:00',
      endTime: '16:00',
      location: 'All Campuses',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: '1st Semester Examinations (Written & Practical OSCE)',
      description: 'Semester theoretical examinations and Objective Structured Clinical Examinations (OSCE).',
      category: 'examination',
      startDate: '2026-03-09',
      endDate: '2026-03-27',
      startTime: '08:30',
      endTime: '17:00',
      location: 'College Examination Halls',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },
    {
      title: '1st Semester Vacation & Inter-Semester Break',
      description: 'Three weeks vacation for students; grading and results compilation by Academic Board.',
      category: 'break',
      startDate: '2026-03-30',
      endDate: '2026-04-19',
      startTime: '00:00',
      endTime: '23:59',
      location: 'All Campuses',
      targetLevel: 'all',
      isHoliday: true,
      academicSessionId: currentSession.id,
      semesterId: firstSemester?.id,
    },

    // --- 2nd Semester Entries ---
    {
      title: 'Commencement of 2nd Semester Lectures & Registration',
      description: 'Beginning of second semester academic activities and course enrollments.',
      category: 'lectures',
      startDate: '2026-04-20',
      endDate: '2026-07-24',
      startTime: '08:00',
      endTime: '17:00',
      location: 'All Campuses',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: secondSemester?.id,
    },
    {
      title: 'Clinical Posting Block 2 (Maternity & Paediatric Ward Rotations)',
      description: 'Specialized clinical postings in Labor Wards, Neonatal ICU, and Community Health Outreach centres.',
      category: 'clinical',
      startDate: '2026-05-04',
      endDate: '2026-06-19',
      startTime: '07:30',
      endTime: '16:00',
      location: 'General Hospital Aba & FMC Umuahia',
      targetLevel: '200,300',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: secondSemester?.id,
    },
    {
      title: 'Final Qualifying Professional Examinations & Semester Exams',
      description: 'Nursing & Midwifery Council qualifying mock exams and 2nd Semester college examinations.',
      category: 'examination',
      startDate: '2026-06-15',
      endDate: '2026-07-03',
      startTime: '08:30',
      endTime: '17:00',
      location: 'College Examination Centers',
      targetLevel: 'all',
      isHoliday: false,
      academicSessionId: currentSession.id,
      semesterId: secondSemester?.id,
    },
    {
      title: 'Long Vacation & Annual Semester Break',
      description: 'End of 2025/2026 academic session; preparation for 2026/2027 admissions.',
      category: 'break',
      startDate: '2026-07-06',
      endDate: '2026-09-04',
      startTime: '00:00',
      endTime: '23:59',
      location: 'All Campuses',
      targetLevel: 'all',
      isHoliday: true,
      academicSessionId: currentSession.id,
      semesterId: secondSemester?.id,
    },
  ];

  for (const item of calendarItems) {
    await findOrCreateByUnique(
      CalendarEntry,
      {
        title: item.title,
        academicSessionId: item.academicSessionId,
      },
      item
    );
  }
};

const seedNotifications = async () => {
  const users = await User.findAll({
    where: { role: 'student' },
  });

  if (users.length === 0) return;

  const demoNotifications = [
    {
      type: 'result',
      title: '1st Semester Results Approved & Published',
      message: 'Your First Semester examination results for 2025/2026 have been approved by the Academic Board and released to your portal.',
      link: '/portal/results',
      isRead: false,
    },
    {
      type: 'fee',
      title: 'Session Tuition Fee Invoice Available',
      message: 'Official session fee breakdown and e-invoice for the 2025/2026 academic session has been generated by the Bursary Department.',
      link: '/portal/fees',
      isRead: false,
    },
    {
      type: 'academic',
      title: 'Online Course Registration Window Active',
      message: 'Course registration for the current semester is ongoing. Please confirm your course selections and unit totals before the deadline.',
      link: '/portal/course-registration',
      isRead: true,
      readAt: new Date(Date.now() - 3600 * 24 * 1000),
    },
    {
      type: 'clinical',
      title: 'Clinical Posting Duty Roster Assigned',
      message: 'Your hospital ward posting assignment at Federal Medical Centre Umuahia has been published by the Clinical Training Unit.',
      link: '/portal/calendar',
      isRead: false,
    },
    {
      type: 'announcement',
      title: 'Updated College Academic Calendar Available',
      message: 'The official 2025/2026 academic calendar with updated examination dates and OSCE schedule has been published.',
      link: '/portal/calendar',
      isRead: true,
      readAt: new Date(Date.now() - 3600 * 48 * 1000),
    },
  ];

  for (const user of users) {
    for (const notif of demoNotifications) {
      await findOrCreateByUnique(
        Notification,
        {
          userId: user.id,
          title: notif.title,
        },
        {
          ...notif,
          userId: user.id,
        }
      );
    }
  }
};

const seed = async () => {
  await connectDB();
  await syncDatabase();

  const campuses = await seedCampuses();
  const programmes = await seedProgrammes();
  const currentSession = await seedSessions();

  await seedCourses(programmes);
  await seedUsers({ campuses, programmes, currentSession });
  await seedFees({ programmes, currentSession });
  await seedResults({ currentSession });
  await seedCalendarEntries({ currentSession });
  await seedNotifications();
  await seedClinicalPostings();
  await seedAnnouncementsAndEvents({ campuses });
  await seedDownloads({ currentSession });
  await seedFaqs();
  await seedContactMessages();
  await seedAuditLogs();

  console.log('Seed data ready.');
};

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });



