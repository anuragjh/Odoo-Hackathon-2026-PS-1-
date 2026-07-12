import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  FileCheck, ShieldAlert, User, Calendar, CheckSquare, 
  AlertTriangle, Lock, Unlock, FileSpreadsheet, Plus 
} from 'lucide-react';

function Audits() {
  const { 
    assets, employees, audits, setAudits, 
    logAuditItem, closeAuditCycle 
  } = useContext(AppContext);

  // Form states
  const [newAuditName, setNewAuditName] = useState('');
  const [newAuditScope, setNewAuditScope] = useState('IT & Server Assets');
  const [newAuditor, setNewAuditor] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Active Audit Cycle selection
  const [selectedAuditId, setSelectedAuditId] = useState(audits[0]?.id || '');
  const activeAudit = audits.find(aud => aud.id === selectedAuditId);

  // Create new audit cycle
  const handleCreateAudit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newAuditName || !newAuditor || !newStartDate || !newEndDate) {
      setErrorMsg('Please fill in all the audit cycle parameters.');
      return;
    }

    const auditorEmp = employees.find(emp => emp.id === Number(newAuditor));
    if (!auditorEmp) return;

    // Seed initial results for assets in scope
    // For demo, scope filters categories:
    // 'IT & Server Assets' -> Electronics
    // 'Office Equipment' -> Electronics + Furniture
    // 'Vehicle Fleet' -> Vehicles
    const scopeCategories = 
      newAuditScope === 'IT & Server Assets' ? ['Electronics'] :
      newAuditScope === 'Vehicle Fleet' ? ['Vehicles'] :
      ['Electronics', 'Furniture'];

    const assetsInScope = assets.filter(a => scopeCategories.includes(a.category));
    const initialResults = {};
    assetsInScope.forEach(a => {
      initialResults[a.id] = 'Pending';
    });

    const newCycle = {
      id: `AUD-${audits.length + 3002}`,
      name: newAuditName,
      scope: newAuditScope,
      startDate: newStartDate,
      endDate: newEndDate,
      auditor: auditorEmp.name,
      status: 'In Progress',
      results: initialResults,
      discrepancyCount: 0,
      history: 'Initiated new audit cycle.'
    };

    setAudits([newCycle, ...audits]);
    setSelectedAuditId(newCycle.id);
    setSuccessMsg(`Audit cycle ${newCycle.name} created!`);
    
    // Reset Form
    setNewAuditName('');
    setNewAuditor('');
    setNewStartDate('');
    setNewEndDate('');
  };

  const handleCheckOff = (assetId, result) => {
    if (!activeAudit || activeAudit.status === 'Closed') return;
    logAuditItem(activeAudit.id, assetId, result);
  };

  const handleCloseCycle = () => {
    if (!activeAudit) return;
    closeAuditCycle(activeAudit.id);
    setSuccessMsg(`Audit cycle ${activeAudit.name} locked. Asset database updated.`);
  };

  // Find assets scoping for the current active audit
  const scopeCategories = 
    activeAudit?.scope === 'IT & Server Assets' ? ['Electronics'] :
    activeAudit?.scope === 'Vehicle Fleet' ? ['Vehicles'] :
    ['Electronics', 'Furniture'];

  const scopingAssets = assets.filter(a => scopeCategories.includes(a.category));

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Asset Verification Audits</h1>
        <p className="text-xs text-muted-foreground">Schedule periodic inventory checks, record conditions, and auto-flag discrepancies.</p>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs flex justify-between items-center animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:underline text-[10px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Audit Form */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" />
            <span>Launch Audit Cycle</span>
          </h2>
          <form onSubmit={handleCreateAudit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cycle Name</label>
              <input 
                type="text"
                placeholder="e.g. Q3 Server Rack Verification"
                value={newAuditName}
                onChange={(e) => setNewAuditName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Audit Scope</label>
              <select 
                value={newAuditScope}
                onChange={(e) => setNewAuditScope(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="IT & Server Assets">IT & Server Assets (Electronics)</option>
                <option value="Office Equipment">Office Equipment (Electronics + Furniture)</option>
                <option value="Vehicle Fleet">Vehicle Fleet (Vehicles)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Assign Lead Auditor</label>
              <select 
                value={newAuditor}
                onChange={(e) => setNewAuditor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">-- Choose Auditor --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Date</label>
                <input 
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">End Date</label>
                <input 
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md"
            >
              Initiate Verification Cycle
            </button>
          </form>
        </div>

        {/* Auditor Checklist & Workspace */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selector header */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs font-semibold">Select Active Audit Cycle:</div>
            <select 
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="w-full sm:w-60 px-3 py-1.5 border rounded-lg text-xs bg-background focus:outline-none"
            >
              {audits.map(aud => (
                <option key={aud.id} value={aud.id}>{aud.name} ({aud.status})</option>
              ))}
            </select>
          </div>

          {activeAudit ? (
            <div className="space-y-6">
              
              {/* Audit specs card */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-bold text-base text-foreground">{activeAudit.name}</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Scope: {activeAudit.scope} &bull; Auditor: {activeAudit.auditor}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    activeAudit.status === 'Closed' ? 'bg-secondary text-muted-foreground' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                    {activeAudit.status === 'Closed' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 animate-pulse" />}
                    <span>Cycle {activeAudit.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Duration: <span className="font-semibold text-foreground">{activeAudit.startDate} to {activeAudit.endDate}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Discrepancies flagged: <span className="font-bold text-rose-600">{activeAudit.discrepancyCount}</span></span>
                  </div>
                </div>

                {/* Close cycle trigger */}
                {activeAudit.status === 'In Progress' && (
                  <div className="pt-2 border-t border-border flex justify-end">
                    <button 
                      onClick={handleCloseCycle}
                      className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1 hover:bg-primary/95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock & Close Audit Cycle</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Scoping Assets checklist */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Audited Inventory Checksheets</h3>
                <div className="space-y-3">
                  {scopingAssets.map(asset => {
                    const result = activeAudit.results[asset.id] || 'Pending';
                    return (
                      <div 
                        key={asset.id} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-secondary/20 transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{asset.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">({asset.id})</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">S/N: {asset.serial} &bull; Expected Location: {asset.location}</p>
                        </div>

                        {/* Audit Verification controls */}
                        <div className="flex gap-1.5 self-end sm:self-center">
                          {activeAudit.status === 'In Progress' ? (
                            <>
                              {['Verified', 'Missing', 'Damaged'].map(btn => (
                                <button
                                  key={btn}
                                  onClick={() => handleCheckOff(asset.id, btn)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                                    result === btn 
                                      ? btn === 'Verified' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' 
                                        : btn === 'Missing' ? 'bg-rose-100 border-rose-300 text-rose-800'
                                        : 'bg-amber-100 border-amber-300 text-amber-800'
                                      : 'bg-background hover:bg-secondary border-border'
                                  }`}
                                >
                                  {btn}
                                </button>
                              ))}
                            </>
                          ) : (
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border ${
                              result === 'Verified' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              result === 'Missing' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                              result === 'Damaged' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-secondary border-border text-muted-foreground'
                            }`}>
                              Logged: {result}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generated discrepancy report summary (Only visible when closed) */}
              {activeAudit.status === 'Closed' && activeAudit.discrepancyCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/20 rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-rose-600" />
                    <span>Discrepancy Report Summary</span>
                  </h3>
                  <p className="text-xs text-rose-800 dark:text-rose-400">
                    The following assets were flagged. Database status updates have locked:
                  </p>
                  <div className="space-y-1.5">
                    {scopingAssets.filter(a => activeAudit.results[a.id] === 'Missing' || activeAudit.results[a.id] === 'Damaged').map(asset => (
                      <div key={asset.id} className="bg-card border border-rose-100 dark:border-rose-950/20 p-3 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-foreground">{asset.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">({asset.id})</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeAudit.results[asset.id] === 'Missing' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activeAudit.results[asset.id]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl py-12 text-center text-xs text-muted-foreground">
              Select or create an audit cycle to begin verification checklists.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Audits;
