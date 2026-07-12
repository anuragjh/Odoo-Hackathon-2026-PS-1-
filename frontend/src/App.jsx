import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ROUTES } from './config/routes';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import LandingPage from './landing-page/LandingPage';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import AuthGateway from './auth/AuthGateway';
import OrgSignUp from './auth/OrgSignUp';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import VerifyEmail from './auth/VerifyEmail';
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
import Notifications from './dashboard/pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.LANDING} element={<LandingPage />} />

            <Route element={<PublicRoute />}>
              <Route path={ROUTES.GET_STARTED} element={<AuthGateway />} />
              <Route path={ROUTES.SIGN_IN} element={<SignIn />} />
              <Route path={ROUTES.SIGN_UP} element={<SignUp />} />
              <Route path={ROUTES.ORG_REGISTER} element={<OrgSignUp />} />
            </Route>

            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />

            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardLayout />}>
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
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
