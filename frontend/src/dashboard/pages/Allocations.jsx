import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { 
  CheckSquare, ArrowLeftRight, RotateCcw, AlertTriangle, 
  UserCheck, ShieldAlert, ArrowRight, UserPlus
} from 'lucide-react';

function Allocations() {
  const { 
    assets, employees, transfers,
    allocateAsset, createTransferRequest, approveTransfer, returnAsset 
  } = useContext(AppContext);

  // States
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [maintReason, setMaintReason] = useState('');
  
  // Conflict States
  const [conflictError, setConflictError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Return Modal State
  const [returnModal, setReturnModal] = useState(false);
  const [returningAsset, setReturningAsset] = useState(null);
  const [checkInCondition, setCheckInCondition] = useState('Good');

  // Submit allocation
  const handleAllocate = (e) => {
    e.preventDefault();
    setConflictError(null);
    setSuccessMsg(null);

    if (!selectedAssetId || !selectedEmployeeId) {
      setConflictError({ message: 'Please select both an asset and an employee.' });
      return;
    }

    const res = allocateAsset(selectedAssetId, selectedEmployeeId, returnDate);
    if (res.success) {
      setSuccessMsg('Asset allocated successfully!');
      setSelectedAssetId('');
      setSelectedEmployeeId('');
      setReturnDate('');
    } else {
      // It is a conflict error!
      if (res.currentHolder) {
        setConflictError({
          message: res.error,
          conflict: true,
          assetId: selectedAssetId,
          holder: res.currentHolder,
          holderId: res.holderId,
          targetEmployeeId: selectedEmployeeId
        });
      } else {
        setConflictError({ message: res.error });
      }
    }
  };

  // Trigger Transfer Request
  const handleRequestTransfer = () => {
    if (!conflictError) return;
    const res = createTransferRequest(conflictError.assetId, conflictError.targetEmployeeId, 'Requested via allocation conflict workflow.');
    if (res.success) {
      setSuccessMsg('Transfer request raised successfully! Pending manager review.');
      setConflictError(null);
      setSelectedAssetId('');
      setSelectedEmployeeId('');
    } else {
      setConflictError({ message: res.error });
    }
  };

  // Approve Transfer
  const handleApproveTransfer = (transferId) => {
    approveTransfer(transferId);
    setSuccessMsg('Transfer request approved and asset reallocated!');
  };

  // Open return modal
  const openReturnModal = (asset) => {
    setReturningAsset(asset);
    setCheckInCondition(asset.condition);
    setReturnModal(true);
  };

  // Submit return
  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returningAsset) return;
    returnAsset(returningAsset.id, checkInCondition);
    setReturnModal(false);
    setReturningAsset(null);
    setSuccessMsg('Asset returned successfully and marked as Available!');
  };

  // Overdue check logic
  const currentDate = new Date('2026-07-12');
  const allocatedAssets = assets.filter(a => a.status === 'Allocated');
  
  const overdueAllocations = allocatedAssets.filter(a => {
    if (!a.expectedReturn) return false;
    return new Date(a.expectedReturn) < currentDate;
  });

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Asset Allocations & Transfers</h1>
        <p className="text-xs text-muted-foreground">Manage handovers, transfer requests, and asset return conditions.</p>
      </div>

      {/* Success/Error Toast */}
      {successMsg && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:underline text-[10px]">Dismiss</button>
        </div>
      )}

      {/* Allocation Panel & Conflict Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Allocate Form */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1">
            <UserPlus className="w-4 h-4 text-primary" />
            <span>New Allocation</span>
          </h2>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Select Asset</label>
              <select 
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">-- Choose Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.id}) - {a.status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Assign to Employee</label>
              <select 
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setConflictError(null);
                }}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Expected Return Date (Optional)</label>
              <input 
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              />
            </div>

            {/* Conflict Error Block */}
            {conflictError && (
              <div className="p-3.5 rounded-xl border bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 space-y-2 text-xs">
                <div className="flex items-start gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{conflictError.message}</span>
                </div>
                {conflictError.conflict && (
                  <div className="pt-1.5 flex flex-col gap-2">
                    <p className="text-[11px] opacity-90">Would you like to initiate a direct Transfer Request from {conflictError.holder}?</p>
                    <button 
                      type="button" 
                      onClick={handleRequestTransfer}
                      className="w-full inline-flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition-colors"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Request Transfer</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
            >
              Confirm Assignment
            </button>
          </form>
        </div>

        {/* Transfers & Returns Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overdue returns banner alerts */}
          {overdueAllocations.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/20 rounded-2xl p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span>Overdue Asset Handback Required</span>
              </h2>
              <div className="space-y-2">
                {overdueAllocations.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex justify-between items-center bg-card border border-rose-100 dark:border-rose-950 p-3 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{asset.name}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Holder: {asset.holder} &bull; Expected Return: <span className="font-semibold text-rose-600">{asset.expectedReturn}</span></p>
                    </div>
                    <button 
                      onClick={() => openReturnModal(asset)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Return</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Allocations List */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-4">Active Staff Allocations</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {allocatedAssets.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No assets currently allocated.</div>
              ) : (
                allocatedAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/40 transition-all text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{asset.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({asset.id})</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Held by: <span className="font-semibold">{asset.holder}</span> {asset.expectedReturn ? ` &bull; Due: ${asset.expectedReturn}` : ''}</p>
                    </div>
                    
                    <button 
                      onClick={() => openReturnModal(asset)}
                      className="px-3 py-1.5 border hover:bg-secondary rounded-lg font-semibold text-[10px]"
                    >
                      Process Return
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Transfer Requests */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <span>Pending Transfer Requests</span>
            </h2>
            <div className="space-y-3">
              {transfers.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No pending transfer requests.</div>
              ) : (
                transfers.map(trans => (
                  <div 
                    key={trans.id} 
                    className="p-4 rounded-xl border bg-secondary/30 border-border space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{trans.assetName}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        trans.status === 'Requested' ? 'bg-amber-100 text-amber-800' :
                        trans.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {trans.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{trans.fromUser}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{trans.toUser}</span>
                    </div>

                    {trans.status === 'Requested' && (
                      <div className="pt-2 flex justify-end gap-2">
                        <button 
                          onClick={() => handleApproveTransfer(trans.id)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-[10px]"
                        >
                          Approve Transfer
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* RETURN CHECK-IN MODAL */}
      {returnModal && returningAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReturnModal(false)} />
          <div className="relative bg-card border border-border w-full max-w-sm p-6 rounded-2xl shadow-xl animate-slide-in-up">
            <h2 className="text-md font-bold text-foreground mb-4">Asset Return Check-in</h2>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="text-xs space-y-1">
                <span className="text-muted-foreground">Asset returning:</span>
                <p className="font-bold text-foreground">{returningAsset.name} ({returningAsset.id})</p>
                <p className="text-muted-foreground mt-1">Returned by: <span className="font-semibold">{returningAsset.holder}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Check-in Condition Notes</label>
                <select 
                  value={checkInCondition}
                  onChange={(e) => setCheckInCondition(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair (Needs clean/minor check)</option>
                  <option value="Damaged">Damaged (Triggers repair review)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setReturnModal(false);
                    setReturningAsset(null);
                  }}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg text-xs"
                >
                  Complete Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Allocations;
