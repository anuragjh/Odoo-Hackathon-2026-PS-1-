/**
 * Badge — unified status badge component
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
import React from 'react';

const variantMap = {
  success: 'af-badge af-badge-success',
  warning: 'af-badge af-badge-warning',
  danger:  'af-badge af-badge-danger',
  info:    'af-badge af-badge-info',
  neutral: 'af-badge af-badge-neutral',
};

/**
 * Maps common status strings to badge variants automatically.
 * Override by passing explicit `variant` prop.
 */
const STATUS_VARIANT_MAP = {
  'active':              'success',
  'available':           'success',
  'verified':            'success',
  'resolved':            'success',
  'completed':           'success',
  'approved':            'success',
  'ongoing':             'info',
  'upcoming':            'info',
  'in progress':         'info',
  'technician assigned': 'info',
  'allocated':           'info',
  'reserved':            'info',
  'pending':             'warning',
  'requested':           'warning',
  'under maintenance':   'warning',
  'inactive':            'neutral',
  'none':                'neutral',
  'fair':                'warning',
  'lost':                'danger',
  'damaged':             'danger',
  'disposed':            'danger',
  'retired':             'neutral',
  'overdue':             'danger',
};

export function statusVariant(status = '') {
  return STATUS_VARIANT_MAP[status.toLowerCase()] ?? 'neutral';
}

export default function Badge({ children, variant, className = '' }) {
  const resolvedVariant = variant ?? statusVariant(String(children));
  const cls = variantMap[resolvedVariant] ?? variantMap.neutral;
  return (
    <span className={`${cls} ${className}`}>
      {children}
    </span>
  );
}
