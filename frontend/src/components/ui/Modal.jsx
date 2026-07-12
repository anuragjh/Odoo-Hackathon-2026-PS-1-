/**
 * Modal — portal-based modal overlay
 * Usage: <Modal open={bool} onClose={fn} title="…">content</Modal>
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = '480px', footer }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="af-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="af-modal" style={{ maxWidth }} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="af-modal-header">
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="af-modal-body">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="af-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
