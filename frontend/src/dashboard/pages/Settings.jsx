import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Settings as SettingsIcon, User, Bell, Users, ShieldAlert, Award } from 'lucide-react';

function Settings() {
  const { currentUser, setCurrentUser, employees, setEmployees } = useContext(AppContext);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileRole, setProfileRole] = useState(currentUser.role);

  // Toggles States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [returnReminders, setReturnReminders] = useState(true);

  // Active Tab
  const [activeSettingsTab, setActiveSettingsTab] = useState('Profile'); // Profile, Notifications, Promotion
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setCurrentUser({
      name: profileName,
      email: profileEmail,
      role: profileRole
    });

    // Also update this member in the employee directory
    setEmployees(employees.map(emp => {
      if (emp.id === 1) { // Assuming current user is ID 1 (Jessin Sam)
        return { ...emp, name: profileName, email: profileEmail, role: profileRole };
      }
      return emp;
    }));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRoleChange = (employeeId, nextRole) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, role: nextRole };
      }
      return emp;
    }));
  };

  return (
    <div className="af-page space-y-6 animate-slide-in-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Console Settings</h1>
        <p className="text-xs text-muted-foreground">Manage profile credentials, alert configurations, and employee role elevations.</p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 font-semibold text-xs flex justify-between items-center animate-fade-in">
          <span>Settings saved successfully! Header and directory profiles updated.</span>
          <button onClick={() => setSaveSuccess(false)} className="hover:underline text-[10px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation Menu */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-fit">
          <nav className="flex flex-col gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveSettingsTab('Profile')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${activeSettingsTab === 'Profile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
            >
              <User className="w-4 h-4" />
              <span>User Profile Info</span>
            </button>

            <button
              onClick={() => setActiveSettingsTab('Notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${activeSettingsTab === 'Notifications' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Bell className="w-4 h-4" style={{ flexShrink: 0 }} />
              <span>Notification Alerts</span>
            </button>

            <button
              onClick={() => setActiveSettingsTab('Promotion')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${activeSettingsTab === 'Promotion' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Users className="w-4 h-4" style={{ flexShrink: 0 }} />
              <span>Elevations Directory</span>
            </button>
          </nav>
        </div>

        {/* Settings Workspace Panel */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-sm">
          {activeSettingsTab === 'Profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground">User Profile Information</h2>
              <p className="text-xs text-muted-foreground">Modify local name, email, and designated role credentials.</p>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">System Role Elevation</label>
                  <select
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs hover:bg-primary/95 transition-all shadow-md"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {activeSettingsTab === 'Notifications' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-foreground">Notification Alert Routing</h2>
              <p className="text-xs text-muted-foreground">Select how AssetFlow informs you of return dates and approvals.</p>

              <div className="space-y-4 pt-4 max-w-md">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Email Notifications</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Receive handover receipts and audit summaries by email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Push Notifications</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Real-time alerts for booking slots overlaps warnings.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border">
                  <div>
                    <span className="text-xs font-semibold text-foreground">Overdue Return Reminders</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Automatic hourly flags for items past expected return dates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={returnReminders}
                    onChange={(e) => setReturnReminders(e.target.checked)}
                    className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'Promotion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Elevations Directory (Admin Console)</h2>
                  <p className="text-xs text-muted-foreground">Assign organizational roles and elevation tiers across directory employees.</p>
                </div>
                <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-0.5 rounded-full">Secure Auth</span>
              </div>

              <div className="space-y-3 pt-3">
                {employees.map(emp => (
                  <div
                    key={emp.id}
                    className="p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-foreground">{emp.name}</span>
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{emp.department}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{emp.email}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] text-muted-foreground">Change Role:</span>
                      <select
                        value={emp.role}
                        onChange={(e) => {
                          handleRoleChange(emp.id, e.target.value);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 2000);
                        }}
                        className="px-2.5 py-1.5 border rounded-lg text-[10px] bg-background focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Asset Manager">Asset Manager</option>
                        <option value="Department Head">Department Head</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
