import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Boxes, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Activity,
  Plus
} from 'lucide-react';

const DashboardCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="rounded-xl border border-white/5 bg-[#0c0c16]/50 p-6 backdrop-blur-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-${color}/10`}>
        <Icon className={`w-6 h-6 text-${color}`} style={{ color }} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs">
      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mr-1" />
      <span className="text-emerald-400 font-medium mr-1.5">{change}</span>
      <span className="text-slate-500">vs last month</span>
    </div>
  </div>
);

export const DashboardOverview = () => {
  const stats = [
    { title: 'Total Assets', value: '1,248', change: '+12.5%', icon: Boxes, color: '#FF3366' },
    { title: 'Active Allocations', value: '412', change: '+8.2%', icon: Activity, color: '#00E5FF' },
    { title: 'Maintenance Alerts', value: '3', change: '-25%', icon: AlertTriangle, color: '#fbbf24' },
    { title: 'System Security', value: '99.9%', change: '+0.01%', icon: Clock, color: '#34d399' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">System Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time status of enterprise capital and allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <DashboardCard key={i} {...stat} />
        ))}
      </div>

      {/* Grid containing tables or details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#0c0c16]/50 p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">Recent Hardware Allocations</h3>
            <button className="text-xs text-[#00E5FF] hover:underline flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { id: '1092', asset: 'MacBook Pro 16" M3 Max', user: 'Sarah Jenkins', dept: 'Engineering', status: 'Allocated', date: 'Just now' },
              { id: '1088', asset: 'Dell XPS 15 9530', user: 'Alex Rivera', dept: 'Product', status: 'In Review', date: '2 hrs ago' },
              { id: '1085', asset: 'iPad Pro 12.9" 2TB', user: 'Jessica Wu', dept: 'Design', status: 'Allocated', date: '5 hrs ago' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.asset}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Assigned to: {item.user} • {item.dept}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-1 rounded-full ${
                    item.status === 'Allocated' ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-amber-400/10 text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action center */}
        <div className="rounded-xl border border-white/5 bg-[#0c0c16]/50 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white mb-4">Quick Operations</h3>
            <p className="text-xs text-slate-400 mb-6">Autonomous operations dashboard.</p>
            <div className="space-y-3">
              <button className="w-full py-2.5 rounded-lg bg-[#FF3366] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#FF3366]/90 transition">
                <Plus className="w-4 h-4" /> Add New Asset
              </button>
              <button className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition">
                Request Hardware
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 text-[11px] text-slate-500 font-mono">
            Node Status: SECURE // Sync Done
          </div>
        </div>
      </div>
    </div>
  );
};

const PagePlaceholder = ({ title, desc }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-sm text-slate-400 mt-1">{desc || `View and manage your ${title.toLowerCase()} configurations here.`}</p>
    </div>
    <div className="rounded-xl border border-white/5 bg-[#0c0c16]/50 p-8 text-center backdrop-blur-md">
      <Boxes className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-white">Module Pending Integration</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
        This view is part of the system routing matrix and will be connected to its respective services soon.
      </p>
    </div>
  </div>
);

export const AssetsDirectory = () => <PagePlaceholder title="Assets Directory" desc="Inventory directory of physical and digital assets." />;
export const Allocations = () => <PagePlaceholder title="Allocations" desc="Resource mapping and current workflow matrix." />;
export const ResourceBookings = () => <PagePlaceholder title="Resource Bookings" desc="Deterministic time slots and environment reservations." />;
export const Maintenance = () => <PagePlaceholder title="Maintenance" desc="Autonomous physical engine servicing schedules." />;
export const Audits = () => <PagePlaceholder title="Audits" desc="Ledger validation and physical checking logs." />;
export const Analytics = () => <PagePlaceholder title="Analytics" desc="Autonomous usage reports and optimization heuristics." />;
export const Tasks = () => <PagePlaceholder title="Tasks" desc="Core scheduler activities and verification jobs." />;
export const Calendar = () => <PagePlaceholder title="Calendar" desc="Visual timeline of all scheduled reservations." />;
export const Team = () => <PagePlaceholder title="Team" desc="System identity control and privilege levels." />;
export const Settings = () => <PagePlaceholder title="Settings" desc="Global variables and network interface configuration." />;
export const Help = () => <PagePlaceholder title="Help" desc="Documentation logs and secure support ticket creation." />;
export const Logout = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/');
  }, [navigate]);
  return null;
};
