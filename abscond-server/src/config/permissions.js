export const USER_ROLES = Object.freeze({
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});

export const STAFF_ROLES = Object.freeze({
  REGISTRY: 'registry',
  BURSARY: 'bursary',
  ICT: 'ict',
  ACADEMIC_AFFAIRS: 'academic_affairs',
  CLINICAL_TRAINING: 'clinical_training',
  REGISTRAR: 'registrar',
});

export const PERMISSIONS = Object.freeze({
  VIEW_STUDENTS: 'students:view',
  MANAGE_STUDENTS: 'students:manage',
  VERIFY_DOCUMENTS: 'documents:verify',
  VIEW_FEES: 'fees:view',
  MANAGE_FEES: 'fees:manage',
  MANAGE_PAYMENTS: 'payments:manage',
  VIEW_RESULTS: 'results:view',
  MANAGE_RESULTS: 'results:manage',
  MANAGE_COURSES: 'courses:manage',
  MANAGE_REGISTRATION_WINDOWS: 'course_registration_windows:manage',
  MANAGE_CLINICAL_POSTINGS: 'clinical_postings:manage',
  MANAGE_CONTENT: 'content:manage',
  MANAGE_DOWNLOADS: 'downloads:manage',
  MANAGE_FAQS: 'faqs:manage',
  VIEW_CONTACT_MESSAGES: 'contact_messages:view',
  MANAGE_STAFF: 'staff:manage',
  VIEW_AUDIT_LOG: 'audit_log:view',
});

const rolePermissionMap = Object.freeze({
  [STAFF_ROLES.REGISTRY]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VERIFY_DOCUMENTS,
  ],
  [STAFF_ROLES.BURSARY]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_FEES,
    PERMISSIONS.MANAGE_FEES,
    PERMISSIONS.MANAGE_PAYMENTS,
  ],
  [STAFF_ROLES.ICT]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_DOWNLOADS,
    PERMISSIONS.VIEW_CONTACT_MESSAGES,
  ],
  [STAFF_ROLES.ACADEMIC_AFFAIRS]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.MANAGE_RESULTS,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.MANAGE_REGISTRATION_WINDOWS,
  ],
  [STAFF_ROLES.CLINICAL_TRAINING]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_CLINICAL_POSTINGS,
  ],
  [STAFF_ROLES.REGISTRAR]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.VERIFY_DOCUMENTS,
    PERMISSIONS.VIEW_FEES,
    PERMISSIONS.VIEW_RESULTS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MANAGE_DOWNLOADS,
    PERMISSIONS.MANAGE_FAQS,
    PERMISSIONS.VIEW_CONTACT_MESSAGES,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
});

export const getPermissionsForUser = (user) => {
  if (!user) {
    return [];
  }

  if (user.role === USER_ROLES.SUPER_ADMIN) {
    return Object.values(PERMISSIONS);
  }

  if (user.role === USER_ROLES.ADMIN) {
    return [
      ...new Set([
        ...Object.values(rolePermissionMap).flat(),
        PERMISSIONS.MANAGE_STAFF,
        PERMISSIONS.VIEW_AUDIT_LOG,
      ]),
    ];
  }

  if (user.role === USER_ROLES.STAFF && user.staffRole) {
    return rolePermissionMap[user.staffRole] || [];
  }

  return [];
};

export const hasPermission = (user, permission) =>
  getPermissionsForUser(user).includes(permission);

export const getRolePermissionMap = () => rolePermissionMap;
