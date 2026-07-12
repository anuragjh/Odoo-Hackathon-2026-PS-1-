import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // ── Helpers ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (submitError) setSubmitError('');
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8)               score++;
    if (/[A-Z]/.test(pwd))             score++;
    if (/[0-9]/.test(pwd))             score++;
    if (/[^A-Za-z0-9]/.test(pwd))      score++;
    return score;
  };

  const validate = () => {
    const e = {};
    if (!form.organizationCode.trim())
      e.organizationCode = 'Organization code is required';
    if (!form.name.trim())
      e.name = 'Full name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Valid email address is required';
    if (form.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(form.phone))
      e.phone = 'Enter a valid phone number';
    if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    const payload = {
      organizationCode: form.organizationCode.trim().toUpperCase(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone.trim() || undefined,
    };

    try {
      // POST /auth/signup
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/signin?registered=1');
      } else {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Unable to reach server. Check your connection.');
    }
    setLoading(false);
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'auth-strength-bar--weak', 'auth-strength-bar--fair', 'auth-strength-bar--good', 'auth-strength-bar--strong'];

  return (
    <div className="auth-root">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card auth-card--signup">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2"  y="2"  width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="16" y="2"  width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="2"  y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
          <span className="auth-brand-name">AssetFlow</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join your organization on AssetFlow</p>
        </div>

        {/* Info callout */}
        <div className="auth-info-callout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Sign-up creates an <strong>Employee</strong> account only. Your admin assigns roles after approval.</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* ── Organization Code ─────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="organizationCode">
              Organization code <span className="auth-req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </span>
              <input
                id="organizationCode"
                name="organizationCode"
                type="text"
                className={`auth-input auth-input--mono ${errors.organizationCode ? 'auth-input--error' : ''}`}
                placeholder="e.g. ASSETFLOW001"
                value={form.organizationCode}
                onChange={handleChange}
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>
            {errors.organizationCode
              ? <span className="auth-field-error">{errors.organizationCode}</span>
              : <span className="auth-field-hint">Provided by your organization administrator</span>}
          </div>

          {/* ── Divider line ──────────────────────────────────────── */}
          <div className="auth-section-divider">
            <span>Personal details</span>
          </div>

          {/* ── Full Name ─────────────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-name">
              Full name <span className="auth-req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`auth-input ${errors.name ? 'auth-input--error' : ''}`}
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <span className="auth-field-error">{errors.name}</span>}
          </div>

          {/* ── Email ─────────────────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">
              Email address <span className="auth-req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                placeholder="john@company.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          {/* ── Phone ─────────────────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-phone">Phone number</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`auth-input ${errors.phone ? 'auth-input--error' : ''}`}
                placeholder="+8801712345678 (optional)"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
          </div>

          {/* ── Divider ───────────────────────────────────────────── */}
          <div className="auth-section-divider">
            <span>Set a password</span>
          </div>

          {/* ── Password ──────────────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">
              Password <span className="auth-req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label="Toggle password">
                {showPassword
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.password && <span className="auth-field-error">{errors.password}</span>}

            {/* Strength meter */}
            {form.password && (
              <div className="auth-strength-wrap" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.375rem' }}>
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div key={lvl} className={`auth-strength-bar ${lvl <= strength ? strengthColors[strength] : ''}`} />
                  ))}
                </div>
                <span className="auth-strength-label">{strengthLabels[strength] || 'Very weak'}</span>
              </div>
            )}
          </div>

          {/* ── Confirm Password ──────────────────────────────────── */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-confirm">
              Confirm password <span className="auth-req">*</span>
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} aria-label="Toggle confirm password">
                {showConfirm
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
          </div>

          {/* Global error */}
          {submitError && (
            <div className="auth-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {submitError}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading} id="signup-submit-btn">
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                Create account
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>already have an account?</span></div>

        <p className="auth-switch">
          <Link to="/signin" className="auth-link-block" id="signup-goto-signin">
            <span>Sign in to AssetFlow</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </p>

        <p className="auth-org-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Account requires admin approval before first login
        </p>
      </div>
    </div>
  );
}
