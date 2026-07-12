import React, { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpRight, TrendingUp, Video, Play, Pause, Square, Plus, ShieldAlert,
  FolderPlus, CalendarPlus, AlertTriangle, Hammer, Laptop, Armchair, Car
} from 'lucide-react';

function DashboardOverview() {
  const { 
    assets, bookings, maintenance, transfers, employees,
    registerAsset, allocateAsset, createBooking, raiseMaintenance, approveTransfer
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

  // Time Tracker State
  const [seconds, setSeconds] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(24);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Ticker Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 59) {
                setHours((prevHours) => prevHours + 1);
                return 0;
              }
              return prevMinutes + 1;
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle Timer Control
  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  // Calculations for KPIs
  const totalAssets = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfers.filter(t => t.status === 'Requested').length;

  // Overdue Returns Calculation
  // Current date is 2026-07-12
  const currentDate = new Date('2026-07-12');
  const overdueAssets = assets.filter(a => {
    if (a.status !== 'Allocated' || !a.expectedReturn) return false;
    const returnDate = new Date(a.expectedReturn);
    return returnDate < currentDate;
  });
  const overdueCount = overdueAssets.length;

  // Percentage calculations
  const allocationRate = totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0;

  // Chart data
  const chartData = [
    { name: 'Mon', allocations: 4, maintenance: 2 },
    { name: 'Tue', allocations: 6, maintenance: 1 },
    { name: 'Wed', allocations: 8, maintenance: 3 },
    { name: 'Thu', allocations: 5, maintenance: 2 },
    { name: 'Fri', allocations: 9, maintenance: 4 },
    { name: 'Sat', allocations: 3, maintenance: 1 },
    { name: 'Sun', allocations: 2, maintenance: 0 },
  ];

  // Forms Submissions
  const handleRegister = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serial) {
      setActionAlert({ type: 'error', message: 'Name and Serial Number are required.' });
      return;
    }
    registerAsset({
      name: newAsset.name,
      category: newAsset.category,
      serial: newAsset.serial,
      acqDate: new Date().toISOString().split('T')[0],
      acqCost: Number(newAsset.acqCost) || 0,
      location: newAsset.location || 'Central Depot',
      isShared: newAsset.isShared,
      condition: newAsset.condition
    });
    setActionAlert({ type: 'success', message: 'Asset registered successfully!' });
    setRegisterModal(false);
    setNewAsset({ name: '', category: 'Electronics', serial: '', acqCost: '', location: '', isShared: false, condition: 'Excellent' });
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!newBooking.assetId || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
      setActionAlert({ type: 'error', message: 'All booking fields are required.' });
      return;
    }
    const res = createBooking({
      assetId: newBooking.assetId,
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime
    });
    if (res.success) {
      setActionAlert({ type: 'success', message: 'Resource booked successfully!' });
      setBookingModal(false);
      setNewBooking({ assetId: '', date: '', startTime: '', endTime: '' });
    } else {
      setActionAlert({ type: 'error', message: res.error });
    }
  };

  const handleMaintenance = (e) => {
    e.preventDefault();
    if (!newMaint.assetId || !newMaint.issue) {
      setActionAlert({ type: 'error', message: 'Asset and issue description are required.' });
      return;
    }
    const res = raiseMaintenance({
      assetId: newMaint.assetId,
      issue: newMaint.issue,
      priority: newMaint.priority
    });
    if (res.success) {
      setActionAlert({ type: 'success', message: 'Maintenance ticket raised successfully!' });
      setMaintenanceModal(false);
      setNewMaint({ assetId: '', issue: '', priority: 'Medium' });
    } else {
      setActionAlert({ type: 'error', message: res.error });
    }
  };

  // Helper formatting for timer
  const formatTimer = () => {
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Alert Banners */}
      {actionAlert && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
          actionAlert.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {actionAlert.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{actionAlert.message}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Today's Overview</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Real-time enterprise asset and resource allocation metrics.</p>
        </div>
      </div>

      {/* KPI Cards Grid (Screen 2: Available, Allocated, Available (Transit) etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Available Assets */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available</h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Ready</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{availableCount}</p>
          </div>
        </div>

        {/* Allocated Assets */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allocated</h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">Active</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{allocatedCount}</p>
          </div>
        </div>

        {/* Maintenance / Available (Transit) */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available (Transit)</h3>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">In Depot</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{maintenanceCount}</p>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Bookings</h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">Scheduled</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{activeBookingsCount}</p>
          </div>
        </div>

        {/* Pending Transfers */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Transfers</h3>
            <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">Review</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{pendingTransfersCount}</p>
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="flex flex-col justify-between rounded-2xl bg-card p-5">
          <div className="flex items-start justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming Returns</h3>
            <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">7 Days</span>
          </div>
          <div className="mt-4">
            <p className="text-4xl font-extrabold">{assets.filter(a => a.status === 'Allocated' && a.expectedReturn).length || 12}</p>
          </div>
        </div>
      </div>

      {/* Red Banner: Overdue Returns */}
      {overdueCount > 0 && (
        <div className="bg-rose-500/10 border-l-4 border-rose-500 rounded-r-2xl p-4 text-rose-700 dark:text-rose-400 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            <span className="font-bold text-sm">{overdueCount} assets overdue for return - flagged for follow-up</span>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-4 py-2">
        <button 
          onClick={() => setRegisterModal(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white dark:bg-[#3b82f6] dark:text-[#0a0a0a] font-bold px-6 py-3.5 rounded-2xl text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ register asset</span>
        </button>
        
        <button 
          onClick={() => setBookingModal(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground font-bold px-6 py-3.5 rounded-2xl text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <CalendarPlus className="w-4 h-4 text-primary" />
          <span>Book resource</span>
        </button>

        <button 
          onClick={() => setMaintenanceModal(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground font-bold px-6 py-3.5 rounded-2xl text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Hammer className="w-4 h-4 text-rose-500" />
          <span>Raise requests</span>
        </button>
      </div>

      {/* Row 2: Recent Activity & Audit tracking clock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3.5">
            {assets.slice(0, 4).map(asset => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between p-3.5 rounded-xl border border-border hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-primary">
                    {asset.category === 'Electronics' ? <Laptop className="w-4 h-4 text-[#2563eb] dark:text-[#3b82f6]" /> : asset.category === 'Furniture' ? <Armchair className="w-4 h-4 text-[#2563eb] dark:text-[#3b82f6]" /> : <Car className="w-4 h-4 text-[#2563eb] dark:text-[#3b82f6]" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground leading-none">{asset.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1.5">Tag: {asset.id} &bull; S/N: {asset.serial}</p>
                  </div>
                </div>
                
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  asset.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                  asset.status === 'Allocated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                  asset.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                  'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                }`}>
                  {asset.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Session Timer */}
        <div className="space-y-6">
          {/* Time tracker */}
          <div className="bg-[#121212] border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Audit Session</span>
              <h2 className="text-lg font-bold text-foreground mb-3 mt-1">Audit Tracking Clock</h2>
              <div className="text-4xl sm:text-5xl font-mono font-bold mb-4 tracking-tight text-[#2563eb] dark:text-[#3b82f6]">
                {formatTimer()}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleTimer}
                  className="w-10 h-10 rounded-full bg-card border border-border text-foreground hover:bg-secondary transition-all flex items-center justify-center shadow-md"
                  title={isTimerRunning ? "Pause Audit Clock" : "Start Audit Clock"}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-10 h-10 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-all flex items-center justify-center shadow-md"
                  title="Reset Clock"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>

      {/* QUICK ACTION MODALS */}

      {/* Register Asset Modal */}
      {registerModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRegisterModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl z-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Register New Asset</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Asset Name</label>
                <input 
                  type="text" 
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g. MacBook Pro 14" 
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                  <select 
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Serial Number</label>
                  <input 
                    type="text" 
                    value={newAsset.serial}
                    onChange={(e) => setNewAsset({...newAsset, serial: e.target.value})}
                    placeholder="e.g. SN-3928X" 
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Acquisition Cost ($)</label>
                  <input 
                    type="number" 
                    value={newAsset.acqCost}
                    onChange={(e) => setNewAsset({...newAsset, acqCost: e.target.value})}
                    placeholder="e.g. 1500" 
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Condition</label>
                  <select 
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">HQ Location / Room</label>
                <input 
                  type="text" 
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                  placeholder="e.g. Floor 2 Server Room" 
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isShared"
                  checked={newAsset.isShared}
                  onChange={(e) => setNewAsset({...newAsset, isShared: e.target.checked})}
                  className="rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="isShared" className="text-xs font-semibold text-muted-foreground">This is a shared resource (bookable by slots)</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setRegisterModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs hover:bg-secondary text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Book Resource Modal */}
      {bookingModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBookingModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl z-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Book Shared Resource</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Shared Resource</label>
                <select 
                  value={newBooking.assetId}
                  onChange={(e) => setNewBooking({...newBooking, assetId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                >
                  <option value="">-- Choose Bookable Resource --</option>
                  {assets.filter(a => a.isShared).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
                <input 
                  type="date" 
                  value={newBooking.date}
                  onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newBooking.endTime}
                    onChange={(e) => setNewBooking({...newBooking, endTime: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setBookingModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs hover:bg-secondary text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Raise Maintenance Modal */}
      {maintenanceModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMaintenanceModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl z-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Request Asset Repair</h2>
            <form onSubmit={handleMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Asset</label>
                <select 
                  value={newMaint.assetId}
                  onChange={(e) => setNewMaint({...newMaint, assetId: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                >
                  <option value="">-- Choose Faulty Asset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id}) - Current: {a.status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Describe Issue</label>
                <textarea 
                  value={newMaint.issue}
                  onChange={(e) => setNewMaint({...newMaint, issue: e.target.value})}
                  placeholder="Describe details of the malfunction (e.g. Overheating, cracked casing, system crash)..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background h-24 text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Issue Priority</label>
                <select 
                  value={newMaint.priority}
                  onChange={(e) => setNewMaint({...newMaint, priority: e.target.value})}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setMaintenanceModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs hover:bg-secondary text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-xs"
                >
                  Raise Ticket
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default DashboardOverview;
