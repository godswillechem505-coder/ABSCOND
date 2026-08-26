import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { siteConfig } from "../data/homeData";
import loginImage from "../assets/clinical-training.jpg";

const getRedirectPath = (location) => {
  const from = location.state?.from;
  const nextPath = `${from?.pathname || ""}${from?.search || ""}${from?.hash || ""}`;

  return nextPath.startsWith("/portal") ? nextPath : "/portal";
};

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, login, loading, error: authError } = useAuth();
  const redirectPath = useMemo(() => getRedirectPath(location), [location]);
  const [identifier, setIdentifier] = useState("ABSCONS/2025/001");
  const [password, setPassword] = useState("Password123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Student Login | ABSCONS One";
  }, []);

  if (isAuthenticated && user?.role === "student") {
    return <Navigate to={redirectPath} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login(identifier.trim(), password, rememberMe);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || authError;

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-heading">
        <Link to="/" className="login-brand">
          <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
          <span>
            <b>{siteConfig.brandName}</b>
            <small>{siteConfig.institutionName}</small>
          </span>
        </Link>

        <div className="login-copy">
          <span className="eyebrow">Student Portal</span>
          <h1 id="login-heading">Sign in to continue</h1>
          <p>Use the matric number and password issued after registration.</p>
        </div>

        {displayError && (
          <div className="login-error" role="alert">
            {displayError}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Matric number
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="ABSCONS/2025/001"
              required
              disabled={isSubmitting || loading}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              disabled={isSubmitting || loading}
            />
          </label>

          <div className="login-form-row">
            <label className="remember-option">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                disabled={isSubmitting || loading}
              />
              Remember me
            </label>
            <a href="mailto:students@abscons.edu.ng">Forgot password?</a>
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>

      <aside
        className="login-aside"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5, 21, 52, 0.88), rgba(0, 71, 179, 0.66)), url(${loginImage})`,
        }}
      >
        <div className="login-aside-content">
          <span className="eyebrow">ABSCONS One</span>
          <h2>One Institution. One System.</h2>
          <div className="login-feature-grid" aria-label="Student portal shortcuts">
            <span>Academic Records</span>
            <span>Announcements</span>
            <span>Results</span>
            <span>Fees</span>
            <span>Calendar</span>
            <span>Downloads</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
