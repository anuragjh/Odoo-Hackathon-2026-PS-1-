export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  signup: '/auth/signup',
  registerOrganization: '/auth/register-organization',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
  verifyEmail: '/auth/verify-email',
  resendVerification: '/auth/resend-verification',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
};

export const ADMIN_USER_ENDPOINTS = {
  users: '/admin/users',
  pending: '/admin/users/pending',
  approve: (id) => `/admin/users/${id}/approve`,
  reject: (id) => `/admin/users/${id}/reject`,
  role: (id) => `/admin/users/${id}/role`,
  unlock: (id) => `/admin/users/${id}/unlock`,
};

const ORG_SETUP_BASE = '/api/v1/admin';

export const ORGANIZATION_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/organizations`,
  dashboard: `${ORG_SETUP_BASE}/dashboard`,
  byId: (id) => `${ORG_SETUP_BASE}/organizations/${id}`,
};

export const DEPARTMENT_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/departments`,
  byId: (id) => `${ORG_SETUP_BASE}/departments/${id}`,
  head: (id) => `${ORG_SETUP_BASE}/departments/${id}/head`,
};

export const EMPLOYEE_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/employees`,
  statistics: `${ORG_SETUP_BASE}/employees/statistics`,
  byId: (id) => `${ORG_SETUP_BASE}/employees/${id}`,
  role: (id) => `${ORG_SETUP_BASE}/employees/${id}/role`,
  department: (id) => `${ORG_SETUP_BASE}/employees/${id}/department`,
};

export const CATEGORY_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/categories`,
  byId: (id) => `${ORG_SETUP_BASE}/categories/${id}`,
};

export const ASSET_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/assets`,
  dashboard: `${ORG_SETUP_BASE}/assets/dashboard`,
  statistics: `${ORG_SETUP_BASE}/assets/statistics`,
  byId: (id) => `${ORG_SETUP_BASE}/assets/${id}`,
  status: (id) => `${ORG_SETUP_BASE}/assets/${id}/status`,
  documents: (id) => `${ORG_SETUP_BASE}/assets/${id}/documents`,
  history: (id) => `${ORG_SETUP_BASE}/assets/${id}/history`,
};

export const ALLOCATION_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/allocations`,
  dashboard: `${ORG_SETUP_BASE}/allocations/dashboard`,
  byId: (id) => `${ORG_SETUP_BASE}/allocations/${id}`,
  return: (id) => `${ORG_SETUP_BASE}/allocations/${id}/return`,
};

export const TRANSFER_ENDPOINTS = {
  base: `${ORG_SETUP_BASE}/transfers`,
  approve: (id) => `${ORG_SETUP_BASE}/transfers/${id}/approve`,
  reject: (id) => `${ORG_SETUP_BASE}/transfers/${id}/reject`,
};
