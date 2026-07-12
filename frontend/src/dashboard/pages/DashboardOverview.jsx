import React from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes, PackageCheck, PackageOpen, Wrench, ArrowLeftRight, CalendarClock,
  AlertTriangle, Building2, Users, UserCheck, Plus, FolderTree,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { assetService, allocationService, dashboardService } from '../../services/resourceService';
import { Loading, ErrorState, Card } from '../ui/DataStates';

function Kpi({ icon: Icon, label, value, tone = 'accent' }) {
  const toneColor = {
    accent: 'var(--accent)',
    danger: 'var(--danger)',
    warning: '#d97706',
    success: '#16a34a',
  }[tone];
  return (
    <Card style={{ padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
        <Icon size={15} color={toneColor} />
        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </span>
    </Card>
  );
}

export default function DashboardOverview() {
  const assets = useApi(() => assetService.dashboard(), []);
  const alloc = useApi(() => allocationService.dashboard(), []);
  const org = useApi(() => dashboardService.orgSetup(), []);

  const loading = assets.loading || alloc.loading || org.loading;
  const error = assets.error || alloc.error || org.error;

  const retryAll = () => { assets.refetch(); alloc.refetch(); org.refetch(); };

  const a = assets.data || {};
  const l = alloc.data || {};
  const o = org.data || {};

  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Dashboard" subtitle="Real-time operational snapshot of your organization" />

      {loading ? (
        <Loading label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={error} onRetry={retryAll} />
      ) : (
        <>
          <div className="af-kpi-grid" style={{ marginBottom: '1.5rem' }}>
            <Kpi icon={PackageCheck} label="Assets Available" value={a.available} tone="success" />
            <Kpi icon={PackageOpen} label="Assets Allocated" value={a.allocated} />
            <Kpi icon={Wrench} label="Under Maintenance" value={a.underMaintenance} tone="warning" />
            <Kpi icon={ArrowLeftRight} label="Pending Transfers" value={l.pendingTransfers} />
            <Kpi icon={CalendarClock} label="Due Today" value={l.dueToday} />
            <Kpi icon={AlertTriangle} label="Overdue Returns" value={l.overdueReturns} tone="danger" />
            <Kpi icon={Boxes} label="Total Assets" value={a.total} />
            <Kpi icon={Building2} label="Departments" value={o.departments} />
            <Kpi icon={Users} label="Employees" value={o.employees} />
            <Kpi icon={UserCheck} label="Pending Approvals" value={o.pendingApprovals} tone="warning" />
          </div>

          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard/assets" className="af-btn af-btn-primary neu-btn" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={15} /> Register Asset
            </Link>
            <Link to="/dashboard/allocations" className="af-btn af-btn-secondary neu-btn" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <PackageOpen size={15} /> Allocate Asset
            </Link>
            <Link to="/dashboard/organization" className="af-btn af-btn-secondary neu-btn" style={{ padding: '0.6rem 1rem', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <FolderTree size={15} /> Organization Setup
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
