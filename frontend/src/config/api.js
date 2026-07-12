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

const V1 = '/api/v1/admin';

export const DASHBOARD_ENDPOINTS = {
  orgSetup: `${V1}/dashboard/organization-setup`,
};

export const ORGANIZATION_ENDPOINTS = {
  base: `${V1}/organization`,
};

export const DEPARTMENT_ENDPOINTS = {
  base: `${V1}/departments`,
  byId: (id) => `${V1}/departments/${id}`,
  activate: (id) => `${V1}/departments/${id}/activate`,
  deactivate: (id) => `${V1}/departments/${id}/deactivate`,
  head: (id) => `${V1}/departments/${id}/head`,
};

export const CATEGORY_ENDPOINTS = {
  base: `${V1}/asset-categories`,
  byId: (id) => `${V1}/asset-categories/${id}`,
  activate: (id) => `${V1}/asset-categories/${id}/activate`,
  deactivate: (id) => `${V1}/asset-categories/${id}/deactivate`,
};

export const EMPLOYEE_ENDPOINTS = {
  base: `${V1}/employees`,
  statistics: `${V1}/employees/statistics`,
  me: `${V1}/employees/me`,
  byId: (id) => `${V1}/employees/${id}`,
  approve: (id) => `${V1}/employees/${id}/approve`,
  reject: (id) => `${V1}/employees/${id}/reject`,
  activate: (id) => `${V1}/employees/${id}/activate`,
  suspend: (id) => `${V1}/employees/${id}/suspend`,
  unlock: (id) => `${V1}/employees/${id}/unlock`,
  role: (id) => `${V1}/employees/${id}/role`,
  department: (id) => `${V1}/employees/${id}/department`,
};

export const ASSET_ENDPOINTS = {
  base: `${V1}/assets`,
  dashboard: `${V1}/assets/dashboard`,
  statistics: `${V1}/assets/statistics`,
  byId: (id) => `${V1}/assets/${id}`,
  status: (id) => `${V1}/assets/${id}/status`,
  documents: (id) => `${V1}/assets/${id}/documents`,
  history: (id) => `${V1}/assets/${id}/history`,
};

export const ALLOCATION_ENDPOINTS = {
  base: `${V1}/allocations`,
  dashboard: `${V1}/allocations/dashboard`,
  byId: (id) => `${V1}/allocations/${id}`,
  return: (id) => `${V1}/allocations/${id}/return`,
};

export const TRANSFER_ENDPOINTS = {
  base: `${V1}/transfers`,
  approve: (id) => `${V1}/transfers/${id}/approve`,
  reject: (id) => `${V1}/transfers/${id}/reject`,
};
