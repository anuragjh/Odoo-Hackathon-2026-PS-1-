import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import './data-states.css';

export function Loading({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
      <Loader2 size={18} className="af-spin" />
      <span style={{ fontSize: '0.8125rem' }}>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '2.5rem', textAlign: 'center' }}>
      <AlertCircle size={22} color="var(--danger)" />
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{message || 'Something went wrong.'}</span>
      {onRetry && (
        <button className="af-btn af-btn-secondary neu-btn" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'No records found.', children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <Inbox size={22} />
      <span style={{ fontSize: '0.8125rem' }}>{message}</span>
      {children}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius, 10px)', ...style }}>
      {children}
    </div>
  );
}

export function DataTable({ columns, rows, renderRow, empty = 'No records found.' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border-default)', whiteSpace: 'nowrap' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{empty}</td>
            </tr>
          ) : (
            rows.map(renderRow)
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Td({ children, style }) {
  return (
    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  );
}

export function Field({ label, children, required, error, full }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', gridColumn: full ? '1 / -1' : 'auto' }}>
      {label && (
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {children}
      {error && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

const controlStyle = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  background: 'var(--bg-base)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
  outline: 'none',
};

export function Input(props) {
  return <input {...props} style={{ ...controlStyle, ...(props.style || {}) }} />;
}

export function Select({ children, ...props }) {
  return <select {...props} style={{ ...controlStyle, ...(props.style || {}) }}>{children}</select>;
}

export function Textarea(props) {
  return <textarea {...props} style={{ ...controlStyle, minHeight: '72px', resize: 'vertical', ...(props.style || {}) }} />;
}

export function PrimaryButton({ children, ...props }) {
  return (
    <button {...props} className="af-btn af-btn-primary neu-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.8125rem', ...(props.style || {}) }}>
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }) {
  return (
    <button {...props} className="af-btn af-btn-secondary neu-btn" style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem', ...(props.style || {}) }}>
      {children}
    </button>
  );
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return String(value);
  }
}

export function toLabel(value) {
  if (!value) return '—';
  return String(value)
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
