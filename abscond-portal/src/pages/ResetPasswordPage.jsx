import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import { siteConfig } from '../data/homeData';
import loginImage from '../assets/clinical-training.jpg';

export default function ResetPasswordPage() {
  const { token: urlToken } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(urlToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Reset Password | ABSCONS Student Portal';
  }, []);

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
    }
  }, [urlToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('A valid password reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      await ApiClient.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="reset-heading">
        <Link to="/" className="login-brand">
          <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
          <span>
            <b>{siteConfig.brandName}</b>
            <small>{siteConfig.institutionName}</small>
          </span>
        </Link>

        <div className="login-copy">
          <span className="eyebrow">Portal Security</span>
          <h1 id="reset-heading">Set New Password</h1>
          <p>Choose a strong password with at least 6 characters.</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            ✕ {error}
          </div>
        )}

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                padding: '20px',
                color: '#065f46',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#047857' }}>
                ✓ Password Reset Successful!
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                Your account password has been updated. Redirecting to login page in 3 seconds...
              </p>
            </div>

            <div style={{ marginTop: '8px' }}>
              <Link to="/login" className="login-submit" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Proceed to Login Now →
              </Link>
            </div>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {!urlToken && (
              <label>
                Reset Token / Security Key
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste your reset token here"
                  required
                  disabled={isSubmitting}
                />
              </label>
            )}

            <label>
              New Password
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </label>

            <label>
              Confirm New Password
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 12px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show password
              </label>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
              style={{ marginTop: '6px' }}
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password & Login'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ fontSize: '13px', color: '#0047b3', fontWeight: '600' }}>
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </section>

      <aside
        className="login-aside"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(5, 21, 52, 0.88), rgba(0, 71, 179, 0.66)), url(${loginImage})`,
        }}
      >
        <div className="login-aside-content">
          <span className="eyebrow">ABSCONS Security</span>
          <h2>Protecting Your Student Identity</h2>
          <div className="login-feature-grid" aria-label="Security measures">
            <span>Bcrypt Hashing</span>
            <span>JWT Signatures</span>
            <span>Session Invalidation</span>
            <span>RBAC Verification</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
