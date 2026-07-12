import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Building2, Tag, Users, Plus, Check, X, Shield, ShieldAlert, Sparkles } from 'lucide-react';

function OrganizationSetup() {
  const { 
    employees, setEmployees, 
    departments, setDepartments, 
    categories, setCategories 
  } = useContext(AppContext);

  // Selected tab: 'departments' | 'categories' | 'employees' | 'add'
  const [activeTab, setActiveTab] = useState('departments');

  // Addition Form States
  const [addType, setAddType] = useState('department'); // department | category | employee

  // Add Department State
  const [newDept, setNewDept] = useState({ name: '', head: '', parent: 'None' });

  // Add Category State
  const [newCat, setNewCat] = useState({ name: '', customFields: '' });

  // Add Employee State
  const [newEmp, setNewEmp] = useState({ name: '', email: '', role: 'Employee', department: '' });

  // Success / Error Alerts
  const [alert, setAlert] = useState(null);

  // Toggle active/inactive status
  const toggleDeptStatus = (id) => {
    setDepartments(departments.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return d;
    }));
    triggerAlert('success', 'Department status updated.');
  };

  const toggleEmpStatus = (id) => {
    setEmployees(employees.map(e => {
      if (e.id === id) {
        return { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return e;
    }));
    triggerAlert('success', 'Employee status updated.');
  };

  // Trigger helper
  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  // Add Submission handlers
  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.head) {
      triggerAlert('error', 'Department Name and Head of Dept are required.');
      return;
    }
    const nextId = departments.length ? Math.max(...departments.map(d => d.id)) + 1 : 1;
    setDepartments([...departments, {
      id: nextId,
      name: newDept.name,
      head: newDept.head,
      parent: newDept.parent,
      status: 'Active'
    }]);
    setNewDept({ name: '', head: '', parent: 'None' });
    triggerAlert('success', 'New Department added successfully!');
    setActiveTab('departments');
  };

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.customFields) {
      triggerAlert('error', 'Category Name and Custom Fields are required.');
      return;
    }
    const nextId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    setCategories([...categories, {
      id: nextId,
      name: newCat.name,
      customFields: newCat.customFields
    }]);
    setNewCat({ name: '', customFields: '' });
    triggerAlert('success', 'New Category added successfully!');
    setActiveTab('categories');
  };

  const handleAddEmp = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.department) {
      triggerAlert('error', 'Employee Name, Email, and Department are required.');
      return;
    }
    const nextId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, {
      id: nextId,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      department: newEmp.department,
      status: 'Active'
    }]);
    setNewEmp({ name: '', email: '', role: 'Employee', department: '' });
    triggerAlert('success', 'New Employee added successfully!');
    setActiveTab('employees');
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Organization Setup</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Manage departments, custom category schemas, and employee credentials.</p>
      </div>

      {/* Alert Notices */}
      {alert && (
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-300 ${
          alert.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 font-semibold text-xs' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs'
        }`}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} className="text-[10px] font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Tab Selection Row */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#e0e8f6] dark:bg-[#181818] rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'departments' 
              ? 'bg-[#f0f4fc] dark:bg-[#202020] text-[#2563eb] shadow-inner' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments</span>
        </button>
        
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories' 
              ? 'bg-[#f0f4fc] dark:bg-[#202020] text-[#2563eb] shadow-inner' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'employees' 
              ? 'bg-[#f0f4fc] dark:bg-[#202020] text-[#2563eb] shadow-inner' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employees</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'add' 
              ? 'bg-[#2563eb] text-white shadow-md' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>+ Add</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        
        {/* Departments Panel */}
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Department Registry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-4">Dept Name</th>
                    <th className="py-3 px-4">Head of Dept</th>
                    <th className="py-3 px-4">Parent Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">{dept.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{dept.head}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{dept.parent}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          dept.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleDeptStatus(dept.id)}
                          className="px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold hover:bg-secondary transition-colors"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Panel */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Custom Category Schema Fields</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Custom Spec Fields</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">{cat.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{cat.customFields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Employees Panel */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground">Staff Directory & Active Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground">{emp.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{emp.email}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{emp.department}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-semibold">{emp.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => toggleEmpStatus(emp.id)}
                          className="px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold hover:bg-secondary transition-colors"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Panel */}
        {activeTab === 'add' && (
          <div className="space-y-6">
            {/* Form Selection Radio Button Box */}
            <div className="flex gap-4 p-4 border border-border rounded-2xl bg-secondary/20 max-w-md">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input 
                  type="radio" 
                  name="addType" 
                  value="department" 
                  checked={addType === 'department'} 
                  onChange={(e) => setAddType(e.target.value)} 
                  className="text-primary focus:ring-primary/20" 
                />
                <span>Department</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input 
                  type="radio" 
                  name="addType" 
                  value="category" 
                  checked={addType === 'category'} 
                  onChange={(e) => setAddType(e.target.value)} 
                  className="text-primary focus:ring-primary/20" 
                />
                <span>Category</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                <input 
                  type="radio" 
                  name="addType" 
                  value="employee" 
                  checked={addType === 'employee'} 
                  onChange={(e) => setAddType(e.target.value)} 
                  className="text-primary focus:ring-primary/20" 
                />
                <span>Employee</span>
              </label>
            </div>

            {/* Department Form */}
            {addType === 'department' && (
              <form onSubmit={handleAddDept} className="space-y-4 max-w-md">
                <h3 className="text-sm font-bold text-foreground">Add New Department</h3>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Department Name</label>
                  <input
                    type="text"
                    value={newDept.name}
                    onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                    placeholder="e.g. Marketing"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Head of Department</label>
                  <select
                    value={newDept.head}
                    onChange={(e) => setNewDept({...newDept, head: e.target.value})}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Parent Department</label>
                  <select
                    value={newDept.parent}
                    onChange={(e) => setNewDept({...newDept, parent: e.target.value})}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="None">None</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg text-xs hover:bg-[#2563eb]/95 transition-all"
                >
                  Create Department
                </button>
              </form>
            )}

            {/* Category Form */}
            {addType === 'category' && (
              <form onSubmit={handleAddCat} className="space-y-4 max-w-md">
                <h3 className="text-sm font-bold text-foreground">Add New Custom Field Category</h3>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCat.name}
                    onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                    placeholder="e.g. Lab Equipment"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Custom Fields (comma-separated specifications)</label>
                  <input
                    type="text"
                    value={newCat.customFields}
                    onChange={(e) => setNewCat({...newCat, customFields: e.target.value})}
                    placeholder="e.g. Calibration Date, Voltage"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg text-xs hover:bg-[#2563eb]/95 transition-all"
                >
                  Create Category Schema
                </button>
              </form>
            )}

            {/* Employee Form */}
            {addType === 'employee' && (
              <form onSubmit={handleAddEmp} className="space-y-4 max-w-md">
                <h3 className="text-sm font-bold text-foreground">Register Employee Credentials</h3>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                    placeholder="e.g. Priya Shah"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                    placeholder="e.g. priya@company.com"
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">System Role</label>
                    <select
                      value={newEmp.role}
                      onChange={(e) => setNewEmp({...newEmp, role: e.target.value})}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Department Head">Department Head</option>
                      <option value="Asset Manager">Asset Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Department</label>
                    <select
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({...newEmp, department: e.target.value})}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                    >
                      <option value="">-- Choose Dept --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg text-xs hover:bg-[#2563eb]/95 transition-all"
                >
                  Register Staff Member
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationSetup;
