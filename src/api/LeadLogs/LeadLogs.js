import { createHeaders, createAxiosInstance } from '../config';

const leadLogs = createAxiosInstance();

// -----------------------------
// GET All Lead Masters
// -----------------------------
export const getLeadLogs = async (filters = {}) => {
  try {
    const response = await leadLogs.get(`/leadsLog` ,{ 
      params: filters  // This sends filters to backend
    });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
