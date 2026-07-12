import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerOrganization } from '../services/authService';
import './Auth.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Singapore',
  'Asia/Tokyo', 'Europe/London', 'Europe/Paris', 'America/New_York',
  'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney', 'UTC',
];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'BDT', 'JPY', 'AUD'];
const STEPS = [
  { label: 'Organization',  icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { label: 'Admin Account', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label: 'Review',        icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
];

const initOrg = {
  organizationName: '',
  email: '',
  phone: '',
  legalName: '',
  description: '',
  website: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
};

const initAdmin = {
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  confirmPassword: '',
};

// ── Field component ───────────────────────────────────────────────────────────
function Field({ id, label, required, error, hint, children }) {
  return (
    <div className={`auth-field${error ? ' auth-field--has-error' : ''}`}>
      {label && (
        <label className="auth-label" htmlFor={id}>
          {label} {required && <span className="auth-req">*</span>}
        </label>
      )}
      {children}
      {error ? <span className="auth-field-error">{error}</span>
             : hint ? <span className="auth-field-hint">{hint}</span> : null}
    </div>
  );
}

// ── Review row ────────────────────────────────────────────────────────────────
function RR({ label, value, muted }) {
  return (
    <div className="auth-review-row">
      <span className="auth-review-label">{label}</span>
      <span className={`auth-review-value ${muted ? 'auth-review-value--muted' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
function pwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const STR_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STR_CLS   = ['', 'auth-strength-bar--weak', 'auth-strength-bar--fair', 'auth-strength-bar--good', 'auth-strength-bar--strong'];

// ── Main component ─────────────────────────────────────────────────────────────
export default function OrgSignUp() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(0);
  const [org, setOrg]           = useState(initOrg);
  const [admin, setAdmin]       = useState(initAdmin);
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [submitErr, setSubmitErr] = useState('');

  // ── Handlers ──────────────────────────────────────────────────────────
  const setOrgF  = (e) => { setOrg({ ...org, [e.target.name]: e.target.value });   setErrors(p => ({ ...p, [e.target.name]: '' })); };
  const setAdmF  = (e) => { setAdmin({ ...admin, [e.target.name]: e.target.value }); setErrors(p => ({ ...p, [e.target.name]: '' })); setSubmitErr(''); };

  // ── Validation ────────────────────────────────────────────────────────
  const validateOrg = () => {
    const e = {};
    if (!org.organizationName.trim()) e.organizationName = 'Organization name is required';
    if (!org.email.trim() || !/\S+@\S+\.\S+/.test(org.email)) e.email = 'Valid email required';
    if (!org.city.trim())    e.city    = 'City is required';
    if (!org.country.trim()) e.country = 'Country is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateAdmin = () => {
    const e = {};
    if (!admin.adminName.trim()) e.adminName = 'Name is required';
    if (!admin.adminEmail.trim() || !/\S+@\S+\.\S+/.test(admin.adminEmail)) e.adminEmail = 'Valid email required';
    if (admin.adminPassword.length < 8) e.adminPassword = 'Minimum 8 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(admin.adminPassword))
      e.adminPassword = 'Include an uppercase, lowercase, number and special character';
    if (admin.adminPassword !== admin.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => {
    if (step === 0 && !validateOrg())   return;
    if (step === 1 && !validateAdmin()) return;
    setStep(s => Math.min(s + 1, 2));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setSubmitErr('');

    const payload = {
      organizationName: org.organizationName.trim(),
      email:            org.email.trim(),
      phone:            org.phone.trim() || undefined,
      legalName:        org.legalName.trim() || undefined,
      description:      org.description.trim() || undefined,
      website:          org.website.trim() || undefined,
      addressLine1:     org.addressLine1.trim() || undefined,
      addressLine2:     org.addressLine2.trim() || undefined,
      city:             org.city.trim(),
      state:            org.state.trim() || undefined,
      postalCode:       org.postalCode.trim() || undefined,
      country:          org.country.trim(),
      timezone:         org.timezone,
      currency:         org.currency,
      adminName:        admin.adminName.trim(),
      adminEmail:       admin.adminEmail.trim().toLowerCase(),
      adminPassword:    admin.adminPassword,
    };

    try {
      await registerOrganization(payload);
      navigate('/signin?org_created=1');
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
        const adminFields = ['adminName', 'adminEmail', 'adminPassword'];
        const erroredFields = Object.keys(err.fieldErrors);
        if (erroredFields.some((f) => !adminFields.includes(f))) {
          setStep(0);
        } else {
          setStep(1);
        }
        setSubmitErr('Please correct the highlighted fields.');
      } else {
        setSubmitErr(err.message || 'Registration failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const strength = pwdStrength(admin.adminPassword);

  // ── Input helper ──────────────────────────────────────────────────────
  const inp = (name, val, onChange, placeholder, extra = {}) => (
    <input
      id={name}
      name={name}
      value={val}
      onChange={onChange}
      placeholder={placeholder}
      className={`auth-input auth-input--plain ${errors[name] ? 'auth-input--error' : ''}`}
      {...extra}
    />
  );

  return (
    <div className="auth-root">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card auth-card--wide">
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

        {/* ── Stepper ────────────────────────────────────────────────────── */}
        <div className="auth-stepper">
          {STEPS.map((s, i) => (
            <div key={s.label}
              className={`auth-step ${i <= step ? 'auth-step--active' : ''} ${i < step ? 'auth-step--done' : ''}`}
            >
              <div className="auth-step-circle">
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : <span>{i + 1}</span>}
              </div>
              <span className="auth-step-label">{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className="auth-step-line">
                  <div className="auth-step-line-fill" style={{ width: i < step ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STEP 0 — Organization info
        ════════════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="auth-step-content">
            <div className="auth-header">
              <h1 className="auth-title">Set up your organization</h1>
              <p className="auth-subtitle">Tell us about your company — an organization code will be auto-generated</p>
            </div>

            <div className="auth-grid">
              {/* Organization name */}
              <Field id="organizationName" label="Organization name" required error={errors.organizationName}
                className="auth-field auth-field--full">
                {inp('organizationName', org.organizationName, setOrgF, 'AssetFlow Technologies Pvt Ltd')}
              </Field>

              {/* Org code notice */}
              <div className="auth-field auth-field--full">
                <div className="auth-notice">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Organization code will be <strong style={{ color: '#D4D4D8' }}>auto-generated</strong> by the system after registration.
                </div>
              </div>

              {/* Email */}
              <Field id="email" label="Contact email" required error={errors.email}>
                {inp('email', org.email, setOrgF, 'contact@company.com', { type: 'email' })}
              </Field>

              {/* Phone */}
              <Field id="phone" label="Phone number" error={errors.phone}>
                {inp('phone', org.phone, setOrgF, '+919876543210', { type: 'tel' })}
              </Field>

              {/* Legal name */}
              <Field id="legalName" label="Legal / registered name" error={errors.legalName}
                className="auth-field auth-field--full">
                {inp('legalName', org.legalName, setOrgF, 'AssetFlow Technologies Private Limited')}
              </Field>

              {/* Description */}
              <Field id="description" label="Description" error={errors.description}
                className="auth-field auth-field--full">
                {inp('description', org.description, setOrgF, 'Enterprise Asset & Resource Management Platform')}
              </Field>

              {/* Website */}
              <Field id="website" label="Website" error={errors.website}
                className="auth-field auth-field--full">
                {inp('website', org.website, setOrgF, 'https://assetflow.com', { type: 'url' })}
              </Field>

              <div className="auth-section-divider auth-field auth-field--full"><span>Address</span></div>

              {/* Address */}
              <Field id="addressLine1" label="Address line 1" error={errors.addressLine1}>
                {inp('addressLine1', org.addressLine1, setOrgF, 'Sector V, Salt Lake')}
              </Field>
              <Field id="addressLine2" label="Address line 2" error={errors.addressLine2}>
                {inp('addressLine2', org.addressLine2, setOrgF, '5th Floor, Tower A')}
              </Field>

              <Field id="city" label="City" required error={errors.city}>
                {inp('city', org.city, setOrgF, 'Kolkata')}
              </Field>
              <Field id="state" label="State / Province" error={errors.state}>
                {inp('state', org.state, setOrgF, 'West Bengal')}
              </Field>
              <Field id="postalCode" label="Postal code" error={errors.postalCode}>
                {inp('postalCode', org.postalCode, setOrgF, '700091')}
              </Field>
              <Field id="country" label="Country" required error={errors.country}>
                {inp('country', org.country, setOrgF, 'India')}
              </Field>

              <div className="auth-section-divider auth-field auth-field--full"><span>Locale</span></div>

              {/* Timezone */}
              <Field id="timezone" label="Timezone">
                <select id="timezone" name="timezone" className="auth-input auth-input--plain"
                  value={org.timezone} onChange={setOrgF}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>

              {/* Currency */}
              <Field id="currency" label="Currency">
                <select id="currency" name="currency" className="auth-input auth-input--plain"
                  value={org.currency} onChange={setOrgF}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 1 — Admin account
        ════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="auth-step-content">
            <div className="auth-header">
              <h1 className="auth-title">Admin account</h1>
              <p className="auth-subtitle">This account will have full administrative access to the organization</p>
            </div>

            <div className="auth-info-callout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>The admin account is the only account created with an elevated role. All other users sign up as Employees and are promoted by the admin.</span>
            </div>

            <div className="auth-form" style={{ gap: '1rem' }}>
              {/* Full name */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="adminName">Full name <span className="auth-req">*</span></label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input id="adminName" name="adminName" type="text"
                    className={`auth-input ${errors.adminName ? 'auth-input--error' : ''}`}
                    placeholder="John Doe" value={admin.adminName} onChange={setAdmF} />
                </div>
                {errors.adminName && <span className="auth-field-error">{errors.adminName}</span>}
              </div>

              {/* Admin email */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="adminEmail">Admin email <span className="auth-req">*</span></label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input id="adminEmail" name="adminEmail" type="email"
                    className={`auth-input ${errors.adminEmail ? 'auth-input--error' : ''}`}
                    placeholder="admin@company.com" value={admin.adminEmail} onChange={setAdmF} />
                </div>
                {errors.adminEmail && <span className="auth-field-error">{errors.adminEmail}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="adminPassword">Password <span className="auth-req">*</span></label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input id="adminPassword" name="adminPassword"
                    type={showPwd ? 'text' : 'password'}
                    className={`auth-input ${errors.adminPassword ? 'auth-input--error' : ''}`}
                    placeholder="Min. 8 characters" value={admin.adminPassword} onChange={setAdmF} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                    {showPwd
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {errors.adminPassword && <span className="auth-field-error">{errors.adminPassword}</span>}
                {admin.adminPassword && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.375rem' }}>
                    <div className="auth-strength-bars">
                      {[1,2,3,4].map(l => (
                        <div key={l} className={`auth-strength-bar ${l <= strength ? STR_CLS[strength] : ''}`} />
                      ))}
                    </div>
                    <span className="auth-strength-label">{STR_LABEL[strength] || 'Very weak'}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label className="auth-label" htmlFor="confirmPassword">Confirm password <span className="auth-req">*</span></label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </span>
                  <input id="confirmPassword" name="confirmPassword"
                    type={showCfm ? 'text' : 'password'}
                    className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                    placeholder="Re-enter password" value={admin.confirmPassword} onChange={setAdmF} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowCfm(v => !v)} tabIndex={-1}>
                    {showCfm
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            STEP 2 — Review
        ════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="auth-step-content">
            <div className="auth-header">
              <h1 className="auth-title">Review &amp; submit</h1>
              <p className="auth-subtitle">Double-check your details before creating the organization</p>
            </div>

            {submitErr && (
              <div className="auth-error" role="alert" style={{ marginBottom: '1rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {submitErr}
              </div>
            )}

            <div className="auth-review">
              {/* Organization */}
              <div className="auth-review-section">
                <div className="auth-review-section-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Organization
                </div>
                <div className="auth-review-grid">
                  <RR label="Name"      value={org.organizationName} />
                  <RR label="Org Code"  value="Auto-generated after registration" muted />
                  <RR label="Email"     value={org.email} />
                  {org.phone      && <RR label="Phone"     value={org.phone} />}
                  {org.legalName  && <RR label="Legal name" value={org.legalName} />}
                  {org.website    && <RR label="Website"   value={org.website} />}
                  {org.description && <RR label="Description" value={org.description} />}
                  <RR label="Location"  value={[org.city, org.state, org.country].filter(Boolean).join(', ')} />
                  {org.postalCode && <RR label="Postal"    value={org.postalCode} />}
                  <RR label="Timezone"  value={org.timezone} />
                  <RR label="Currency"  value={org.currency} />
                </div>
              </div>

              {/* Admin */}
              <div className="auth-review-section">
                <div className="auth-review-section-title">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Administrator
                </div>
                <div className="auth-review-grid">
                  <RR label="Name"     value={admin.adminName} />
                  <RR label="Email"    value={admin.adminEmail} />
                  <RR label="Password" value="••••••••" />
                  <RR label="Role"     value="Admin" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <div className="auth-nav">
          {step > 0 ? (
            <button type="button" className="auth-nav-back" onClick={back} id="org-back-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          ) : (
            <Link to="/get-started" className="auth-nav-back" style={{ textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </Link>
          )}
          <div style={{ flex: 1 }} />
          {step < 2 ? (
            <button type="button" className="auth-submit" onClick={next} id="org-next-btn">
              Continue
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ) : (
            <button type="button" className="auth-submit" onClick={handleSubmit} disabled={loading} id="org-submit-btn">
              {loading ? <span className="auth-spinner" /> : (
                <>
                  Create organization
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        <p className="auth-switch" style={{ marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link to="/signin" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
