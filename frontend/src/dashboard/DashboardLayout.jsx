import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Boxes,
  CalendarDays,
  Wrench,
  FileCheck,
  BarChart3,
  CheckSquare,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut,
  FolderTree,
  ShieldAlert
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'Assets', path: '/dashboard/assets', icon: Boxes },
    { name: 'Allocations', path: '/dashboard/allocations', icon: FolderTree },
    { name: 'Bookings', path: '/dashboard/bookings', icon: CalendarDays },
    { name: 'Maintenance', path: '/dashboard/maintenance', icon: Wrench },
    { name: 'Audits', path: '/dashboard/audits', icon: FileCheck },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/dashboard/calendar', icon: CalendarDays },
    { name: 'Team', path: '/dashboard/team', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
    { name: 'Help', path: '/dashboard/help', icon: HelpCircle },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#080810] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0c0c16]/75 backdrop-blur-xl flex flex-col justify-between">
        <div>
          {/* Logo Header */}
          <div className="p-6 flex items-center space-x-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF3366] to-[#00E5FF] p-[2px]">
              <div className="w-full h-full bg-[#080810] rounded-[6px] flex items-center justify-center">
                <Boxes className="w-4 h-4 text-[#FF3366]" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Asset<span className="text-[#FF3366]">Flow</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF3366]/15 to-transparent border-l-2 border-[#FF3366] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF3366]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2.5 text-slate-400 hover:text-[#FF3366] hover:bg-[#FF3366]/5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#080810]">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/5 bg-[#0c0c16]/50 flex items-center justify-between px-8">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
              Environment: Active
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-300">Admin Session</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              <span className="text-xs font-bold text-[#FF3366]">A</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
