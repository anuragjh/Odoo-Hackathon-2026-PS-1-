import React, { useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { assetService, categoryService, departmentService } from '../../services/resourceService';
import { ASSET_STATUS, ASSET_STATUS_LABELS, ASSET_CONDITION } from '../../config/enums';
import {
  Loading, ErrorState, DataTable, Td, Field, Input, Select, Textarea,
  PrimaryButton, GhostButton, formatDate, toLabel,
} from '../ui/DataStates';

const emptyForm = {
  assetName: '', categoryId: '', departmentId: '', location: '', description: '',
  serialNumber: '', manufacturer: '', model: '', acquisitionDate: '', acquisitionCost: '',
  vendor: '', warrantyExpiry: '', condition: 'GOOD', shared: false, photoUrl: '',
};

export default function AssetsDirectory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const assets = useApi(
    () => assetService.list({ search: search || undefined, status: statusFilter || undefined, page, size: 10 }),
    [search, statusFilter, page]
  );

  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Assets" subtitle="Register and track assets across their lifecycle">
        <PrimaryButton onClick={() => setShowCreate(true)}><Plus size={15} style={{ marginRight: 4 }} /> Register Asset</PrimaryButton>
      </PageHeader>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <Input
            placeholder="Search by name, tag, serial…"
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }}
            style={{ paddingLeft: 30 }}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {Object.values(ASSET_STATUS).map((s) => <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>)}
        </Select>
      </div>

      {assets.loading ? (
        <Loading label="Loading assets…" />
      ) : assets.error ? (
        <ErrorState message={assets.error} onRetry={assets.refetch} />
      ) : (
        <>
          <DataTable
            columns={['Tag', 'Name', 'Category', 'Department', 'Location', 'Status', 'Condition', '']}
            rows={assets.data?.content || []}
            empty="No assets yet. Register your first asset."
            renderRow={(row) => (
              <tr key={row.id}>
                <Td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.assetTag}</Td>
                <Td>{row.assetName}</Td>
                <Td>{row.categoryName || '—'}</Td>
                <Td>{row.departmentName || '—'}</Td>
                <Td>{row.location || '—'}</Td>
                <Td><Badge status={ASSET_STATUS_LABELS[row.status]}>{ASSET_STATUS_LABELS[row.status] || row.status}</Badge></Td>
                <Td>{toLabel(row.condition)}</Td>
                <Td>
                  <GhostButton onClick={() => setDetailId(row.id)}><Eye size={13} style={{ marginRight: 3 }} /> View</GhostButton>
                </Td>
              </tr>
            )}
          />
          <Pagination page={page} data={assets.data} onPage={setPage} />
        </>
      )}

      {showCreate && (
        <CreateAssetModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); assets.refetch(); }}
        />
      )}
      {detailId && (
        <AssetDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => assets.refetch()}
        />
      )}
    </div>
  );
}

function Pagination({ page, data, onPage }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      <span>{data.totalElements} total · page {data.page + 1} of {Math.max(data.totalPages, 1)}</span>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <GhostButton disabled={data.first} onClick={() => onPage(page - 1)}>Prev</GhostButton>
        <GhostButton disabled={data.last} onClick={() => onPage(page + 1)}>Next</GhostButton>
      </div>
    </div>
  );
}

