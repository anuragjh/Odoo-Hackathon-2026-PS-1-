/**
 * Alert — dismissible banner for success, danger, warning, info
 */
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  danger:  XCircle,
  warning: AlertTriangle,
  info:    Info,
};

export default function Alert({ type = 'info', message, onDismiss }) {
  const Icon = ICONS[type] ?? Info;
  return (
    <div className={`af-alert af-alert-${type}`} style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600 }}>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="af-btn-ghost af-btn-icon"
          style={{ marginLeft: '0.5rem', padding: '0.2rem', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
