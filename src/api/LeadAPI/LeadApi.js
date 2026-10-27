import { createHeaders, createAxiosInstance } from '../config';

const authAPI = createAxiosInstance();

/* -------------------- CREATE Lead -------------------- */
export const createLead = async (payload) => {
  try {
    const response = await authAPI.post(`leads/`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- GET All Leads -------------------- */
export const getAllLeads = async (filters = {}) => {

  console.log("filters",filters)
  try {
    const response = await authAPI.get(`leads/`, {
      params: {
        search: filters.search || "",
        fromDate: filters.fromDate || "",
        toDate: filters.toDate || "",
        page: filters.page ,
        limit: filters.limit ,
        isPagination: filters.isPagination ?? true,
        platform: filters.platform || "",
        assigned:filters.assigned
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- GET Lead by ID -------------------- */
export const getLeadById = async (id) => {
  try {
    const response = await authAPI.get(`leads/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- UPDATE Lead -------------------- */
export const updateLead = async (id, payload) => {
  try {
    const response = await authAPI.put(`leads/${id}`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- DELETE Lead -------------------- */
export const deleteLead = async (id) => {
  try {
    const response = await authAPI.delete(`leads/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};   



/* -------------------- AssignLead-------------------- */
export const AssignLead = async (payload) => {
  try {
    console.log("AssignLead=",payload)
    const response = await authAPI.post(`leads/assignLeads`, payload);
    console.log("assign",response)
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- AssignLead-------------------- */
export const UpdateLeadStatus = async (payload) => {
  try {
    console.log("UpdateLeadStatus=",payload)
    const response = await authAPI.patch(`leads/updateStatus/${LeadId}`, payload);
    console.log("assign",response)
    return response;
  } catch (error) {
    throw error;
  }
};

/* -------------------- Transfer Lead API -------------------- */
export const TransferLead = async (leadId, payload) => {
  try {
    console.log("TransferLead - Lead ID:", leadId, "Payload:", payload);
    
    // Make sure leadId is passed correctly in the URL
    const response = await authAPI.post(`leads/transfer/${leadId}`, payload);
    
    console.log("Transfer lead response:", response);
    return response;
  } catch (error) {
    console.error("Transfer lead error:", error);
    throw error;
  }
};