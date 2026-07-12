import { request } from './apiClient';
import {
  DASHBOARD_ENDPOINTS,
  ORGANIZATION_ENDPOINTS,
  DEPARTMENT_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  EMPLOYEE_ENDPOINTS,
  ASSET_ENDPOINTS,
  ALLOCATION_ENDPOINTS,
  TRANSFER_ENDPOINTS,
} from '../config/api';

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, value);
    }
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};

const unwrap = (res) => res?.data;

const get = async (path) => unwrap(await request(path, { method: 'GET' }));
const post = async (path, body) => unwrap(await request(path, { method: 'POST', body }));
const put = async (path, body) => unwrap(await request(path, { method: 'PUT', body }));
const patch = async (path, body) => unwrap(await request(path, { method: 'PATCH', body }));
const del = async (path) => unwrap(await request(path, { method: 'DELETE' }));

export const dashboardService = {
  orgSetup: () => get(DASHBOARD_ENDPOINTS.orgSetup),
};

export const organizationService = {
  get: () => get(ORGANIZATION_ENDPOINTS.base),
  update: (body) => put(ORGANIZATION_ENDPOINTS.base, body),
};

export const departmentService = {
  list: (params) => get(`${DEPARTMENT_ENDPOINTS.base}${qs(params)}`),
  get: (id) => get(DEPARTMENT_ENDPOINTS.byId(id)),
  create: (body) => post(DEPARTMENT_ENDPOINTS.base, body),
  update: (id, body) => put(DEPARTMENT_ENDPOINTS.byId(id), body),
  activate: (id) => patch(DEPARTMENT_ENDPOINTS.activate(id)),
  deactivate: (id) => patch(DEPARTMENT_ENDPOINTS.deactivate(id)),
  assignHead: (id, userId) => put(DEPARTMENT_ENDPOINTS.head(id), { userId }),
  removeHead: (id) => del(DEPARTMENT_ENDPOINTS.head(id)),
};

export const categoryService = {
  list: (params) => get(`${CATEGORY_ENDPOINTS.base}${qs(params)}`),
  create: (body) => post(CATEGORY_ENDPOINTS.base, body),
  update: (id, body) => put(CATEGORY_ENDPOINTS.byId(id), body),
  activate: (id) => patch(CATEGORY_ENDPOINTS.activate(id)),
  deactivate: (id) => patch(CATEGORY_ENDPOINTS.deactivate(id)),
};

export const employeeService = {
  list: (params) => get(`${EMPLOYEE_ENDPOINTS.base}${qs(params)}`),
  statistics: () => get(EMPLOYEE_ENDPOINTS.statistics),
  get: (id) => get(EMPLOYEE_ENDPOINTS.byId(id)),
  approve: (id) => patch(EMPLOYEE_ENDPOINTS.approve(id)),
  reject: (id) => patch(EMPLOYEE_ENDPOINTS.reject(id)),
  activate: (id) => patch(EMPLOYEE_ENDPOINTS.activate(id)),
  suspend: (id) => patch(EMPLOYEE_ENDPOINTS.suspend(id)),
  unlock: (id) => patch(EMPLOYEE_ENDPOINTS.unlock(id)),
  changeRole: (id, role) => patch(EMPLOYEE_ENDPOINTS.role(id), { role }),
  assignDepartment: (id, departmentId) => put(EMPLOYEE_ENDPOINTS.department(id), { departmentId }),
  removeDepartment: (id) => del(EMPLOYEE_ENDPOINTS.department(id)),
};

export const assetService = {
  list: (params) => get(`${ASSET_ENDPOINTS.base}${qs(params)}`),
  dashboard: () => get(ASSET_ENDPOINTS.dashboard),
  statistics: () => get(ASSET_ENDPOINTS.statistics),
  get: (id) => get(ASSET_ENDPOINTS.byId(id)),
  create: (body) => post(ASSET_ENDPOINTS.base, body),
  update: (id, body) => put(ASSET_ENDPOINTS.byId(id), body),
  changeStatus: (id, body) => patch(ASSET_ENDPOINTS.status(id), body),
  history: (id) => get(ASSET_ENDPOINTS.history(id)),
  documents: (id) => get(ASSET_ENDPOINTS.documents(id)),
  addDocument: (id, body) => post(ASSET_ENDPOINTS.documents(id), body),
};

export const allocationService = {
  list: (params) => get(`${ALLOCATION_ENDPOINTS.base}${qs(params)}`),
  dashboard: () => get(ALLOCATION_ENDPOINTS.dashboard),
  get: (id) => get(ALLOCATION_ENDPOINTS.byId(id)),
  allocate: (body) => post(ALLOCATION_ENDPOINTS.base, body),
  returnAsset: (id, body) => post(ALLOCATION_ENDPOINTS.return(id), body),
};

export const transferService = {
  create: (body) => post(TRANSFER_ENDPOINTS.base, body),
  approve: (id) => post(TRANSFER_ENDPOINTS.approve(id)),
  reject: (id) => post(TRANSFER_ENDPOINTS.reject(id)),
};
