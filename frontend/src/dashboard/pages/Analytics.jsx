import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { assetService, employeeService } from '../../services/resourceService';
import { Loading, ErrorState, Card, DataTable, Td } from '../ui/DataStates';

function StatRow({ label, value, tone }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: tone || 'var(--text-primary)' }}>{value ?? '—'}</span>
    </div>
  );
}

export default function Analytics() {
  const dash = useApi(() => assetService.dashboard(), []);
  const stats = useApi(() => assetService.statistics(), []);
  const emp = useApi(() => employeeService.statistics(), []);

  const loading = dash.loading || stats.loading || emp.loading;
  const error = dash.error || stats.error || emp.error;
  const retry = () => { dash.refetch(); stats.refetch(); emp.refetch(); };

  const d = dash.data || {};
  const s = stats.data || {};
  const e = emp.data || {};

  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Reports & Analytics" subtitle="Operational insight across assets and people" />
      {loading ? <Loading label="Loading analytics…" /> : error ? <ErrorState message={error} onRetry={retry} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <Card style={{ padding: '1.1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0 }}>Assets by Status</h3>
            <StatRow label="Total" value={d.total} />
            <StatRow label="Available" value={d.available} tone="#16a34a" />
            <StatRow label="Allocated" value={d.allocated} />
            <StatRow label="Reserved" value={d.reserved} />
            <StatRow label="Under Maintenance" value={d.underMaintenance} tone="#d97706" />
            <StatRow label="Lost" value={d.lost} tone="var(--danger)" />
            <StatRow label="Retired" value={d.retired} />
            <StatRow label="Disposed" value={d.disposed} />
          </Card>

          <Card style={{ padding: '1.1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0 }}>Asset Health</h3>
            <StatRow label="Damaged assets" value={s.damaged} tone="var(--danger)" />
            <StatRow label="Warranty expiring soon" value={s.warrantyExpiringSoon} tone="#d97706" />
          </Card>

          <Card style={{ padding: '1.1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0 }}>Workforce</h3>
            <StatRow label="Total employees" value={e.total} />
            <StatRow label="Active" value={e.active} tone="#16a34a" />
            <StatRow label="Pending approval" value={e.pendingApproval} tone="#d97706" />
            <StatRow label="Asset Managers" value={e.assetManagers} />
            <StatRow label="Department Heads" value={e.departmentHeads} />
            <StatRow label="Employees" value={e.employees} />
            <StatRow label="Suspended" value={e.suspended} />
            <StatRow label="Locked" value={e.locked} tone="var(--danger)" />
          </Card>

          <Card style={{ padding: '1.1rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 0, marginBottom: '0.5rem' }}>Assets by Category</h3>
            <DataTable
              columns={['Category', 'Asset Count']}
              rows={s.byCategory || []}
              empty="No category data."
              renderRow={(c) => (
                <tr key={c.categoryId}>
                  <Td style={{ color: 'var(--text-primary)' }}>{c.categoryName}</Td>
                  <Td>{c.count}</Td>
                </tr>
              )}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
