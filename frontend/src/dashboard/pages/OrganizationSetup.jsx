import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { Building2, Tag, Users, Plus, Trash2, Shield } from 'lucide-react';

/* ── Tabs config ──────────────────────────────────────────────── */
const TABS = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'categories',  label: 'Categories',  icon: Tag },
  { id: 'employees',   label: 'Employees',   icon: Users },
];

/* ── Role badge variant map ───────────────────────────────────── */
const ROLE_VARIANT = {
  'Admin':           'danger',
  'Asset Manager':   'info',
  'Department Head': 'warning',
  'Employee':        'neutral',
};

function OrganizationSetup() {
  const {
    employees, setEmployees,
    departments, setDepartments,
    categories, setCategories,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('departments');
  const [addType, setAddType]     = useState('department');
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Form states
  const [newDept, setNewDept] = useState({ name: '', head: '', parent: 'None' });
  const [newCat,  setNewCat]  = useState({ name: '', customFields: '' });
  const [newEmp,  setNewEmp]  = useState({ name: '', email: '', role: 'Employee', department: '' });

  const [alert, setAlert] = useState(null);

  /* ── Helpers ─────────────────────────────────────────────────── */
  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3500);
  };

  const toggleDeptStatus = (id) => {
    setDepartments(departments.map(d =>
      d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
    ));
    triggerAlert('success', 'Department status updated.');
  };

  const toggleEmpStatus = (id) => {
    setEmployees(employees.map(e =>
      e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e
    ));
    triggerAlert('success', 'Employee status updated.');
  };

  /* ── Add Handlers ─────────────────────────────────────────────── */
  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.head) {
      triggerAlert('danger', 'Department Name and Head of Department are required.');
      return;
    }
    const nextId = departments.length ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    setDepartments([...departments, { id: nextId, ...newDept, status: 'Active' }]);
    setNewDept({ name: '', head: '', parent: 'None' });
    triggerAlert('success', 'New Department added successfully!');
    setShowAddPanel(false);
    setActiveTab('departments');
  };

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.customFields) {
      triggerAlert('danger', 'Category Name and Custom Fields are required.');
      return;
    }
    const nextId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    setCategories([...categories, { id: nextId, ...newCat }]);
    setNewCat({ name: '', customFields: '' });
    triggerAlert('success', 'Category schema added successfully!');
    setShowAddPanel(false);
    setActiveTab('categories');
  };

  const handleAddEmp = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.department) {
      triggerAlert('danger', 'Employee Name, Email, and Department are required.');
      return;
    }
    const nextId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, { id: nextId, ...newEmp, status: 'Active' }]);
    setNewEmp({ name: '', email: '', role: 'Employee', department: '' });
    triggerAlert('success', 'Employee registered successfully!');
    setShowAddPanel(false);
    setActiveTab('employees');
  };

  /* ── Render helpers ───────────────────────────────────────────── */
  const FormLabel = ({ children }) => (
    <label className="af-label">{children}</label>
  );

  const FormInput = (props) => (
    <input {...props} />
  );

  const FormSelect = ({ children, ...props }) => (
    <select {...props}>{children}</select>
  );

  return (
    <div className="af-page animate-slide-in-up">
      {/* Page Header */}
      <PageHeader
        title="Organisation Setup"
        subtitle="Manage departments, asset category schemas, and employee accounts."
      >
        <button
          className="af-btn af-btn-primary"
          onClick={() => {
            setShowAddPanel(!showAddPanel);
            setAddType(activeTab === 'departments' ? 'department' : activeTab === 'categories' ? 'category' : 'employee');
          }}
        >
          <Plus size={14} />
          Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
        </button>
      </PageHeader>

      {/* Alert */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* Info note */}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Adding a department here also drives the tab panels for the asset allocation forms in Screens 5 &amp; 6.
      </p>

      {/* Tabs + Table Card */}
      <div className="af-card" style={{ overflow: 'hidden' }}>
        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
          }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`af-tab${activeTab === id ? ' active' : ''}`}
              onClick={() => { setActiveTab(id); setShowAddPanel(false); }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Table Panels */}
        <div>
          {/* Departments */}
          {activeTab === 'departments' && (
            <div>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Department Registry
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="af-table">
                  <thead>
                    <tr>
                      <th>Department Name</th>
                      <th>Head of Dept</th>
                      <th>Parent Dept</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept.id}>
                        <td className="af-table-primary">{dept.name}</td>
                        <td>{dept.head}</td>
                        <td>{dept.parent}</td>
                        <td>
                          <Badge variant={dept.status === 'Active' ? 'success' : 'neutral'}>
                            {dept.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="af-btn af-btn-secondary"
                            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                            onClick={() => toggleDeptStatus(dept.id)}
                          >
                            {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No departments added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Custom Category Schema Fields
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="af-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Custom Spec Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td className="af-table-primary">{cat.name}</td>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {cat.customFields}
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No categories defined yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Employees */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Staff Directory &amp; Permissions
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="af-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Email Address</th>
                      <th>Department</th>
                      <th>System Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td className="af-table-primary">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '26px', height: '26px', borderRadius: '50%',
                                background: 'var(--accent-bg)',
                                border: '1px solid var(--accent-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', fontWeight: 800, color: 'var(--accent)',
                                flexShrink: 0,
                              }}
                            >
                              {emp.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            {emp.name}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>
                          <Badge variant={ROLE_VARIANT[emp.role] ?? 'neutral'}>
                            {emp.role}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={emp.status === 'Active' ? 'success' : 'neutral'}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="af-btn af-btn-secondary"
                            style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                            onClick={() => toggleEmpStatus(emp.id)}
                          >
                            {emp.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No employees registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Panel (slides in below tabs) ──────────────────────── */}
      {showAddPanel && (
        <div className="af-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Add New {addType === 'department' ? 'Department' : addType === 'category' ? 'Category Schema' : 'Employee'}
            </h2>
            {/* Type switcher for + Add */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-elevated)', padding: '0.2rem', borderRadius: 'var(--radius)' }}>
              {[
                { val: 'department', label: 'Dept' },
                { val: 'category', label: 'Category' },
                { val: 'employee', label: 'Employee' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setAddType(val)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 'calc(var(--radius) - 2px)',
                    border: 'none',
                    cursor: 'pointer',
                    background: addType === val ? 'var(--bg-surface)' : 'transparent',
                    color: addType === val ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Department Form */}
          {addType === 'department' && (
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '480px' }}>
              <div>
                <FormLabel>Department Name</FormLabel>
                <FormInput
                  type="text"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g. Marketing"
                />
              </div>
              <div>
                <FormLabel>Head of Department</FormLabel>
                <FormSelect
                  value={newDept.head}
                  onChange={e => setNewDept({ ...newDept, head: e.target.value })}
                >
                  <option value="">— Select Employee —</option>
                  {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </FormSelect>
              </div>
              <div>
                <FormLabel>Parent Department</FormLabel>
                <FormSelect
                  value={newDept.parent}
                  onChange={e => setNewDept({ ...newDept, parent: e.target.value })}
                >
                  <option value="None">None (Top-level)</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </FormSelect>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="af-btn af-btn-primary">Create Department</button>
                <button type="button" className="af-btn af-btn-secondary" onClick={() => setShowAddPanel(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* Category Form */}
          {addType === 'category' && (
            <form onSubmit={handleAddCat} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '480px' }}>
              <div>
                <FormLabel>Category Name</FormLabel>
                <FormInput
                  type="text"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Lab Equipment"
                />
              </div>
              <div>
                <FormLabel>Custom Fields (comma-separated specifications)</FormLabel>
                <FormInput
                  type="text"
                  value={newCat.customFields}
                  onChange={e => setNewCat({ ...newCat, customFields: e.target.value })}
                  placeholder="e.g. Calibration Date, Voltage, Warranty"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="af-btn af-btn-primary">Create Category Schema</button>
                <button type="button" className="af-btn af-btn-secondary" onClick={() => setShowAddPanel(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* Employee Form */}
          {addType === 'employee' && (
            <form onSubmit={handleAddEmp} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '480px' }}>
              <div>
                <FormLabel>Full Name</FormLabel>
                <FormInput
                  type="text"
                  value={newEmp.name}
                  onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                  placeholder="e.g. Priya Shah"
                />
              </div>
              <div>
                <FormLabel>Corporate Email</FormLabel>
                <FormInput
                  type="email"
                  value={newEmp.email}
                  onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                  placeholder="e.g. priya@company.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.875rem]">
                <div>
                  <FormLabel>System Role</FormLabel>
                  <FormSelect value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}>
                    <option value="Employee">Employee</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Admin">Admin</option>
                  </FormSelect>
                </div>
                <div>
                  <FormLabel>Department</FormLabel>
                  <FormSelect value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}>
                    <option value="">— Select Dept —</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </FormSelect>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="af-btn af-btn-primary">Register Employee</button>
                <button type="button" className="af-btn af-btn-secondary" onClick={() => setShowAddPanel(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default OrganizationSetup;
