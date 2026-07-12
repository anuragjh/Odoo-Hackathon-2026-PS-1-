import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state — 'dark' | 'light'
  const [theme, setTheme] = useState('dark');
  
  // Current user state
  const [currentUser, setCurrentUser] = useState({
    name: 'Jessin Sam',
    email: 'jessin@gmail.com',
    role: 'Employee' // Roles: Admin, Asset Manager, Department Head, Employee
  });

  // Employee Directory
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Jessin Sam', email: 'jessin@gmail.com', role: 'Employee', department: 'Product Development', status: 'Active' },
    { id: 2, name: 'Alexandra Deff', email: 'alexandra@assetflow.com', role: 'Asset Manager', department: 'Operations', status: 'Active' },
    { id: 3, name: 'Edwin Adenike', email: 'edwin@assetflow.com', role: 'Department Head', department: 'Engineering', status: 'Active' },
    { id: 4, name: 'David Oshodi', email: 'david@assetflow.com', role: 'Employee', department: 'Quality Assurance', status: 'Active' },
    { id: 5, name: 'Isaac Oluwatemilorun', email: 'isaac@assetflow.com', role: 'Employee', department: 'IT Support', status: 'Active' },
  ]);

  // Departments
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', head: 'Edwin Adenike', status: 'Active', parent: 'None' },
    { id: 2, name: 'Operations', head: 'Alexandra Deff', status: 'Active', parent: 'None' },
    { id: 3, name: 'Product Development', head: 'Jessin Sam', status: 'Active', parent: 'Engineering' },
    { id: 4, name: 'Quality Assurance', head: 'David Oshodi', status: 'Active', parent: 'Engineering' }
  ]);

  // Asset Categories
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', customFields: 'Warranty Period, Power Rating' },
    { id: 2, name: 'Furniture', customFields: 'Material, Dimensions' },
    { id: 3, name: 'Vehicles', customFields: 'License Plate, Fuel Type' }
  ]);

  // Assets Master Data
  const [assets, setAssets] = useState([
    { 
      id: 'AF-0001', 
      name: 'MacBook Pro 16"', 
      category: 'Electronics', 
      serial: 'C02DF5X8MD6M', 
      acqDate: '2025-01-15', 
      acqCost: 2499, 
      condition: 'Excellent', 
      location: 'Main HQ - Floor 3', 
      isShared: false, 
      status: 'Allocated', // Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
      holder: 'Edwin Adenike',
      holderId: 3,
      expectedReturn: '2026-08-01',
      history: [
        { date: '2025-01-15', action: 'Asset Registered', user: 'Alexandra Deff' },
        { date: '2025-01-16', action: 'Allocated to Edwin Adenike', user: 'Alexandra Deff' }
      ]
    },
    { 
      id: 'AF-0002', 
      name: 'Dell PowerEdge R750', 
      category: 'Electronics', 
      serial: 'DELL-98XF3G2', 
      acqDate: '2024-05-10', 
      acqCost: 5800, 
      condition: 'Fair', 
      location: 'HQ Server Room A', 
      isShared: false, 
      status: 'Under Maintenance',
      holder: 'None',
      holderId: null,
      history: [
        { date: '2024-05-10', action: 'Asset Registered', user: 'Alexandra Deff' },
        { date: '2026-07-10', action: 'Reported issue: Overheating', user: 'Jessin Sam' },
        { date: '2026-07-11', action: 'Moved to Under Maintenance', user: 'Alexandra Deff' }
      ]
    },
    { 
      id: 'AF-0003', 
      name: 'Conference Room B2 TV', 
      category: 'Electronics', 
      serial: 'SONY-85X90K', 
      acqDate: '2025-03-20', 
      acqCost: 1500, 
      condition: 'Good', 
      location: 'Conference Room B2', 
      isShared: true, 
      status: 'Available',
      holder: 'None',
      holderId: null,
      history: [
        { date: '2025-03-20', action: 'Asset Registered as Shared Resource', user: 'Alexandra Deff' }
      ]
    },
    { 
      id: 'AF-0004', 
      name: 'Ergonomic Desk Chair', 
      category: 'Furniture', 
      serial: 'HM-AERON-882', 
      acqDate: '2025-02-18', 
      acqCost: 1200, 
      condition: 'Good', 
      location: 'Main HQ - Floor 2', 
      isShared: false, 
      status: 'Allocated',
      holder: 'Jessin Sam',
      holderId: 1,
      expectedReturn: '2026-07-10', // Past return date! Overdue returns check
      history: [
        { date: '2025-02-18', action: 'Asset Registered', user: 'Alexandra Deff' },
        { date: '2025-02-19', action: 'Allocated to Jessin Sam', user: 'Alexandra Deff' }
      ]
    },
    { 
      id: 'AF-0005', 
      name: 'Transit Van Ford', 
      category: 'Vehicles', 
      serial: 'FORD-3928X8', 
      acqDate: '2024-11-01', 
      acqCost: 35000, 
      condition: 'Good', 
      location: 'HQ Parking Lot B', 
      isShared: true, 
      status: 'Reserved',
      holder: 'None',
      holderId: null,
      history: [
        { date: '2024-11-01', action: 'Asset Registered as Shared Resource', user: 'Alexandra Deff' }
      ]
    },
    { 
      id: 'AF-0006', 
      name: 'Epson Projector 4K', 
      category: 'Electronics', 
      serial: 'EPSON-4200X', 
      acqDate: '2025-06-05', 
      acqCost: 950, 
      condition: 'Good', 
      location: 'Tech Hub Floor 1', 
      isShared: true, 
      status: 'Available',
      holder: 'None',
      holderId: null,
      history: [
        { date: '2025-06-05', action: 'Asset Registered', user: 'Alexandra Deff' }
      ]
    }
  ]);

  // Bookings state
  const [bookings, setBookings] = useState([
    {
      id: 'B-1001',
      assetId: 'AF-0003',
      assetName: 'Conference Room B2 TV',
      user: 'Edwin Adenike',
      date: '2026-07-12',
      startTime: '09:00',
      endTime: '10:00',
      status: 'Completed' // Upcoming, Ongoing, Completed, Cancelled
    },
    {
      id: 'B-1002',
      assetId: 'AF-0005',
      assetName: 'Transit Van Ford',
      user: 'Jessin Sam',
      date: '2026-07-12',
      startTime: '14:00',
      endTime: '16:00',
      status: 'Ongoing'
    },
    {
      id: 'B-1003',
      assetId: 'AF-0003',
      assetName: 'Conference Room B2 TV',
      user: 'David Oshodi',
      date: '2026-07-13',
      startTime: '10:00',
      endTime: '11:30',
      status: 'Upcoming'
    }
  ]);

  // Maintenance state
  const [maintenance, setMaintenance] = useState([
    {
      id: 'M-5001',
      assetId: 'AF-0002',
      assetName: 'Dell PowerEdge R750',
      issue: 'Overheating under normal workload. Fan 3 failure suspected.',
      priority: 'High', // Low, Medium, High
      status: 'Technician Assigned', // Pending, Approved, Technician Assigned, In Progress, Resolved
      technician: 'Isaac Oluwatemilorun',
      requestedBy: 'Jessin Sam',
      date: '2026-07-10',
      logs: [
        { date: '2026-07-10', action: 'Ticket Raised', user: 'Jessin Sam' },
        { date: '2026-07-11', action: 'Approved by Alexandra Deff', user: 'Alexandra Deff' },
        { date: '2026-07-11', action: 'Technician Isaac Assigned', user: 'Alexandra Deff' }
      ]
    }
  ]);

  // Transfer Requests state
  const [transfers, setTransfers] = useState([
    {
      id: 'TR-2001',
      assetId: 'AF-0004',
      assetName: 'Ergonomic Desk Chair',
      fromUser: 'Jessin Sam',
      toUser: 'Edwin Adenike',
      status: 'Requested', // Requested, Approved, Rejected
      reason: 'Edwin needs an ergonomic chair for back issues. Jessin has two office chairs.',
      date: '2026-07-11'
    }
  ]);

  // Audit Cycles state
  const [audits, setAudits] = useState([
    {
      id: 'AUD-3001',
      name: 'Electronics Audit - Q3',
      scope: 'IT & Server Assets',
      startDate: '2026-07-10',
      endDate: '2026-07-20',
      auditor: 'David Oshodi',
      status: 'In Progress', // In Progress, Closed
      results: {
        'AF-0001': 'Verified',
        'AF-0002': 'Damaged',
        'AF-0003': 'Verified'
      },
      discrepancyCount: 1,
      history: 'Initiated Q3 Audit cycle.'
    }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Asset Overdue Return Alert', message: 'Ergonomic Desk Chair (AF-0004) held by Jessin Sam is past return date (2026-07-10).', time: '1 hour ago', read: false },
    { id: 2, title: 'Transfer Request Received', message: 'Edwin Adenike requested transfer of Ergonomic Desk Chair (AF-0004).', time: '2 hours ago', read: false },
    { id: 3, title: 'Maintenance Ticket Assigned', message: 'Dell PowerEdge R750 (AF-0002) has been assigned to Isaac.', time: '1 day ago', read: true }
  ]);

  // Track Theme changes via data-theme attribute (drives CSS variable system)
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    // Also keep Tailwind dark class in sync for any legacy Tailwind dark: variants
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Core functions
  
  // Register Asset
  const registerAsset = (assetData) => {
    const idNum = assets.length + 1;
    const paddedId = String(idNum).padStart(4, '0');
    const newAsset = {
      id: `AF-${paddedId}`,
      status: 'Available',
      holder: 'None',
      holderId: null,
      history: [{ date: new Date().toISOString().split('T')[0], action: 'Asset Registered', user: currentUser.name }],
      ...assetData
    };
    setAssets([...assets, newAsset]);
    addNotification('New Asset Registered', `${newAsset.name} has been registered as ${newAsset.id}.`, 'Just now');
    return newAsset.id;
  };

  // Allocate Asset
  const allocateAsset = (assetId, employeeId, expectedReturnDate) => {
    const asset = assets.find(a => a.id === assetId);
    const employee = employees.find(e => e.id === Number(employeeId));

    if (!asset || !employee) return { success: false, error: 'Asset or Employee not found.' };

    // Conflict Check: Already allocated?
    if (asset.status === 'Allocated') {
      return { 
        success: false, 
        error: `Conflict: This asset is currently allocated to ${asset.holder}.`,
        currentHolder: asset.holder,
        holderId: asset.holderId
      };
    }

    if (asset.status === 'Under Maintenance') {
      return { success: false, error: 'Conflict: This asset is under repair.' };
    }

    const updatedAssets = assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Allocated',
          holder: employee.name,
          holderId: employee.id,
          expectedReturn: expectedReturnDate || null,
          history: [...a.history, { 
            date: new Date().toISOString().split('T')[0], 
            action: `Allocated to ${employee.name} (Return: ${expectedReturnDate || 'Indefinite'})`, 
            user: currentUser.name 
          }]
        };
      }
      return a;
    });

    setAssets(updatedAssets);
    addNotification('Asset Allocated', `${asset.name} allocated to ${employee.name}.`, 'Just now');
    return { success: true };
  };

  // Transfer Asset Request
  const createTransferRequest = (assetId, targetUserId, reason) => {
    const asset = assets.find(a => a.id === assetId);
    const targetUser = employees.find(e => e.id === Number(targetUserId));
    if (!asset || !targetUser) return { success: false, error: 'Asset or User not found.' };

    const newTransfer = {
      id: `TR-${transfers.length + 2001}`,
      assetId: asset.id,
      assetName: asset.name,
      fromUser: asset.holder,
      toUser: targetUser.name,
      status: 'Requested',
      reason: reason,
      date: new Date().toISOString().split('T')[0]
    };

    setTransfers([newTransfer, ...transfers]);
    addNotification('Transfer Requested', `${newTransfer.toUser} requested transfer of ${asset.name} from ${newTransfer.fromUser}.`, 'Just now');
    return { success: true };
  };

  // Approve Transfer
  const approveTransfer = (transferId) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return { success: false, error: 'Transfer request not found.' };

    const targetUser = employees.find(e => e.name === transfer.toUser);
    if (!targetUser) return { success: false, error: 'Target employee not found.' };

    // Update Asset status
    setAssets(assets.map(a => {
      if (a.id === transfer.assetId) {
        return {
          ...a,
          holder: transfer.toUser,
          holderId: targetUser.id,
          history: [...a.history, {
            date: new Date().toISOString().split('T')[0],
            action: `Transferred from ${transfer.fromUser} to ${transfer.toUser}`,
            user: currentUser.name
          }]
        };
      }
      return a;
    }));

    // Update Transfer Status
    setTransfers(transfers.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'Approved' };
      }
      return t;
    }));

    addNotification('Transfer Approved', `${transfer.assetName} re-allocated to ${transfer.toUser}.`, 'Just now');
    return { success: true };
  };

  // Return Asset
  const returnAsset = (assetId, conditionNotes) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, error: 'Asset not found.' };

    setAssets(assets.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Available',
          holder: 'None',
          holderId: null,
          expectedReturn: null,
          condition: conditionNotes ? conditionNotes : a.condition,
          history: [...a.history, {
            date: new Date().toISOString().split('T')[0],
            action: `Returned. Condition: ${conditionNotes || 'No change'}. Status: Available.`,
            user: currentUser.name
          }]
        };
      }
      return a;
    }));

    addNotification('Asset Returned', `${asset.name} returned and marked Available.`, 'Just now');
    return { success: true };
  };

  // Book Shared Resource
  const createBooking = (bookingData) => {
    const asset = assets.find(a => a.id === bookingData.assetId);
    if (!asset) return { success: false, error: 'Resource asset not found.' };

    // Overlap validation: check if booking overlaps with existing upcoming/ongoing bookings
    const overlapping = bookings.find(b => {
      if (b.assetId !== bookingData.assetId) return false;
      if (b.date !== bookingData.date) return false;
      if (b.status === 'Cancelled') return false;

      // Time conversion to minutes to verify overlap
      const toMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const start1 = toMinutes(b.startTime);
      const end1 = toMinutes(b.endTime);
      const start2 = toMinutes(bookingData.startTime);
      const end2 = toMinutes(bookingData.endTime);

      return (start2 < end1 && end2 > start1);
    });

    if (overlapping) {
      return { 
        success: false, 
        error: `Overlap Warning: This resource is already booked by ${overlapping.user} on ${bookingData.date} from ${overlapping.startTime} to ${overlapping.endTime}.` 
      };
    }

    const newBooking = {
      id: `B-${bookings.length + 1004}`,
      assetName: asset.name,
      user: currentUser.name,
      status: 'Upcoming',
      ...bookingData
    };

    setBookings([newBooking, ...bookings]);

    // Set asset to Reserved
    setAssets(assets.map(a => {
      if (a.id === asset.id) {
        return { ...a, status: 'Reserved' };
      }
      return a;
    }));

    addNotification('Resource Booked', `Booked ${asset.name} for ${bookingData.date} at ${bookingData.startTime}.`, 'Just now');
    return { success: true };
  };

  // Raise Maintenance Request
  const raiseMaintenance = (maintenanceData) => {
    const asset = assets.find(a => a.id === maintenanceData.assetId);
    if (!asset) return { success: false, error: 'Asset not found.' };

    const newReq = {
      id: `M-${maintenance.length + 5002}`,
      assetName: asset.name,
      status: 'Pending', // Pending -> Approved -> Technician Assigned -> In Progress -> Resolved
      requestedBy: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      technician: 'None',
      logs: [{ date: new Date().toISOString().split('T')[0], action: 'Ticket Raised', user: currentUser.name }],
      ...maintenanceData
    };

    setMaintenance([newReq, ...maintenance]);
    addNotification('Maintenance Raised', `Maintenance ticket raised for ${asset.name}.`, 'Just now');
    return { success: true };
  };

  // Manage Maintenance Step
  const updateMaintenanceStatus = (ticketId, nextStatus, techName) => {
    const ticket = maintenance.find(m => m.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket not found.' };

    setMaintenance(maintenance.map(m => {
      if (m.id === ticketId) {
        const logs = [...m.logs, {
          date: new Date().toISOString().split('T')[0],
          action: `Status changed to: ${nextStatus}${techName ? ` (Technician: ${techName})` : ''}`,
          user: currentUser.name
        }];
        return {
          ...m,
          status: nextStatus,
          technician: techName ? techName : m.technician,
          logs: logs
        };
      }
      return m;
    }));

    // Update Asset Status
    if (nextStatus === 'Approved') {
      setAssets(assets.map(a => {
        if (a.id === ticket.assetId) {
          return { ...a, status: 'Under Maintenance' };
        }
        return a;
      }));
    } else if (nextStatus === 'Resolved') {
      setAssets(assets.map(a => {
        if (a.id === ticket.assetId) {
          return { ...a, status: 'Available', condition: 'Good' };
        }
        return a;
      }));
    }

    addNotification('Maintenance Updated', `Ticket ${ticketId} is now ${nextStatus}.`, 'Just now');
    return { success: true };
  };

  // Add Notification helper
  const addNotification = (title, message, time) => {
    const newAlert = {
      id: notifications.length + 1,
      title,
      message,
      time,
      read: false
    };
    setNotifications([newAlert, ...notifications]);
  };

  // Log Audit Checklist Item
  const logAuditItem = (auditId, assetId, auditResult) => {
    setAudits(audits.map(aud => {
      if (aud.id === auditId) {
        const results = { ...aud.results, [assetId]: auditResult };
        const discrepancyCount = Object.values(results).filter(r => r === 'Missing' || r === 'Damaged').length;
        return {
          ...aud,
          results,
          discrepancyCount
        };
      }
      return aud;
    }));
  };

  // Close Audit Cycle
  const closeAuditCycle = (auditId) => {
    const audit = audits.find(aud => aud.id === auditId);
    if (!audit) return { success: false, error: 'Audit cycle not found.' };

    // Update Assets statuses depending on verification results (e.g. Lost for missing items)
    const updatedAssets = assets.map(a => {
      const result = audit.results[a.id];
      if (result === 'Missing') {
        return {
          ...a,
          status: 'Lost',
          history: [...a.history, {
            date: new Date().toISOString().split('T')[0],
            action: 'Marked Lost during Audit Cycle Q3',
            user: currentUser.name
          }]
        };
      } else if (result === 'Damaged') {
        return {
          ...a,
          condition: 'Fair',
          history: [...a.history, {
            date: new Date().toISOString().split('T')[0],
            action: 'Flagged Damaged during Audit Cycle Q3',
            user: currentUser.name
          }]
        };
      }
      return a;
    });

    setAssets(updatedAssets);

    setAudits(audits.map(aud => {
      if (aud.id === auditId) {
        return { ...aud, status: 'Closed' };
      }
      return aud;
    }));

    addNotification('Audit Cycle Closed', `Audit cycle ${audit.name} has been closed. Discrepancies processed.`, 'Just now');
    return { success: true };
  };

  // Derived notification count
  const notificationCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      currentUser,
      setCurrentUser,
      employees,
      setEmployees,
      departments,
      setDepartments,
      categories,
      setCategories,
      assets,
      setAssets,
      bookings,
      setBookings,
      maintenance,
      setMaintenance,
      transfers,
      setTransfers,
      audits,
      setAudits,
      notifications,
      setNotifications,
      notificationCount,
      addNotification,

      // Core ERP logic functions
      registerAsset,
      allocateAsset,
      createTransferRequest,
      approveTransfer,
      returnAsset,
      createBooking,
      raiseMaintenance,
      updateMaintenanceStatus,
      logAuditItem,
      closeAuditCycle
    }}>
      {children}
    </AppContext.Provider>
  );
};
