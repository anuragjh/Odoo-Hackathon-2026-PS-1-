export const ROUTES = {
  LANDING: '/',
  GET_STARTED: '/get-started',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  ORG_REGISTER: '/org/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  DASHBOARD: '/dashboard',
  DASHBOARD_ORGANIZATION: '/dashboard/organization',
  DASHBOARD_ASSETS: '/dashboard/assets',
  DASHBOARD_ALLOCATIONS: '/dashboard/allocations',
  DASHBOARD_BOOKINGS: '/dashboard/bookings',
  DASHBOARD_MAINTENANCE: '/dashboard/maintenance',
  DASHBOARD_AUDITS: '/dashboard/audits',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_TASKS: '/dashboard/tasks',
  DASHBOARD_CALENDAR: '/dashboard/calendar',
  DASHBOARD_TEAM: '/dashboard/team',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_HELP: '/dashboard/help',
  DASHBOARD_LOGOUT: '/dashboard/logout',
  DASHBOARD_NOTIFICATIONS: '/dashboard/notifications',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  ASSET_MANAGER: 'ASSET_MANAGER',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee',
};

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.DASHBOARD;
export const DEFAULT_GUEST_ROUTE = ROUTES.SIGN_IN;
