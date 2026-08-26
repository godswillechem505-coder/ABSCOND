const initializeAuthState = () => {
  try {
    const session = localStorage.getItem("abscons_session");
    if (session) {
      const parsed = JSON.parse(session);
      return { user: parsed.user, permissions: parsed.permissions };
    }
  } catch {
    localStorage.removeItem("abscons_session");
  }
  return { user: null, permissions: null };
};
import { useCallback, useState, useEffect, useRef } from "react";
import { AuthContext } from "./authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function AuthProvider({ children }) {
  const { user: initialUser, permissions: initialPermissions } = initializeAuthState();
  const [user, setUser] = useState(initialUser);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logoutRef = useRef(null);

  // Define logout first as a ref so it can be used in other callbacks
  const logout = useCallback(() => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem("abscons_session");
    localStorage.removeItem("abscons_tokens");
    setError(null);
  }, []);

  // Store logout in ref so it can be accessed in refreshAccessToken
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const saveSession = useCallback((sessionData) => {
    setUser(sessionData.user);
    setPermissions(sessionData.permissions);
    localStorage.setItem("abscons_session", JSON.stringify(sessionData));
    localStorage.setItem(
      "abscons_tokens",
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
        saveSession(sessionData);
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
      const tokens = JSON.parse(localStorage.getItem("abscons_tokens") || "{}");
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
      localStorage.setItem("abscons_tokens", JSON.stringify(tokens));
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
    const tokens = JSON.parse(localStorage.getItem("abscons_tokens") || "{}");
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
