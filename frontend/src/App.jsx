import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
// import LandingPage from './landing-page/LandingPage';
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardOverview from './dashboard/pages/DashboardOverview';
import AssetsDirectory from './dashboard/pages/AssetsDirectory';
import Allocations from './dashboard/pages/Allocations';
import ResourceBookings from './dashboard/pages/ResourceBookings';
import Maintenance from './dashboard/pages/Maintenance';
import Audits from './dashboard/pages/Audits';
import Analytics from './dashboard/pages/Analytics';
import Tasks from './dashboard/pages/Tasks';
import Calendar from './dashboard/pages/Calendar';
import Team from './dashboard/pages/Team';
import OrganizationSetup from './dashboard/pages/OrganizationSetup';
import Settings from './dashboard/pages/Settings';
import Help from './dashboard/pages/Help';
import Logout from './dashboard/pages/Logout';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect Root to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard Route Group */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="organization" element={<OrganizationSetup />} />
            <Route path="assets" element={<AssetsDirectory />} />
            <Route path="allocations" element={<Allocations />} />
            <Route path="bookings" element={<ResourceBookings />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="audits" element={<Audits />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
