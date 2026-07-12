import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Play, Pause, Square, ShieldAlert,
  FolderPlus, CalendarPlus, Hammer, Laptop, Armchair, Car,
  Power, Clock
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

function DashboardOverview() {
  const {
    assets, bookings, maintenance, transfers, employees,
    registerAsset, createBooking, raiseMaintenance,
    theme,
  } = useContext(AppContext);

  // Quick Action Modal States
  const [registerModal, setRegisterModal] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(false);

  // Quick Action Forms States
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Electronics', serial: '', acqCost: '', location: '', isShared: false, condition: 'Excellent' });
  const [newBooking, setNewBooking] = useState({ assetId: '', date: '', startTime: '', endTime: '' });
  const [newMaint, setNewMaint] = useState({ assetId: '', issue: '', priority: 'Medium' });

  // Error/Success alerts
  const [actionAlert, setActionAlert] = useState(null);

  // Audit Session Timer
  const [seconds, setSeconds] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(24);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 59) {
            setMinutes((pm) => {
              if (pm === 59) { setHours((ph) => ph + 1); return 0; }
              return pm + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => { setIsTimerRunning(false); setHours(0); setMinutes(0); setSeconds(0); };
  const formatTimer = () =>
    `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

  // KPI Calculations
  const totalAssets         = assets.length;
  const availableCount      = assets.filter(a => a.status === 'Available').length;
  const allocatedCount      = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount    = assets.filter(a => a.status === 'Under Maintenance').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Requested').length;

  const currentDate  = new Date('2026-07-12');
  const overdueAssets = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturn) return false;
    return new Date(a.expectedReturn) < currentDate;
  });
  const overdueCount = overdueAssets.length;

  const allocationRate = totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0;

  // Chart Data
  const chartData = [
    { name: 'Mon', allocations: 4, maintenance: 2 },
    { name: 'Tue', allocations: 6, maintenance: 1 },
    { name: 'Wed', allocations: 8, maintenance: 3 },
    { name: 'Thu', allocations: 5, maintenance: 2 },
    { name: 'Fri', allocations: 9, maintenance: 4 },
    { name: 'Sat', allocations: 3, maintenance: 1 },
    { name: 'Sun', allocations: 2, maintenance: 0 },
  ];

  // Handlers
  const handleRegister = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serial) {
      setActionAlert({ type: 'danger', message: 'Name and Serial Number are required.' });
      return;
    }
    registerAsset({
      name: newAsset.name, category: newAsset.category,
      serial: newAsset.serial, acqDate: new Date().toISOString().split('T')[0],
      acqCost: Number(newAsset.acqCost) || 0,
      location: newAsset.location || 'Central Depot',
      isShared: newAsset.isShared, condition: newAsset.condition
    });
    setActionAlert({ type: 'success', message: 'Asset registered successfully!' });
    setRegisterModal(false);
    setNewAsset({ name: '', category: 'Electronics', serial: '', acqCost: '', location: '', isShared: false, condition: 'Excellent' });
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!newBooking.assetId || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
      setActionAlert({ type: 'danger', message: 'All booking fields are required.' });
      return;
    }
    const res = createBooking({ assetId: newBooking.assetId, date: newBooking.date, startTime: newBooking.startTime, endTime: newBooking.endTime });
    if (res.success) {
      setActionAlert({ type: 'success', message: 'Resource booked successfully!' });
      setBookingModal(false);
      setNewBooking({ assetId: '', date: '', startTime: '', endTime: '' });
    } else {
      setActionAlert({ type: 'danger', message: res.error });
    }
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    if (!newMaint.assetId || !newMaint.issue) {
      setActionAlert({ type: 'danger', message: 'Asset and issue description are required.' });
      return;
    }
    const res = raiseMaintenance({ assetId: newMaint.assetId, issue: newMaint.issue, priority: newMaint.priority });
    if (res.success) {
      setActionAlert({ type: 'success', message: 'Maintenance ticket raised successfully!' });
      setMaintenanceModal(false);
      setNewMaint({ assetId: '', issue: '', priority: 'Medium' });
    } else {
      setActionAlert({ type: 'danger', message: res.error });
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────
  const progress = seconds / 60;

  return (
    <div className="af-page animate-slide-in-up">

      {/* Alert Banner */}
      {actionAlert && (
        <Alert
          type={actionAlert.type}
          message={actionAlert.message}
          onDismiss={() => setActionAlert(null)}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Today's Overview"
        subtitle="Real-time enterprise asset and resource allocation metrics."
      >
        <button className="af-btn af-btn-secondary" onClick={() => setRegisterModal(true)}>
          <FolderPlus size={14} />
          Register Asset
        </button>
      </PageHeader>

      {/* Overdue Banner */}
      {overdueCount > 0 && (
        <div className="af-alert af-alert-danger" style={{ borderLeft: '3px solid var(--danger)' }}>
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 700 }}>
            {overdueCount} asset{overdueCount > 1 ? 's' : ''} overdue for return — flagged for follow-up
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="af-stat-card glass-card hover-lift stat-card-glow-success">
          <span className="af-stat-label">Available</span>
          <span className="af-stat-value">{availableCount}</span>
          <Badge variant="success">Ready</Badge>
        </div>
        <div className="af-stat-card glass-card hover-lift stat-card-glow-info">
          <span className="af-stat-label">Allocated</span>
          <span className="af-stat-value">{allocatedCount}</span>
          <Badge variant="info">Active</Badge>
        </div>
        <div className="af-stat-card glass-card hover-lift stat-card-glow-danger">
          <span className="af-stat-label">In Maintenance</span>
          <span className="af-stat-value">{maintenanceCount}</span>
          <Badge variant="warning">In Depot</Badge>
        </div>
        <div className="af-stat-card glass-card hover-lift stat-card-glow-info">
          <span className="af-stat-label">Active Bookings</span>
          <span className="af-stat-value">{activeBookingsCount}</span>
          <Badge variant="info">Scheduled</Badge>
        </div>
        <div className="af-stat-card glass-card hover-lift stat-card-glow-warning">
          <span className="af-stat-label">Pending Transfers</span>
          <span className="af-stat-value">{pendingTransfersCount}</span>
          <Badge variant="warning">Review</Badge>
        </div>
        <div className="af-stat-card glass-card hover-lift stat-card-glow-info">
          <span className="af-stat-label">Allocation Rate</span>
          <span className="af-stat-value">{allocationRate}%</span>
          <Badge variant="neutral">Total {totalAssets}</Badge>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        <button className="af-btn af-btn-primary neu-btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }} onClick={() => setRegisterModal(true)}>
          <FolderPlus size={14} />
          Register Asset
        </button>
        <button className="af-btn af-btn-secondary neu-btn" style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }} onClick={() => setBookingModal(true)}>
          <CalendarPlus size={14} />
          Book Resource
        </button>
        <button
          className="af-btn af-btn-danger neu-btn"
          style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}
          onClick={() => setMaintenanceModal(true)}
        >
          <Hammer size={14} />
          Raise Request
        </button>
      </div>

      {/* Recent Activity + Audit Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        {/* Recent Activity */}
        <div className="af-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {assets.slice(0, 5).map(asset => (
              <div
                key={asset.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'background 0.12s',
                  cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
                    {asset.category === 'Electronics' ? <Laptop size={13} style={{ color: 'var(--accent)' }} />
                      : asset.category === 'Furniture' ? <Armchair size={13} style={{ color: 'var(--accent)' }} />
                      : <Car size={13} style={{ color: 'var(--accent)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {asset.id} &bull; {asset.holder !== 'None' ? asset.holder : asset.location}
                    </div>
                  </div>
                </div>
                <Badge>{asset.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Neumorphic Dial Audit Clock */}
        <div className="audit-clock-card hover-lift">
          {/* Top Row: alarm indicator + sliding power toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Live Indicator Badge */}
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '4px 10px', 
              background: theme === 'light' ? '#cbd5e1' : '#27272a',
              borderRadius: '999px',
              border: theme === 'light' ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: theme === 'light' ? '1px 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Live</span>
            </div>

            {/* Sliding Toggle Power Switch */}
            <div 
              className={`neumorphic-switch${isTimerRunning ? ' active' : ''}`}
              onClick={toggleTimer}
            >
              <div className="neumorphic-switch-active-bg" />
              <span className="neumorphic-switch-label" style={{ 
                left: isTimerRunning ? '10px' : 'auto', 
                right: isTimerRunning ? 'auto' : '10px',
                fontSize: '0.625rem',
                lineHeight: '1'
              }}>
                {isTimerRunning ? 'On.' : 'Off'}
              </span>
              <div className="neumorphic-switch-knob">
                <Power size={11} style={{ transform: isTimerRunning ? 'none' : 'scale(0.9)' }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ marginTop: '0.875rem', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              Audit Clock
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Tracking session
            </div>
          </div>

          {/* SVG Arch Gauge */}
          <div style={{ position: 'relative', width: '100%', height: '145px', display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <svg width="220" height="145" viewBox="0 0 200 130" style={{ overflow: 'visible' }}>
              {/* Radial Ticks */}
              {Array.from({ length: 41 }).map((_, i) => {
                const angleDeg = -190 + (i * 200) / 40;
                const angleRad = (angleDeg * Math.PI) / 180;
                
                const r1 = 82; // outer radius
                const r2 = i % 5 === 0 ? 68 : 74; // major ticks (longer)
                
                const x1 = 100 + r1 * Math.cos(angleRad);
                const y1 = 100 + r1 * Math.sin(angleRad);
                const x2 = 100 + r2 * Math.cos(angleRad);
                const y2 = 100 + r2 * Math.sin(angleRad);
                
                const currentProgressIdx = Math.round(progress * 40);
                const isActiveTick = i <= currentProgressIdx;
                
                const strokeColor = isActiveTick 
                  ? 'var(--text-primary)' 
                  : (theme === 'light' ? '#cbd5e1' : '#27272a');
                const strokeWidth = i % 5 === 0 ? 1.5 : 1;
                
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    style={{ transition: 'stroke 0.2s' }}
                  />
                );
              })}

              {/* Dotted Inner Arc */}
              <path
                d={`M ${100 + 52 * Math.cos(-190 * Math.PI / 180)} ${100 + 52 * Math.sin(-190 * Math.PI / 180)} A 52 52 0 1 1 ${100 + 52 * Math.cos(10 * Math.PI / 180)} ${100 + 52 * Math.sin(10 * Math.PI / 180)}`}
                fill="none"
                stroke={theme === 'light' ? '#cbd5e1' : '#27272a'}
                strokeWidth="1"
                strokeDasharray="2 3"
              />

              {/* Dotted Indicator line for 30s center */}
              <line x1="100" y1="52" x2="100" y2="58" stroke={theme === 'light' ? '#94a3b8' : '#52525b'} strokeWidth="1" />

              {/* Labels on inner dotted boundary */}
              <text x="62" y="96" fill="var(--text-muted)" fontSize="8" fontWeight="700" textAnchor="middle">0s</text>
              <text x="100" y="47" fill="var(--text-muted)" fontSize="8" fontWeight="700" textAnchor="middle">30s</text>
              <text x="138" y="109" fill="var(--text-muted)" fontSize="8" fontWeight="700" textAnchor="middle">60s</text>

              {/* Indicator Needle */}
              {(() => {
                const needleAngleDeg = -190 + (progress * 200);
                const needleAngleRad = (needleAngleDeg * Math.PI) / 180;
                
                const nr1 = 86; // needle end
                const nr2 = 60; // needle start
                
                const nx1 = 100 + nr2 * Math.cos(needleAngleRad);
                const ny1 = 100 + nr2 * Math.sin(needleAngleRad);
                const nx2 = 100 + nr1 * Math.cos(needleAngleRad);
                const ny2 = 100 + nr1 * Math.sin(needleAngleRad);
                
                return (
                  <g>
                    <line
                      x1={nx1}
                      y1={ny1}
                      x2={nx2}
                      y2={ny2}
                      stroke="var(--accent)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      style={{ transition: 'all 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)' }}
                    />
                    <circle
                      cx={nx2}
                      cy={ny2}
                      r="2.5"
                      fill="var(--accent)"
                      stroke={theme === 'light' ? '#e2e8f0' : '#18181b'}
                      strokeWidth="1.2"
                      style={{ transition: 'all 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)' }}
                    />
                  </g>
                );
              })()}
            </svg>

            {/* Central Display: hours value + label */}
            <div style={{ 
              position: 'absolute', 
              top: '55%', 
              left: 0, 
              right: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              transform: 'translateY(-10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', height: '2.5rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: '1' }}>
                  {hours}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', marginLeft: '1px', verticalAlign: 'super', lineHeight: '1' }}>
                  h
                </span>
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>
                Hours Elapsed
              </div>
            </div>
          </div>

          {/* Bottom Display: ticking timer and reset control */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginTop: '0.75rem', 
            paddingTop: '0.75rem', 
            borderTop: theme === 'light' ? '1px solid #cbd5e1' : '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Elapsed Time</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
              </span>
            </div>
            
            {/* Reset Button */}
            <button
              onClick={resetTimer}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Reset Session Timer"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
            >
              <Square size={10} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="af-card" style={{ padding: '1.25rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Weekly Activity
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <RechartsBarChart data={chartData} barSize={10}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-primary)' }}
              cursor={{ fill: 'var(--bg-elevated)' }}
            />
            <Bar dataKey="allocations" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="maintenance" fill="var(--warning)" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────── */}

      {/* Register Asset */}
      <Modal open={registerModal} onClose={() => setRegisterModal(false)} title="Register New Asset">
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="af-label">Asset Name</label>
            <input type="text" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="e.g. MacBook Pro 14" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="af-label">Category</label>
              <select value={newAsset.category} onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicles">Vehicles</option>
              </select>
            </div>
            <div>
              <label className="af-label">Serial Number</label>
              <input type="text" value={newAsset.serial} onChange={e => setNewAsset({ ...newAsset, serial: e.target.value })} placeholder="e.g. SN-3928X" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="af-label">Acquisition Cost ($)</label>
              <input type="number" value={newAsset.acqCost} onChange={e => setNewAsset({ ...newAsset, acqCost: e.target.value })} placeholder="e.g. 1500" />
            </div>
            <div>
              <label className="af-label">Condition</label>
              <select value={newAsset.condition} onChange={e => setNewAsset({ ...newAsset, condition: e.target.value })}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>
          <div>
            <label className="af-label">HQ Location / Room</label>
            <input type="text" value={newAsset.location} onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} placeholder="e.g. Floor 2 Server Room" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={newAsset.isShared} onChange={e => setNewAsset({ ...newAsset, isShared: e.target.checked })} style={{ width: 'auto' }} />
            Shared resource (bookable by time slots)
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="af-btn af-btn-secondary" onClick={() => setRegisterModal(false)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', transition: 'all 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>Cancel</button>
            <button type="submit" className="af-btn af-btn-primary">Register Asset</button>
          </div>
        </form>
      </Modal>

      {/* Book Resource */}
      <Modal open={bookingModal} onClose={() => setBookingModal(false)} title="Book Shared Resource">
        <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="af-label">Select Shared Resource</label>
            <select value={newBooking.assetId} onChange={e => setNewBooking({ ...newBooking, assetId: e.target.value })}>
              <option value="">— Choose Bookable Resource —</option>
              {assets.filter(a => a.isShared).map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="af-label">Date</label>
            <input type="date" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="af-label">Start Time</label>
              <input type="time" value={newBooking.startTime} onChange={e => setNewBooking({ ...newBooking, startTime: e.target.value })} />
            </div>
            <div>
              <label className="af-label">End Time</label>
              <input type="time" value={newBooking.endTime} onChange={e => setNewBooking({ ...newBooking, endTime: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="af-btn af-btn-secondary" onClick={() => setBookingModal(false)}>Cancel</button>
            <button type="submit" className="af-btn af-btn-primary">Confirm Booking</button>
          </div>
        </form>
      </Modal>

      {/* Raise Maintenance */}
      <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title="Request Asset Repair">
        <form onSubmit={handleMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="af-label">Select Asset</label>
            <select value={newMaint.assetId} onChange={e => setNewMaint({ ...newMaint, assetId: e.target.value })}>
              <option value="">— Choose Faulty Asset —</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.id}) — {a.status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="af-label">Describe Issue</label>
            <textarea
              value={newMaint.issue}
              onChange={e => setNewMaint({ ...newMaint, issue: e.target.value })}
              placeholder="Describe the malfunction in detail..."
              style={{ height: '80px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label className="af-label">Priority</label>
            <select value={newMaint.priority} onChange={e => setNewMaint({ ...newMaint, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="af-btn af-btn-secondary" onClick={() => setMaintenanceModal(false)}>Cancel</button>
            <button type="submit" className="af-btn af-btn-danger">Raise Ticket</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

export default DashboardOverview;
