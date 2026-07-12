import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { employeeService, departmentService } from '../../services/resourceService';
import { ROLE, ROLE_LABELS, ACCOUNT_STATUS, ACCOUNT_STATUS_LABELS } from '../../config/enums';
import {
  Loading, ErrorState, DataTable, Td, Field, Select,
  PrimaryButton, GhostButton, toLabel,
} from './DataStates';

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [manage, setManage] = useState(null);

  const list = useApi(
    () => employeeService.list({
      search: search || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      page,
      size: 10,
    }),
    [search, roleFilter, statusFilter, page]
  );

  const act = async (fn) => {
    try {
      await fn();
      list.refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            placeholder="Search employees…"
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }}
            style={{ width: '100%', paddingLeft: 30, padding: '0.5rem 0.65rem 0.5rem 30px', background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
          />
        </div>
        <Select value={roleFilter} onChange={(e) => { setPage(0); setRoleFilter(e.target.value); }} style={{ maxWidth: 180 }}>
          <option value="">All roles</option>
          {Object.values(ROLE).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} style={{ maxWidth: 180 }}>
          <option value="">All statuses</option>
          {Object.values(ACCOUNT_STATUS).map((s) => <option key={s} value={s}>{ACCOUNT_STATUS_LABELS[s]}</option>)}
        </Select>
      </div>

      {list.loading ? (
        <Loading label="Loading employees…" />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.refetch} />
      ) : (
        <>
          <DataTable
            columns={['Name', 'Email', 'Department', 'Role', 'Status', '']}
            rows={list.data?.content || []}
            empty="No employees found."
            renderRow={(u) => (
              <tr key={u.id}>
                <Td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{u.fullName}</Td>
                <Td>{u.email}</Td>
                <Td>{u.departmentName || '—'}</Td>
                <Td>{ROLE_LABELS[u.role] || toLabel(u.role)}</Td>
                <Td><Badge status={ACCOUNT_STATUS_LABELS[u.accountStatus]}>{ACCOUNT_STATUS_LABELS[u.accountStatus]}</Badge></Td>
                <Td>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {u.accountStatus === 'PENDING_APPROVAL' && (
                      <>
                        <GhostButton onClick={() => act(() => employeeService.approve(u.id))}>Approve</GhostButton>
                        <GhostButton onClick={() => act(() => employeeService.reject(u.id))}>Reject</GhostButton>
                      </>
                    )}
                    {u.accountStatus === 'LOCKED' && <GhostButton onClick={() => act(() => employeeService.unlock(u.id))}>Unlock</GhostButton>}
                    {u.accountStatus === 'SUSPENDED' && <GhostButton onClick={() => act(() => employeeService.activate(u.id))}>Activate</GhostButton>}
                    {u.accountStatus === 'ACTIVE' && <GhostButton onClick={() => act(() => employeeService.suspend(u.id))}>Suspend</GhostButton>}
                    <GhostButton onClick={() => setManage(u)}>Manage</GhostButton>
                  </div>
                </Td>
              </tr>
            )}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{list.data?.totalElements || 0} total · page {(list.data?.page || 0) + 1} of {Math.max(list.data?.totalPages || 1, 1)}</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <GhostButton disabled={list.data?.first} onClick={() => setPage(page - 1)}>Prev</GhostButton>
              <GhostButton disabled={list.data?.last} onClick={() => setPage(page + 1)}>Next</GhostButton>
            </div>
          </div>
        </>
      )}

      {manage && <ManageEmployeeModal employee={manage} onClose={() => setManage(null)} onDone={() => { setManage(null); list.refetch(); }} />}
    </div>
  );
}

function ManageEmployeeModal({ employee, onClose, onDone }) {
  const [role, setRole] = useState(employee.role);
  const [deptId, setDeptId] = useState(employee.departmentId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const depts = useApi(() => departmentService.list({ active: true, size: 200 }), []);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (role !== employee.role) await employeeService.changeRole(employee.id, role);
      if (deptId && deptId !== employee.departmentId) await employeeService.assignDepartment(employee.id, deptId);
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title={`Manage · ${employee.fullName}`} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.values(ROLE).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
        </Field>
        <Field label="Department">
          <Select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">— Unassigned —</option>
            {(depts.data?.content || []).map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</PrimaryButton>
      </div>
    </Modal>
  );
}
