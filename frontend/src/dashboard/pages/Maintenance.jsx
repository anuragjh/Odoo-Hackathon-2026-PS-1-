import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Hammer, AlertTriangle, User, UserCheck, Play, CheckCircle2, History, Plus } from 'lucide-react';

function Maintenance() {
  const { 
    assets, maintenance, employees, currentUser,
    raiseMaintenance, updateMaintenanceStatus 
  } = useContext(AppContext);

  // States
  const [newMaint, setNewMaint] = useState({ assetId: '', issue: '', priority: 'Medium' });
  const [assigneeId, setAssigneeId] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, Active, Resolved

  const handleMaintSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!newMaint.assetId || !newMaint.issue) {
      setErrorMsg('Asset selection and issue description are required.');
      return;
    }

    const res = raiseMaintenance({
      assetId: newMaint.assetId,
      issue: newMaint.issue,
      priority: newMaint.priority
    });

    if (res.success) {
      setSuccessMsg('Repair ticket raised successfully!');
      setNewMaint({ assetId: '', issue: '', priority: 'Medium' });
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleAction = (ticketId, nextStatus, techName) => {
    updateMaintenanceStatus(ticketId, nextStatus, techName);
    setSuccessMsg(`Ticket status updated to ${nextStatus}.`);
  };

  const handleAssign = (ticketId) => {
    const techId = assigneeId[ticketId];
    if (!techId) return;
    const tech = employees.find(e => e.id === Number(techId));
    if (!tech) return;

    handleAction(ticketId, 'Technician Assigned', tech.name);
  };

  // Filter logic
  const filteredTickets = maintenance.filter(t => {
    if (activeTab === 'Pending') return t.status === 'Pending';
    if (activeTab === 'Active') return t.status === 'Approved' || t.status === 'Technician Assigned' || t.status === 'In Progress';
    if (activeTab === 'Resolved') return t.status === 'Resolved';
    return true;
  });

  return (
    <div className="af-page space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Maintenance Management</h1>
        <p className="text-xs text-muted-foreground">Route asset repair approvals and assign IT/Facilities support technicians.</p>
      </div>

      {/* Notices */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:underline text-[10px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Raise Form */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-primary" />
            <span>Raise Maintenance Ticket</span>
          </h2>
          <form onSubmit={handleMaintSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Select malfunctioning Asset</label>
              <select 
                value={newMaint.assetId}
                onChange={(e) => setNewMaint({...newMaint, assetId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Issue Description</label>
              <textarea 
                value={newMaint.issue}
                onChange={(e) => setNewMaint({...newMaint, issue: e.target.value})}
                placeholder="Details of the issue..."
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background h-24"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Urgency Priority</label>
              <select 
                value={newMaint.priority}
                onChange={(e) => setNewMaint({...newMaint, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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
              Raise Repair Ticket
            </button>
          </form>
        </div>

        {/* Tickets Board */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 text-xs font-medium">
            {['All', 'Pending', 'Active', 'Resolved'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg border transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm' 
                    : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {tab} Tickets
              </button>
            ))}
          </div>

          {/* Tickets List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl py-12 text-center text-xs text-muted-foreground">
                No maintenance tickets found for this category.
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div key={ticket.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  {/* Top Bar */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{ticket.assetName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({ticket.assetId})</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Ticket ID: {ticket.id} &bull; Date: {ticket.date}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                        ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ticket.priority} Priority
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border">
                    {ticket.issue}
                  </p>

                  {/* Technician details */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      <span>Technician: <span className="font-semibold text-foreground">{ticket.technician}</span></span>
                    </div>

                    {/* Workflow Operations Action triggers */}
                    <div className="flex flex-wrap gap-2">
                      {/* Approve button */}
                      {ticket.status === 'Pending' && currentUser.role === 'Asset Manager' && (
                        <button 
                          onClick={() => handleAction(ticket.id, 'Approved')}
                          className="bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-lg text-[10px]"
                        >
                          Approve Request
                        </button>
                      )}

                      {/* Technician assign form */}
                      {ticket.status === 'Approved' && currentUser.role === 'Asset Manager' && (
                        <div className="flex gap-1.5 items-center">
                          <select 
                            onChange={(e) => setAssigneeId({ ...assigneeId, [ticket.id]: e.target.value })}
                            className="px-2 py-1 border rounded-lg text-[10px] bg-background"
                          >
                            <option value="">-- Assign Support --</option>
                            {employees.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleAssign(ticket.id)}
                            className="bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        </div>
                      )}

                      {/* Start Work button */}
                      {ticket.status === 'Technician Assigned' && (
                        <button 
                          onClick={() => handleAction(ticket.id, 'In Progress')}
                          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start Work</span>
                        </button>
                      )}

                      {/* Resolve button */}
                      {ticket.status === 'In Progress' && (
                        <button 
                          onClick={() => handleAction(ticket.id, 'Resolved')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Logs toggle option */}
                  <details className="text-[10px] text-muted-foreground cursor-pointer">
                    <summary className="font-semibold text-primary/80 flex items-center gap-0.5">
                      <History className="w-3.5 h-3.5" />
                      <span>View workflow audit timeline</span>
                    </summary>
                    <div className="space-y-1 pl-4 mt-2 border-l border-border">
                      {ticket.logs.map((log, i) => (
                        <div key={i} className="py-0.5">
                          <span className="font-bold">{log.date}</span> &bull; {log.action} <span className="opacity-75">(by: {log.user})</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Maintenance;
