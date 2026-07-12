import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { allocationService, assetService, employeeService, transferService } from '../../services/resourceService';
import { ALLOCATION_STATUS, ALLOCATION_STATUS_LABELS, ASSET_CONDITION, TRANSFER_STATUS_LABELS } from '../../config/enums';
import {
  Loading, ErrorState, DataTable, Td, Field, Input, Select, Textarea,
  PrimaryButton, GhostButton, formatDate, toLabel,
} from '../ui/DataStates';

export default function Allocations() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showAllocate, setShowAllocate] = useState(false);
  const [returnFor, setReturnFor] = useState(null);
  const [transferFor, setTransferFor] = useState(null);
  const [transferRequests, setTransferRequests] = useState([]);

  const list = useApi(
    () => allocationService.list({ status: statusFilter || undefined, page, size: 10 }),
    [statusFilter, page]
  );

  const decideTransfer = async (transfer, action) => {
    try {
      const updated = action === 'approve'
        ? await transferService.approve(transfer.id)
        : await transferService.reject(transfer.id);
      setTransferRequests((prev) => prev.map((t) => (t.id === transfer.id ? updated : t)));
      list.refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Allocation & Transfer" subtitle="Manage who holds what, with conflict handling">
        <PrimaryButton onClick={() => setShowAllocate(true)}><Plus size={15} style={{ marginRight: 4 }} /> Allocate Asset</PrimaryButton>
      </PageHeader>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
        <Select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {Object.values(ALLOCATION_STATUS).map((s) => <option key={s} value={s}>{ALLOCATION_STATUS_LABELS[s]}</option>)}
        </Select>
      </div>

      {list.loading ? (
        <Loading label="Loading allocations…" />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.refetch} />
      ) : (
        <>
          <DataTable
            columns={['Asset', 'Holder', 'Allocated', 'Expected Return', 'Status', '']}
            rows={list.data?.content || []}
            empty="No allocations yet."
            renderRow={(row) => (
              <tr key={row.id}>
                <Td style={{ color: 'var(--text-primary)' }}><strong>{row.assetTag}</strong> · {row.assetName}</Td>
                <Td>{row.allocatedToName || row.departmentName || '—'}</Td>
                <Td>{formatDate(row.allocatedDate)}</Td>
                <Td style={{ color: row.overdue ? 'var(--danger)' : undefined }}>
                  {formatDate(row.expectedReturnDate)}{row.overdue ? ' · overdue' : ''}
                </Td>
                <Td><Badge status={row.overdue ? 'overdue' : ALLOCATION_STATUS_LABELS[row.status]}>{row.overdue ? 'Overdue' : ALLOCATION_STATUS_LABELS[row.status]}</Badge></Td>
                <Td>
                  {row.status !== 'RETURNED' && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <GhostButton onClick={() => setReturnFor(row)}>Return</GhostButton>
                      <GhostButton onClick={() => setTransferFor(row)}>Transfer</GhostButton>
                    </div>
                  )}
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

      {transferRequests.length > 0 && (
        <div style={{ marginTop: '1.75rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Transfer Requests <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>(this session)</span>
          </h2>
          <DataTable
            columns={['Asset', 'To', 'Reason', 'Status', '']}
            rows={transferRequests}
            renderRow={(t) => (
              <tr key={t.id}>
                <Td style={{ color: 'var(--text-primary)' }}><strong>{t.assetTag}</strong> · {t.assetName}</Td>
                <Td>{t.toUserName || t.toDepartmentName || '—'}</Td>
                <Td>{t.reason || '—'}</Td>
                <Td><Badge status={TRANSFER_STATUS_LABELS[t.status]}>{TRANSFER_STATUS_LABELS[t.status]}</Badge></Td>
                <Td>
                  {t.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <GhostButton onClick={() => decideTransfer(t, 'approve')}>Approve</GhostButton>
                      <GhostButton onClick={() => decideTransfer(t, 'reject')}>Reject</GhostButton>
                    </div>
                  )}
                </Td>
              </tr>
            )}
          />
        </div>
      )}

      {showAllocate && <AllocateModal onClose={() => setShowAllocate(false)} onDone={() => { setShowAllocate(false); list.refetch(); }} />}
      {returnFor && <ReturnModal allocation={returnFor} onClose={() => setReturnFor(null)} onDone={() => { setReturnFor(null); list.refetch(); }} />}
      {transferFor && (
        <TransferModal
          allocation={transferFor}
          onClose={() => setTransferFor(null)}
          onDone={(created) => {
            setTransferFor(null);
            if (created) setTransferRequests((prev) => [created, ...prev]);
            list.refetch();
          }}
        />
      )}
    </div>
  );
}

function AllocateModal({ onClose, onDone }) {
  const [form, setForm] = useState({ assetId: '', allocatedToUserId: '', expectedReturnDate: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const assets = useApi(() => assetService.list({ status: 'AVAILABLE', size: 200 }), []);
  const emps = useApi(() => employeeService.list({ status: 'ACTIVE', size: 200 }), []);

  const submit = async () => {
    if (!form.assetId || !form.allocatedToUserId) {
      setError('Asset and employee are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await allocationService.allocate({
        assetId: form.assetId,
        allocatedToUserId: form.allocatedToUserId,
        expectedReturnDate: form.expectedReturnDate || undefined,
        notes: form.notes || undefined,
      });
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title="Allocate Asset" maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Available asset" required>
          <Select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
            <option value="">Select asset…</option>
            {(assets.data?.content || []).map((a) => <option key={a.id} value={a.id}>{a.assetTag} · {a.assetName}</option>)}
          </Select>
        </Field>
        <Field label="Allocate to employee" required>
          <Select value={form.allocatedToUserId} onChange={(e) => setForm({ ...form, allocatedToUserId: e.target.value })}>
            <option value="">Select employee…</option>
            {(emps.data?.content || []).map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
          </Select>
        </Field>
        <Field label="Expected return date"><Input type="date" value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} /></Field>
        <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Allocate'}</PrimaryButton>
      </div>
    </Modal>
  );
}

function ReturnModal({ allocation, onClose, onDone }) {
  const [form, setForm] = useState({ returnCondition: 'GOOD', returnNotes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await allocationService.returnAsset(allocation.id, {
        returnCondition: form.returnCondition || undefined,
        returnNotes: form.returnNotes || undefined,
      });
      onDone();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title={`Return ${allocation.assetTag}`} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Condition on return">
          <Select value={form.returnCondition} onChange={(e) => setForm({ ...form, returnCondition: e.target.value })}>
            {Object.values(ASSET_CONDITION).map((c) => <option key={c} value={c}>{toLabel(c)}</option>)}
          </Select>
        </Field>
        <Field label="Check-in notes"><Textarea value={form.returnNotes} onChange={(e) => setForm({ ...form, returnNotes: e.target.value })} /></Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Confirm Return'}</PrimaryButton>
      </div>
    </Modal>
  );
}

function TransferModal({ allocation, onClose, onDone }) {
  const [form, setForm] = useState({ toUserId: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const emps = useApi(() => employeeService.list({ status: 'ACTIVE', size: 200 }), []);

  const submit = async () => {
    if (!form.toUserId) {
      setError('Select an employee to transfer to.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await transferService.create({
        assetId: allocation.assetId,
        toUserId: form.toUserId,
        reason: form.reason || undefined,
      });
      onDone(created);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title={`Request Transfer · ${allocation.assetTag}`} maxWidth="460px">
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Currently held by {allocation.allocatedToName || allocation.departmentName || 'current holder'}.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Transfer to employee" required>
          <Select value={form.toUserId} onChange={(e) => setForm({ ...form, toUserId: e.target.value })}>
            <option value="">Select employee…</option>
            {(emps.data?.content || []).map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
          </Select>
        </Field>
        <Field label="Reason"><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Request Transfer'}</PrimaryButton>
      </div>
    </Modal>
  );
}
