/**
 * ThemeToggle — Sun/Moon toggle button wired to AppContext
 */
import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useContext(AppContext);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--accent-bg)';
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.borderColor = 'var(--accent-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-elevated)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
