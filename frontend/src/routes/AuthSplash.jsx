import React from 'react';
import '../auth/Auth.css';

export default function AuthSplash() {
  return (
    <div className="auth-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-bg-grid" />
      <span className="auth-spinner" style={{ width: '28px', height: '28px' }} />
    </div>
  );
}
