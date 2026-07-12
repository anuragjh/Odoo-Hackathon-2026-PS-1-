import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Users, Search, Mail, Phone, Plus, UserPlus, Info } from 'lucide-react';

function Team() {
  const { employees, setEmployees, assets } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [addMemberModal, setAddMemberModal] = useState(false);

  // Form states
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Employee', department: 'Product Development' });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    const newEmp = {
      id: employees.length + 1,
      status: 'Active',
      ...newMember
    };

    setEmployees([...employees, newEmp]);
    setNewMember({ name: '', email: '', role: 'Employee', department: 'Product Development' });
    setAddMemberModal(false);
  };

  const getAllocatedAssetsForEmployee = (employeeName) => {
    return assets.filter(a => a.holder === employeeName);
  };

  // Filters
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="af-page space-y-6 animate-slide-in-up">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-xs text-muted-foreground">Manage employee allocations, permissions, and security roles.</p>
        </div>
        
        <button 
          onClick={() => setAddMemberModal(true)}
          className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-md"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filter Header */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search employees by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-sm"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Dropdown Filters */}
        <select 
          value={deptFilter} 
          onChange={(e) => setDeptFilter(e.target.value)}
          className="w-full md:w-44 px-3 py-2 border rounded-lg focus:outline-none text-xs bg-background"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Operations">Operations</option>
          <option value="Product Development">Product Development</option>
          <option value="Quality Assurance">Quality Assurance</option>
          <option value="IT Support">IT Support</option>
        </select>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          const empAssets = getAllocatedAssetsForEmployee(emp.name);
          return (
            <div key={emp.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              {/* Profile header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm leading-none">{emp.name}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{emp.email}</p>
                </div>
              </div>

              {/* Roles & Depts Info */}
              <div className="grid grid-cols-2 gap-2 text-[11px] leading-relaxed">
                <div>
                  <span className="text-muted-foreground font-semibold">Department</span>
                  <p className="font-bold text-foreground mt-0.5">{emp.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">System Role</span>
                  <p className="font-bold text-primary mt-0.5">{emp.role}</p>
                </div>
              </div>

              {/* Allocated Assets lists */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Allocated Assets ({empAssets.length})</span>
                {empAssets.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground/60 italic">No assets held.</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {empAssets.map(a => (
                      <span key={a.id} className="text-[9px] font-semibold bg-secondary px-2 py-0.5 rounded text-foreground border border-border" title={a.name}>
                        {a.id}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions buttons */}
              <div className="flex gap-2 pt-2 border-t border-border/40 justify-end">
                <a href={`mailto:${emp.email}`} className="p-1.5 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Email Employee">
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <button className="p-1.5 border hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Call Employee">
                  <Phone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddMemberModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm p-6 rounded-2xl shadow-xl">
            <h2 className="text-sm font-bold text-foreground mb-4">Add Employee</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Raj Patel"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
                <input 
                  type="email"
                  placeholder="e.g. raj@assetflow.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Department</label>
                  <select 
                    value={newMember.department}
                    onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                    className="w-full px-2 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Product Development">Product Development</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="IT Support">IT Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Default Role</label>
                  <select 
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-2 py-2 border rounded-lg text-xs focus:outline-none bg-background"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddMemberModal(false)} className="px-3 py-1.5 border rounded-lg text-xs hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
