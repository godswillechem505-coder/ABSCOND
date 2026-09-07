import { useCallback, useState, useEffect, useRef } from "react";
import { AuthContext } from "./authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const SESSION_KEY = "abscons_session";
const TOKENS_KEY = "abscons_tokens";
const PERSIST_KEY = "abscons_persist"; // tracks which storage is active

/**
 * Resolve the active storage backend.
 * When "Remember me" is checked we persist to localStorage (survives tab close).
 * Otherwise we use sessionStorage (cleared when the tab/browser closes).
 *
 * On init we check which backend was last used via a tiny localStorage flag.
 */
const getActiveStorage = () => {
  try {
    return localStorage.getItem(PERSIST_KEY) === "1"
      ? localStorage
      : sessionStorage;
  } catch {
    return sessionStorage;
  }
};

const initializeAuthState = () => {
  try {
    // Try localStorage first, then sessionStorage
    const lsSession = localStorage.getItem(SESSION_KEY);
    const ssSession = sessionStorage.getItem(SESSION_KEY);
    const raw = lsSession || ssSession;
    if (raw) {
      const parsed = JSON.parse(raw);
      return { user: parsed.user, permissions: parsed.permissions };
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
  return { user: null, permissions: null };
};

export function AuthProvider({ children }) {
  const { user: initialUser, permissions: initialPermissions } =
    initializeAuthState();
  const [user, setUser] = useState(initialUser);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logoutRef = useRef(null);

  // Define logout first as a ref so it can be used in other callbacks
  const logout = useCallback(() => {
    setUser(null);
    setPermissions(null);
    // Clear from both storages to be safe
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKENS_KEY);
    localStorage.removeItem(PERSIST_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKENS_KEY);
    setError(null);
  }, []);

  // Store logout in ref so it can be accessed in refreshAccessToken
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const saveSession = useCallback((sessionData, rememberMe = false) => {
    setUser(sessionData.user);
    setPermissions(sessionData.permissions);

    // Determine target storage
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear the opposite storage so we don't leave stale data
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem(SESSION_KEY);
    otherStorage.removeItem(TOKENS_KEY);

    // Persist the flag so getActiveStorage() knows where to look on refresh
    localStorage.setItem(PERSIST_KEY, rememberMe ? "1" : "0");

    storage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    storage.setItem(
      TOKENS_KEY,
      JSON.stringify({
        accessToken: sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
      }),
    );
  }, []);

  const login = useCallback(
    async (identifier, password, rememberMe = false, staffOnly = false) => {
      setLoading(true);
      setError(null);

      try {
        const loginPath = staffOnly ? "/admin/auth/login" : "/auth/login";
        const response = await fetch(`${API_URL}${loginPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password, rememberMe }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Login failed. Please check your credentials.",
          );
        }

        const sessionData = await response.json();
        saveSession(sessionData, rememberMe);
        return sessionData;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [saveSession],
  );

  const staffLogin = useCallback(
    (identifier, password, rememberMe = false) =>
      login(identifier, password, rememberMe, true),
    [login],
  );

  const refreshAccessToken = useCallback(async () => {
    try {
      const storage = getActiveStorage();
      const tokens = JSON.parse(storage.getItem(TOKENS_KEY) || "{}");
      if (!tokens.refreshToken) {
        throw new Error("No refresh token available.");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Session expired. Please login again.");
      }

      const { accessToken } = await response.json();
      tokens.accessToken = accessToken;
      storage.setItem(TOKENS_KEY, JSON.stringify(tokens));
      return accessToken;
    } catch (_err) {
      // Use ref to access logout without circular dependency
      if (logoutRef.current) {
        logoutRef.current();
      }
      throw _err;
    }
  }, []);

  const getAccessToken = useCallback(() => {
    const storage = getActiveStorage();
    const tokens = JSON.parse(storage.getItem(TOKENS_KEY) || "{}");
    return tokens.accessToken;
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        error,
        isAuthenticated,
        login,
        staffLogin,
        logout,
        refreshAccessToken,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
