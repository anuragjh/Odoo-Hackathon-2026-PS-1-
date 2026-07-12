import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppContext } from '../../context/AppContext';
import { 
  Shield, Search, SlidersHorizontal, Calendar, Info, Clock, 
  Check, Laptop, Armchair, Car, Plus, X, AlertTriangle, 
  FolderPlus 
} from 'lucide-react';

function AssetsDirectory() {
  const { assets, registerAsset, departments, employees } = useContext(AppContext);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Selection State
  const [selectedAsset, setSelectedAsset] = useState(assets[0] || null);

  // Register Modal State
  const [registerModal, setRegisterModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Electronics',
    serial: '',
    acqCost: '',
    location: '',
    isShared: false,
    condition: 'Excellent'
  });

  const [alert, setAlert] = useState(null);

  // Filter Logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = catFilter === 'All' || asset.category === catFilter;
    
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    
    // Dept matching check: either the asset holder's department, or location matching
    let matchesDept = true;
    if (deptFilter !== 'All') {
      const holderEmp = employees?.find(e => e.name === asset.holder);
      const holderDept = holderEmp ? holderEmp.department : '';
      matchesDept = 
        holderDept.toLowerCase() === deptFilter.toLowerCase() || 
        asset.location.toLowerCase().includes(deptFilter.toLowerCase());
    }
    
    return matchesSearch && matchesCat && matchesStatus && matchesDept;
  });

  // Handle register asset submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serial) {
      setAlert({ type: 'error', message: 'Asset Name and Serial Number are required.' });
      return;
    }

    const created = registerAsset({
      name: newAsset.name,
      category: newAsset.category,
      serial: newAsset.serial,
      acqDate: new Date().toISOString().split('T')[0],
      acqCost: Number(newAsset.acqCost) || 0,
      location: newAsset.location || 'Central Depot',
      isShared: newAsset.isShared,
      condition: newAsset.condition
    });

    setAlert({ type: 'success', message: 'Asset registered successfully!' });
    setRegisterModal(false);
    
    // Auto-select newly created asset
    if (created) {
      setSelectedAsset(created);
    }

    setNewAsset({
      name: '',
      category: 'Electronics',
      serial: '',
      acqCost: '',
      location: '',
      isShared: false,
      condition: 'Excellent'
    });

    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="af-page space-y-6 animate-slide-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Asset registrations and directory</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Search, filter, and register corporate IT, furniture, or transit fleet assets.</p>
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

      {/* Search & Actions Header Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by tag, serial, or API code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-card text-xs font-semibold"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        
        {/* Register Asset Button */}
        <button
          onClick={() => setRegisterModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#2563eb] text-white dark:bg-[#3b82f6] dark:text-[#0a0a0a] font-bold px-5 py-3 rounded-xl text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Asset</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-card border border-border p-3.5 rounded-2xl flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Category</label>
          <select 
            value={catFilter} 
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg text-[11px] focus:outline-none bg-background text-foreground"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg text-[11px] focus:outline-none bg-background text-foreground"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Department</label>
          <select 
            value={deptFilter} 
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-border rounded-lg text-[11px] focus:outline-none bg-background text-foreground"
          >
            <option value="All">All Departments</option>
            {departments?.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table & Details Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Panel */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">Tag</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-muted-foreground">
                      No assets found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-secondary/10 cursor-pointer transition-colors ${
                        selectedAsset?.id === asset.id ? 'bg-primary/5 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">{asset.id}</td>
                      <td className="py-3.5 px-4 text-foreground font-medium">{asset.name}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{asset.category}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          asset.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          asset.status === 'Allocated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400' :
                          asset.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400' :
                          asset.status === 'Reserved' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{asset.location}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Drawer Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          {selectedAsset ? (
            <div className="space-y-6">
              {/* Drawer Title Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-[#2563eb]/10 flex items-center justify-center text-primary">
                  {selectedAsset.category === 'Electronics' ? <Laptop className="w-6 h-6 text-[#2563eb] dark:text-[#3b82f6]" /> : selectedAsset.category === 'Furniture' ? <Armchair className="w-6 h-6 text-[#2563eb] dark:text-[#3b82f6]" /> : <Car className="w-6 h-6 text-[#2563eb] dark:text-[#3b82f6]" />}
                </div>
                <div>
                  <h2 className="font-bold text-foreground text-md">{selectedAsset.name}</h2>
                  <p className="text-xs text-muted-foreground">Asset Tag: <span className="font-mono font-bold text-primary">{selectedAsset.id}</span></p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="space-y-3.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Asset Specifications</h3>
                <div className="grid grid-cols-2 gap-3.5 text-xs leading-relaxed">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Category</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedAsset.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Serial Number</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedAsset.serial}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">HQ Location</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedAsset.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Condition</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedAsset.condition}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Acq Cost</span>
                    <p className="font-bold text-foreground mt-0.5">${selectedAsset.acqCost}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Acq Date</span>
                    <p className="font-bold text-foreground mt-0.5">{selectedAsset.acqDate}</p>
                  </div>
                  <div className="col-span-2 border-t border-border/60 pt-3">
                    <span className="text-muted-foreground text-[10px]">Current Custodian</span>
                    <p className="font-extrabold text-foreground mt-0.5">{selectedAsset.holder || 'None (In Depot)'}</p>
                  </div>
                </div>
              </div>

              {/* Lifecycle logs */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Audit & Lifecycle Logs</span>
                </h3>
                <div className="space-y-3.5 border-l border-border pl-3 ml-1.5 pt-1.5">
                  {selectedAsset.history?.map((log, index) => (
                    <div key={index} className="relative text-xs leading-relaxed">
                      <span className="absolute left-[-16.5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-card" />
                      <div className="font-semibold text-foreground text-[11px]">{log.action}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{log.date} &bull; User: {log.user}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
              Select an asset from the table directory to view specifications and tracking history.
            </div>
          )}
        </div>
      </div>

      {/* REGISTER ASSET MODAL DIALOG */}
      {registerModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRegisterModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl z-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Register New Asset</h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Asset Name</label>
                <input 
                  type="text" 
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g. MacBook Pro 14" 
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                  <select 
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles">Vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Serial Number</label>
                  <input 
                    type="text" 
                    value={newAsset.serial}
                    onChange={(e) => setNewAsset({...newAsset, serial: e.target.value})}
                    placeholder="e.g. SN-3928X" 
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Acquisition Cost ($)</label>
                  <input 
                    type="number" 
                    value={newAsset.acqCost}
                    onChange={(e) => setNewAsset({...newAsset, acqCost: e.target.value})}
                    placeholder="e.g. 1500" 
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Condition</label>
                  <select 
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">HQ Location / Room</label>
                <input 
                  type="text" 
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                  placeholder="e.g. Floor 2 Server Room" 
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isShared"
                  checked={newAsset.isShared}
                  onChange={(e) => setNewAsset({...newAsset, isShared: e.target.checked})}
                  className="rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="isShared" className="text-xs font-semibold text-muted-foreground">This is a shared resource (bookable by slots)</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setRegisterModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs hover:bg-secondary text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white font-bold rounded-lg text-xs hover:bg-[#2563eb]/95 transition-all"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AssetsDirectory;
