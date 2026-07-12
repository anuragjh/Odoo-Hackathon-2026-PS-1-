import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Play, Pause, Square, ShieldAlert,
  FolderPlus, CalendarPlus, Hammer, Laptop, Armchair, Car
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

function DashboardOverview() {
  const {
    assets, bookings, maintenance, transfers, employees,
    registerAsset, createBooking, raiseMaintenance,
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
        <div className="af-stat-card">
          <span className="af-stat-label">Available</span>
          <span className="af-stat-value">{availableCount}</span>
          <Badge variant="success">Ready</Badge>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-label">Allocated</span>
          <span className="af-stat-value">{allocatedCount}</span>
          <Badge variant="info">Active</Badge>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-label">In Maintenance</span>
          <span className="af-stat-value">{maintenanceCount}</span>
          <Badge variant="warning">In Depot</Badge>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-label">Active Bookings</span>
          <span className="af-stat-value">{activeBookingsCount}</span>
          <Badge variant="info">Scheduled</Badge>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-label">Pending Transfers</span>
          <span className="af-stat-value">{pendingTransfersCount}</span>
          <Badge variant="warning">Review</Badge>
        </div>
        <div className="af-stat-card">
          <span className="af-stat-label">Allocation Rate</span>
          <span className="af-stat-value">{allocationRate}%</span>
          <Badge variant="neutral">Total {totalAssets}</Badge>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        <button className="af-btn af-btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }} onClick={() => setRegisterModal(true)}>
          <FolderPlus size={14} />
          Register Asset
        </button>
        <button className="af-btn af-btn-secondary" style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }} onClick={() => setBookingModal(true)}>
          <CalendarPlus size={14} />
          Book Resource
        </button>
        <button
          className="af-btn af-btn-secondary"
          style={{ flex: 1, justifyContent: 'center', minWidth: '140px', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
          onClick={() => setMaintenanceModal(true)}
        >
          <Hammer size={14} />
          Raise Request
        </button>
      </div>

      {/* Recent Activity + Audit Clock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem', alignItems: 'start' }}>
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
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Audit Clock */}
        <div className="af-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Audit Session
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>
            Tracking Clock
          </div>
          <div style={{ fontSize: '1.75rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            {formatTimer()}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={toggleTimer}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={resetTimer}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--danger-bg)', border: '1px solid var(--danger-border)',
                color: 'var(--danger)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Square size={11} />
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
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
            <button type="button" className="af-btn af-btn-secondary" onClick={() => setRegisterModal(false)}>Cancel</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
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
