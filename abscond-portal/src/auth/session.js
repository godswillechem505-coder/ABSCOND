const SESSION_STORAGE_KEY = "abscons.portal.session";

export const getStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const hasStoredSession = () => Boolean(getStoredSession()?.token);

export const setStoredSession = (session) => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const createDemoStudentSession = (identifier) => ({
  token: "demo-student-session",
  createdAt: new Date().toISOString(),
  user: {
    name: "Adaeze Okoro",
    identifier,
    matricNumber: identifier,
    programme: "Basic Nursing",
    campus: "Umuahia Campus",
    level: "100",
  },
});
