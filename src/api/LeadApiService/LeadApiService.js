import { createAxiosInstance } from '../config';

const authAPI = createAxiosInstance();

/* =========================

   LEADS

========================= */

export const createLead = payload => authAPI.post('leads/', payload);

export const getAllLeads = filters =>
  authAPI.get('leads/', {
    params: {
      search: filters?.search || '',
      fromDate: filters?.fromDate || '',
      toDate: filters?.toDate || '',
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      isPagination: filters?.isPagination ?? true,

      // backend expects platformId
      platformId: filters?.platform || '',

      assigned: filters?.assigned || 'all',
      status: filters?.status || '',
      assignTo: filters?.assignTo || '',
      currentStatus: filters?.currentStatus || '',
      dashboardStatus: filters?.dashboardStatus || 'All',
      sortBy: filters?.sortBy || '',
    },
  });

export const getLeadById = id => authAPI.get(`leads/${id}`);

export const updateLead = (id, payload) =>
  authAPI.patch(`leads/${id}`, payload);

export const deleteLead = id => authAPI.delete(`leads/${id}`);

/* =========================

   LEAD ACTIONS

========================= */

export const AssignLead = payload => authAPI.post('leads/assignLeads', payload);

export const UpdateLeadStatus = (leadId, payload) =>
  authAPI.patch(`leads/updateStatus/${leadId}`, payload);

export const TransferLead = (leadId, payload) =>
  authAPI.post(`leads/transfer/${leadId}`, payload);

/* =========================

   STATS

========================= */

export const getLeadCountByStatus = () =>
  authAPI.get('leads/getLeadCountByStatus');

export const getDashboardStats = () => authAPI.get('leads/dashboard-stats');

/* =========================

   EXCEL

========================= */

export const triggerExcelSync = () => authAPI.post('excel/sync');

export const getExcelSyncStatus = () => authAPI.get('excel/status');

export const forceExcelSync = () => authAPI.post('excel/force-sync');

export const bulkAddLeadsFromExcel = leads =>
  authAPI.post('leads/bulkAddLeads', {
    leads,
  });

/* =========================

   LEAD ACTION MASTER

========================= */

export const getLeadActions = () =>
  authAPI.get('leadAction?isPagination=false');

export const getLeadStatuses = (actionResultId) =>
  authAPI.get(`leadStatus?leadActionResult=${actionResultId}&pagination=false`);

export const getLeadRates = statusId =>
  authAPI.get(`leadRate?actionStatus=${statusId}&isPagination=false`);

export const saveLeadAction = (leadId, payload) =>
  authAPI.patch(`leads/updateStatus/${leadId}`, payload);

export const getLeadHistory = leadId => authAPI.get(`leadsLog/lead/${leadId}`);

/* =========================

   NEWLY ADDED / CORRECTED FUNCTIONS

========================= */

export const getLeadActionResults = (actionId) =>
  authAPI.get(`leadActionResult?leadAction=${actionId}&pagination=false`);

export const getAllLeadStatuses = () =>
  authAPI.get('leadStatus?isPagination=false');
export const getPlatforms = () => authAPI.get('platform');
export const getStatuses = () => authAPI.get('leadStatus?isPagination=false');
/* =========================

   DEFAULT EXPORT

========================= */

export default {
  createLead,

  getAllLeads,

  getLeadById,

  updateLead,

  deleteLead,

  AssignLead,

  UpdateLeadStatus,

  TransferLead,

  getLeadCountByStatus,

  getDashboardStats,

  triggerExcelSync,

  getExcelSyncStatus,

  forceExcelSync,

  bulkAddLeadsFromExcel,

  getLeadActions,

  getLeadStatuses,

  getLeadRates,

  saveLeadAction,

  getLeadHistory,

  getLeadActionResults,

  getAllLeadStatuses,
  getPlatforms,
  getStatuses,
};
