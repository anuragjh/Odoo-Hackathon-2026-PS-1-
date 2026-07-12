/**
 * Notifications page — displays all notifications with read/unread state
 */
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { Bell, Check, CheckCheck } from 'lucide-react';

function Notifications() {
  const { notifications, setNotifications } = useContext(AppContext);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="af-page animate-slide-in-up">
      <PageHeader
        title="Notifications"
        subtitle="System alerts, asset updates, and action requests."
      >
        {unreadCount > 0 && (
          <button className="af-btn af-btn-secondary" onClick={markAllRead}>
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </PageHeader>

      <div className="af-card" style={{ overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div>
            {notifications.map((notif, i) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '1rem 1.25rem',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: notif.read ? 'transparent' : 'var(--accent-bg)',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Dot indicator */}
                <div style={{ marginTop: '4px', flexShrink: 0 }}>
                  {!notif.read ? (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--accent)',
                    }} />
                  ) : (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: 'var(--border-strong)',
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: notif.read ? 500 : 700,
                      color: 'var(--text-primary)',
                    }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {notif.time}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                </div>

                {!notif.read && (
                  <button
                    className="af-btn af-btn-ghost af-btn-icon"
                    onClick={() => markRead(notif.id)}
                    title="Mark as read"
                    style={{ flexShrink: 0, color: 'var(--accent)' }}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
