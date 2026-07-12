import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { departmentService, categoryService, employeeService } from '../../services/resourceService';
import EmployeeDirectory from '../ui/EmployeeDirectory';
import {
  Loading, ErrorState, DataTable, Td, Field, Input, Textarea, Select,
  PrimaryButton, GhostButton,
} from '../ui/DataStates';

export default function OrganizationSetup() {
  const [tab, setTab] = useState('departments');
  return (
    <div style={{ padding: '1.5rem' }}>
      <PageHeader title="Organization Setup" subtitle="Maintain departments, asset categories and the employee directory" />
      <div className="af-tabs">
        <button className={`af-tab${tab === 'departments' ? ' active' : ''}`} onClick={() => setTab('departments')}>Departments</button>
        <button className={`af-tab${tab === 'categories' ? ' active' : ''}`} onClick={() => setTab('categories')}>Asset Categories</button>
        <button className={`af-tab${tab === 'employees' ? ' active' : ''}`} onClick={() => setTab('employees')}>Employee Directory</button>
      </div>
      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'employees' && <EmployeeDirectory />}
    </div>
  );
}

function DepartmentsTab() {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const list = useApi(() => departmentService.list({ size: 100 }), []);

  const toggle = async (d) => {
    try {
      await (d.active ? departmentService.deactivate(d.id) : departmentService.activate(d.id));
      list.refetch();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
        <PrimaryButton onClick={() => setCreating(true)}><Plus size={15} style={{ marginRight: 4 }} /> New Department</PrimaryButton>
      </div>
      {list.loading ? <Loading /> : list.error ? <ErrorState message={list.error} onRetry={list.refetch} /> : (
        <DataTable
          columns={['Name', 'Code', 'Parent', 'Head', 'Status', '']}
          rows={list.data?.content || []}
          empty="No departments yet."
          renderRow={(d) => (
            <tr key={d.id}>
              <Td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.departmentName}</Td>
              <Td>{d.departmentCode || '—'}</Td>
              <Td>{d.parentDepartmentName || '—'}</Td>
              <Td>{d.departmentHeadName || '—'}</Td>
              <Td><Badge status={d.active ? 'active' : 'inactive'}>{d.active ? 'Active' : 'Inactive'}</Badge></Td>
              <Td>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <GhostButton onClick={() => setEditing(d)}>Edit</GhostButton>
                  <GhostButton onClick={() => toggle(d)}>{d.active ? 'Deactivate' : 'Activate'}</GhostButton>
                </div>
              </Td>
            </tr>
          )}
        />
      )}
      {(creating || editing) && (
        <DepartmentModal
          department={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onDone={() => { setCreating(false); setEditing(null); list.refetch(); }}
        />
      )}
    </div>
  );
}

function DepartmentModal({ department, onClose, onDone }) {
  const isEdit = !!department;
  const [form, setForm] = useState({
    departmentName: department?.departmentName || '',
    departmentCode: department?.departmentCode || '',
    description: department?.description || '',
    parentDepartmentId: department?.parentDepartmentId || '',
    departmentHeadId: department?.departmentHeadId || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const depts = useApi(() => departmentService.list({ active: true, size: 200 }), []);
  const emps = useApi(() => employeeService.list({ status: 'ACTIVE', size: 200 }), []);

  const submit = async () => {
    if (!form.departmentName) { setError('Department name is required.'); return; }
    setSaving(true);
    setError('');
    const body = {
      departmentName: form.departmentName,
      departmentCode: form.departmentCode || undefined,
      description: form.description || undefined,
      parentDepartmentId: form.parentDepartmentId || undefined,
      departmentHeadId: form.departmentHeadId || undefined,
    };
    try {
      if (isEdit) await departmentService.update(department.id, body);
      else await departmentService.create(body);
      onDone();
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Department' : 'New Department'} maxWidth="520px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Department name" required><Input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} /></Field>
        <Field label="Code"><Input value={form.departmentCode} onChange={(e) => setForm({ ...form, departmentCode: e.target.value })} /></Field>
        <Field label="Parent department">
          <Select value={form.parentDepartmentId} onChange={(e) => setForm({ ...form, parentDepartmentId: e.target.value })}>
            <option value="">— None —</option>
            {(depts.data?.content || []).filter((d) => d.id !== department?.id).map((d) => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
          </Select>
        </Field>
        <Field label="Department head">
          <Select value={form.departmentHeadId} onChange={(e) => setForm({ ...form, departmentHeadId: e.target.value })}>
            <option value="">— None —</option>
            {(emps.data?.content || []).map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </Select>
        </Field>
        <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}</PrimaryButton>
      </div>
    </Modal>
  );
}

function CategoriesTab() {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const list = useApi(() => categoryService.list({ size: 100 }), []);

  const toggle = async (c) => {
    try {
      await (c.active ? categoryService.deactivate(c.id) : categoryService.activate(c.id));
      list.refetch();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
        <PrimaryButton onClick={() => setCreating(true)}><Plus size={15} style={{ marginRight: 4 }} /> New Category</PrimaryButton>
      </div>
      {list.loading ? <Loading /> : list.error ? <ErrorState message={list.error} onRetry={list.refetch} /> : (
        <DataTable
          columns={['Name', 'Code', 'Description', 'Status', '']}
          rows={list.data?.content || []}
          empty="No categories yet."
          renderRow={(c) => (
            <tr key={c.id}>
              <Td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.categoryName}</Td>
              <Td>{c.categoryCode || '—'}</Td>
              <Td>{c.description || '—'}</Td>
              <Td><Badge status={c.active ? 'active' : 'inactive'}>{c.active ? 'Active' : 'Inactive'}</Badge></Td>
              <Td>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <GhostButton onClick={() => setEditing(c)}>Edit</GhostButton>
                  <GhostButton onClick={() => toggle(c)}>{c.active ? 'Deactivate' : 'Activate'}</GhostButton>
                </div>
              </Td>
            </tr>
          )}
        />
      )}
      {(creating || editing) && (
        <CategoryModal
          category={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onDone={() => { setCreating(false); setEditing(null); list.refetch(); }}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose, onDone }) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    categoryName: category?.categoryName || '',
    categoryCode: category?.categoryCode || '',
    description: category?.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.categoryName) { setError('Category name is required.'); return; }
    setSaving(true);
    setError('');
    const body = {
      categoryName: form.categoryName,
      categoryCode: form.categoryCode || undefined,
      description: form.description || undefined,
    };
    try {
      if (isEdit) await categoryService.update(category.id, body);
      else await categoryService.create(body);
      onDone();
    } catch (err) {
      setError(err.fieldErrors ? Object.values(err.fieldErrors).join(' ') : err.message);
    }
    setSaving(false);
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Category' : 'New Category'} maxWidth="460px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <Field label="Category name" required><Input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} /></Field>
        <Field label="Code"><Input value={form.categoryCode} onChange={(e) => setForm({ ...form, categoryCode: e.target.value })} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.6rem' }}>{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={submit} disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}</PrimaryButton>
      </div>
    </Modal>
  );
}
