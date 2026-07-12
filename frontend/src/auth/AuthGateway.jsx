import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function AuthGateway() {
  const navigate = useNavigate();

  return (
    <div className="auth-root">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="gw-card">
        {/* Brand */}
        <div className="auth-brand" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
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

        <p className="gw-eyebrow">Enterprise Asset &amp; Resource Management</p>

        <h1 className="gw-title">How would you like<br />to get started?</h1>
        <p className="gw-subtitle">Choose an option below to continue</p>

        {/* ── 3 Option Cards ─────────────────────────────────────────────── */}
        <div className="gw-options">

          {/* Option 1 — Sign In */}
          <button
            className="gw-option"
            id="gw-signin"
            onClick={() => navigate('/signin')}
          >
            <div className="gw-option-icon gw-option-icon--signin">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <div className="gw-option-body">
              <span className="gw-option-title">Sign in</span>
              <span className="gw-option-sub">Access your existing AssetFlow account</span>
            </div>
            <div className="gw-option-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>

          {/* Option 2 — Employee Sign Up */}
          <button
            className="gw-option"
            id="gw-signup"
            onClick={() => navigate('/signup')}
          >
            <div className="gw-option-icon gw-option-icon--signup">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div className="gw-option-body">
              <span className="gw-option-title">Join as employee</span>
              <span className="gw-option-sub">Create an account to join your organization</span>
            </div>
            <div className="gw-option-badge">Employee</div>
          </button>

          {/* Divider */}
          <div className="gw-divider">
            <span>or set up a new workspace</span>
          </div>

          {/* Option 3 — Create Organization */}
          <button
            className="gw-option gw-option--org"
            id="gw-org-register"
            onClick={() => navigate('/org/register')}
          >
            <div className="gw-option-icon gw-option-icon--org">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="gw-option-body">
              <span className="gw-option-title">Create organization</span>
              <span className="gw-option-sub">Register a new company workspace on AssetFlow</span>
            </div>
            <div className="gw-option-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>

        </div>

        <p className="gw-footer">
          By continuing, you agree to AssetFlow's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
