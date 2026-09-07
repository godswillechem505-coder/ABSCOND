import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import { siteConfig } from '../data/homeData';
import loginImage from '../assets/clinical-training.jpg';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    document.title = 'Forgot Password | ABSCONS Student Portal';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessData(null);

    try {
      const data = await ApiClient.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      });
      setSuccessData(data);
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="forgot-heading">
        <Link to="/" className="login-brand">
          <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
          <span>
            <b>{siteConfig.brandName}</b>
            <small>{siteConfig.institutionName}</small>
          </span>
        </Link>

        <div className="login-copy">
          <span className="eyebrow">Account Recovery</span>
          <h1 id="forgot-heading">Forgot Password</h1>
          <p>Enter your Matric Number or Registered Email address to receive password reset instructions.</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            ✕ {error}
          </div>
        )}

        {successData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                padding: '16px',
                color: '#065f46',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#047857' }}>
                ✓ Recovery Instructions Issued
              </h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
                {successData.message}
              </p>
            </div>

            {successData.resetUrl && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #94a3b8',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '13px',
                }}
              >
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  🔑 Direct Reset Link (Demo / Testing Mode):
                </strong>
                <Link
                  to={successData.resetUrl.replace(/^https?:\/\/[^/]+/, '')}
                  style={{
                    color: '#0047b3',
                    fontWeight: '600',
                    wordBreak: 'break-all',
                    textDecoration: 'underline',
                  }}
                >
                  Click here to set your new password →
                </Link>
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <Link to="/login" className="login-submit" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Matric number or Email address
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="e.g. ABSCONS/2025/001 or student@abscons.edu.ng"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </label>

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
              style={{ marginTop: '8px' }}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Recovery Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login" style={{ fontSize: '13px', color: '#0047b3', fontWeight: '600' }}>
                ← Remember your password? Sign in
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
          <span className="eyebrow">ABSCONS One Security</span>
          <h2>Self-Service Credential Recovery</h2>
          <div className="login-feature-grid" aria-label="Security measures">
            <span>Encrypted Tokens</span>
            <span>Identity Verification</span>
            <span>Single Session Active</span>
            <span>Audit Trail</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
