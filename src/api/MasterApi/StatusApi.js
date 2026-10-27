import { createHeaders, createAxiosInstance } from '../config';

const StatusAPI = createAxiosInstance();


export const createLeadStatus = async (payload) => {
  console.log("Create Lead Status:", payload);
  try {
    const response = await StatusAPI.post(`/leadStatus`, payload);
    console.log(response)
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getLeadStatus = async (filters = {}) => {
  try {
    const response = await StatusAPI.get('/leadStatus', {
      params: filters,  
    });
    console.log("Status  response",response)
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};



export const getLeadStatusById = async (id) => {
  try {
    const response = await StatusAPI.get(`/leadAction/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// UPDATE Lead Master
// -----------------------------
export const updateLeadStatus = async (id, payload) => {
  console.log("Update Lead Master:", id, payload);
  try {
    const response = await StatusAPI.patch(`/leadStatus/${id}`, payload);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// DELETE Lead Master
// -----------------------------
export const deleteLeadStatus = async (id) => {
  console.log("Delete Lead Master:", id);
  try {
    const response = await StatusAPI.delete(`/leadStatus/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
