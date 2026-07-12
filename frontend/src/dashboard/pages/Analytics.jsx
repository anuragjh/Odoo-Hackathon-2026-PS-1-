import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, PieChart as PieIcon } from 'lucide-react';

function Analytics() {
  const { assets, bookings, maintenance } = useContext(AppContext);

  // Calcs
  const totalAssets = assets.length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const lostCount = assets.filter(a => a.status === 'Lost').length;

  // Pie chart data
  const pieData = [
    { name: 'Available', value: availableCount, color: '#10b981' },
    { name: 'Allocated', value: allocatedCount, color: '#3b82f6' },
    { name: 'Maintenance', value: maintenanceCount, color: '#f59e0b' },
    { name: 'Lost/Disposed', value: lostCount, color: '#ef4444' }
  ];

  // Category wise stats
  const catStats = [
    { name: 'Electronics', count: assets.filter(a => a.category === 'Electronics').length, cost: assets.filter(a => a.category === 'Electronics').reduce((acc, curr) => acc + curr.acqCost, 0) },
    { name: 'Furniture', count: assets.filter(a => a.category === 'Furniture').length, cost: assets.filter(a => a.category === 'Furniture').reduce((acc, curr) => acc + curr.acqCost, 0) },
    { name: 'Vehicles', count: assets.filter(a => a.category === 'Vehicles').length, cost: assets.filter(a => a.category === 'Vehicles').reduce((acc, curr) => acc + curr.acqCost, 0) }
  ];

  // Booking peaks heatmap mock
  const bookingPeaks = [
    { time: '08:00', bookings: 2 },
    { time: '10:00', bookings: 7 },
    { time: '12:00', bookings: 4 },
    { time: '14:00', bookings: 9 },
    { time: '16:00', bookings: 5 },
    { time: '18:00', bookings: 1 }
  ];

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-xs text-muted-foreground">Detailed metrics on asset utilization, maintenance frequencies, and peak bookings.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Asset Value Managed</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              ${assets.reduce((acc, a) => acc + a.acqCost, 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Utilization Ratio</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {totalAssets > 0 ? Math.round((allocatedCount / totalAssets) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Active Repair Tickets</span>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {maintenance.filter(m => m.status !== 'Resolved').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* State distribution */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-primary" />
            <span>Asset Status Distribution</span>
          </h2>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: 'hsl(var(--foreground))' }}
                />
                <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category costing */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Inventory Valuation by Category</span>
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Bookings time graph */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground mb-4">Resource Booking Peak Usage Heatmap</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingPeaks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" fontSize={11} stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="currentColor" className="text-muted-foreground" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
