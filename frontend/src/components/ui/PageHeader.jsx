/**
 * PageHeader — unified page title + subtitle + optional action slot
 */
import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="af-page-header">
      <div>
        <h1 className="af-page-title">{title}</h1>
        {subtitle && <p className="af-page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}