function CreateAssetModal({ onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cats = useApi(() => categoryService.list({ active: true, size: 200 }), []);
  const depts = useApi(() => departmentService.list({ active: true, size: 200 }), []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async () => {
    if (!form.assetName || !form.categoryId || !form.departmentId || !form.location) {
      setError('Name, category, department and location are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await assetService.create({
        assetName: form.assetName,
        categoryId: form.categoryId,
        departmentId: form.departmentId,
        location: form.location,
        description: form.description || undefined,
        serialNumber: form.serialNumber || undefined,
        manufacturer: form.manufacturer || undefined,
        model: form.model || undefined,
        acquisitionDate: form.acquisitionDate || undefined,
        acquisitionCost: form.acquisitionCost ? Number(form.acquisitionCost) : undefined,
        vendor: form.vendor || undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
        condition: form.condition || undefined,
        shared: form.shared,
        photoUrl: form.photoUrl || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title="Register Asset" maxWidth="640px">
      <div className="af-form-grid">
        <Field label="Asset name" required full><Input value={form.assetName} onChange={set('assetName')} /></Field>
        <Field label="Category" required>
          <Select value={form.categoryId} onChange={set('categoryId')}>
            <option value="">Select…</option>
            {(cats.data?.content || []).map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
          </Select>
        </Field>
        <Field label="Department" required>
          <Select value={form.departmentId} onChange={set('departmentId')}>
            <option value="">Select…</option>
            {(depts.data?.content || []).map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </Select>
        </Field>
        <Field label="Location" required><Input value={form.location} onChange={set('location')} /></Field>
        <Field label="Serial number"><Input value={form.serialNumber} onChange={set('serialNumber')} /></Field>
        <Field label="Manufacturer"><Input value={form.manufacturer} onChange={set('manufacturer')} /></Field>
        <Field label="Model"><Input value={form.model} onChange={set('model')} /></Field>
        <Field label="Acquisition date"><Input type="date" value={form.acquisitionDate} onChange={set('acquisitionDate')} /></Field>
        <Field label="Acquisition cost"><Input type="number" min="0" value={form.acquisitionCost} onChange={set('acquisitionCost')} /></Field>
        <Field label="Vendor"><Input value={form.vendor} onChange={set('vendor')} /></Field>
        <Field label="Warranty expiry"><Input type="date" value={form.warrantyExpiry} onChange={set('warrantyExpiry')} /></Field>
        <Field label="Condition">
          <Select value={form.condition} onChange={set('condition')}>
            {Object.values(ASSET_CONDITION).map((c) => <option key={c} value={c}>{toLabel(c)}</option>)}
          </Select>
        </Field>
        <Field label="Description" full><Textarea value={form.description} onChange={set('description')} /></Field>
        <Field full>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.shared} onChange={set('shared')} /> Shared / bookable resource
          </label>
        </Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Register'}</PrimaryButton>
      </div>
    </Modal>
  );
}

function AssetDetailModal({ id, onClose, onChanged }) {
  const detail = useApi(() => assetService.get(id), [id]);
  const history = useApi(() => assetService.history(id), [id]);
  const docs = useApi(() => assetService.documents(id), [id]);
  const [status, setStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [editing, setEditing] = useState(false);

  const changeStatus = async () => {
    if (!status) return;
    setSavingStatus(true);
    try {
      await assetService.changeStatus(id, { status });
      detail.refetch();
      history.refetch();
      onChanged();
      setStatus('');
    } catch (err) {
      alert(err.message);
    }
    setSavingStatus(false);
  };

  const d = detail.data;

  return (
    <Modal open onClose={onClose} title={d ? `${d.assetTag} · ${d.assetName}` : 'Asset details'} maxWidth="680px">
      {detail.loading ? <Loading /> : detail.error ? <ErrorState message={detail.error} onRetry={detail.refetch} /> : d && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GhostButton onClick={() => setEditing((v) => !v)}>{editing ? 'Cancel edit' : 'Edit details'}</GhostButton>
          </div>

          {editing ? (
            <AssetEditForm asset={d} onSaved={() => { setEditing(false); detail.refetch(); history.refetch(); onChanged(); }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.8125rem' }}>
              <Info label="Status" value={<Badge status={ASSET_STATUS_LABELS[d.status]}>{ASSET_STATUS_LABELS[d.status]}</Badge>} />
              <Info label="Condition" value={toLabel(d.condition)} />
              <Info label="Category" value={d.categoryName} />
              <Info label="Department" value={d.departmentName} />
              <Info label="Location" value={d.location} />
              <Info label="Serial" value={d.serialNumber} />
              <Info label="Manufacturer" value={d.manufacturer} />
              <Info label="Model" value={d.model} />
              <Info label="Acquisition" value={formatDate(d.acquisitionDate)} />
              <Info label="Cost" value={d.acquisitionCost != null ? d.acquisitionCost : '—'} />
              <Info label="Vendor" value={d.vendor} />
              <Info label="Warranty" value={formatDate(d.warrantyExpiry)} />
              <Info label="Shared" value={d.shared ? 'Yes' : 'No'} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
            <Field label="Change status" style={{ flex: 1 }}>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Select new status…</option>
                {Object.values(ASSET_STATUS).map((s) => <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>)}
              </Select>
            </Field>
            <PrimaryButton onClick={changeStatus} disabled={!status || savingStatus}>{savingStatus ? '…' : 'Apply'}</PrimaryButton>
          </div>

          <AssetDocuments id={id} docs={docs} />

          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>History</h4>
            {history.loading ? <Loading /> : (history.data || []).length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No history recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 200, overflowY: 'auto' }}>
                {history.data.map((ev) => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.75rem', padding: '0.4rem 0.5rem', background: 'var(--bg-base)', borderRadius: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{toLabel(ev.eventType)}</strong>{ev.details ? ` — ${ev.details}` : ''}</span>
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(ev.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function AssetEditForm({ asset, onSaved }) {
  const [form, setForm] = useState({
    assetName: asset.assetName || '',
    location: asset.location || '',
    description: asset.description || '',
    departmentId: asset.departmentId || '',
    manufacturer: asset.manufacturer || '',
    model: asset.model || '',
    acquisitionCost: asset.acquisitionCost ?? '',
    vendor: asset.vendor || '',
    warrantyExpiry: asset.warrantyExpiry || '',
    condition: asset.condition || 'GOOD',
    shared: !!asset.shared,
    photoUrl: asset.photoUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const depts = useApi(() => departmentService.list({ active: true, size: 200 }), []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await assetService.update(asset.id, {
        assetName: form.assetName || undefined,
        location: form.location || undefined,
        description: form.description || undefined,
        departmentId: form.departmentId || undefined,
        manufacturer: form.manufacturer || undefined,
        model: form.model || undefined,
        acquisitionCost: form.acquisitionCost !== '' ? Number(form.acquisitionCost) : undefined,
        vendor: form.vendor || undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
        condition: form.condition || undefined,
        shared: form.shared,
        photoUrl: form.photoUrl || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="af-form-grid">
        <Field label="Asset name" full><Input value={form.assetName} onChange={set('assetName')} /></Field>
        <Field label="Location"><Input value={form.location} onChange={set('location')} /></Field>
        <Field label="Department">
          <Select value={form.departmentId} onChange={set('departmentId')}>
            <option value="">Select…</option>
            {(depts.data?.content || []).map((dep) => <option key={dep.id} value={dep.id}>{dep.departmentName}</option>)}
          </Select>
        </Field>
        <Field label="Manufacturer"><Input value={form.manufacturer} onChange={set('manufacturer')} /></Field>
        <Field label="Model"><Input value={form.model} onChange={set('model')} /></Field>
        <Field label="Acquisition cost"><Input type="number" min="0" value={form.acquisitionCost} onChange={set('acquisitionCost')} /></Field>
        <Field label="Vendor"><Input value={form.vendor} onChange={set('vendor')} /></Field>
        <Field label="Warranty expiry"><Input type="date" value={form.warrantyExpiry} onChange={set('warrantyExpiry')} /></Field>
        <Field label="Condition">
          <Select value={form.condition} onChange={set('condition')}>
            {Object.values(ASSET_CONDITION).map((c) => <option key={c} value={c}>{toLabel(c)}</option>)}
          </Select>
        </Field>
        <Field label="Description" full><Textarea value={form.description} onChange={set('description')} /></Field>
        <Field full>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.shared} onChange={set('shared')} /> Shared / bookable resource
          </label>
        </Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ marginTop: '0.85rem' }}>
        <PrimaryButton onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</PrimaryButton>
      </div>
    </div>
  );
}

function AssetDocuments({ id, docs }) {
  const [form, setForm] = useState({ documentName: '', documentUrl: '', documentType: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const add = async () => {
    if (!form.documentName || !form.documentUrl) { setError('Name and URL are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await assetService.addDocument(id, {
        documentName: form.documentName,
        documentUrl: form.documentUrl,
        documentType: form.documentType || undefined,
      });
      setForm({ documentName: '', documentUrl: '', documentType: '' });
      docs.refetch();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Documents</h4>
      {docs.loading ? <Loading /> : (docs.data || []).length === 0 ? (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No documents attached.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.6rem' }}>
          {docs.data.map((doc) => (
            <a key={doc.id} href={doc.documentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
              {doc.documentName}{doc.documentType ? ` · ${doc.documentType}` : ''}
            </a>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Input placeholder="Document name" value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })} style={{ flex: 1, minWidth: 140 }} />
        <Input placeholder="URL" value={form.documentUrl} onChange={(e) => setForm({ ...form, documentUrl: e.target.value })} style={{ flex: 1, minWidth: 140 }} />
        <Input placeholder="Type" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} style={{ width: 90 }} />
        <PrimaryButton onClick={add} disabled={saving}>{saving ? '…' : 'Add'}</PrimaryButton>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.7rem', marginTop: '0.4rem' }}>{error}</p>}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}
