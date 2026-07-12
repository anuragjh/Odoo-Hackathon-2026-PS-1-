import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { ROUTES } from '../config/routes';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('This verification link is invalid or incomplete.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res?.message || 'Your email has been verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'We could not verify your email. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="auth-root">
      <div className="auth-bg-grid" />
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="16" y="2" width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="2" y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="white" fillOpacity="0.7" />
            </svg>
          </div>
          <span className="auth-brand-name">AssetFlow</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Email verification</h1>
          <p className="auth-subtitle">Confirming your AssetFlow account</p>
        </div>

        {status === 'verifying' && (
          <div className="auth-form" style={{ alignItems: 'center', padding: '1rem 0' }}>
            <span className="auth-spinner" style={{ width: '26px', height: '26px' }} />
          </div>
        )}

        {status === 'success' && (
          <div className="auth-success-banner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 12 15 16 9" />
            </svg>
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="auth-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {message}
          </div>
        )}

        <div className="auth-divider"><span>continue</span></div>

        <p className="auth-switch">
          <Link to={ROUTES.SIGN_IN} className="auth-link-block">
            <span>Go to sign in</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </p>
      </div>
    </div>
  );
}
