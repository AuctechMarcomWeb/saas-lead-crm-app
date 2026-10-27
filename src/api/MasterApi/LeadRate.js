import { createHeaders, createAxiosInstance } from '../config';

const leadAPI = createAxiosInstance();

// -----------------------------
// CREATE Lead Rate
// -----------------------------
export const createLeadRate = async (payload) => {
  console.log("Create Lead Rate:", payload);
  try {
    const response = await leadAPI.post(`/leadRate/`, payload);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// GET All Lead Rates
// -----------------------------
export const getLeadRateList = async (params = {}) => {
  console.log(params)
  try {
    const response = await leadAPI.get(`/leadRate/`, { params });
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// -----------------------------
// GET Single Lead Rate by ID
// -----------------------------
export const getLeadRateById = async (id) => {
  try {
    const response = await leadAPI.get(`/leadRate/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// UPDATE Lead Rate
// -----------------------------
export const updateLeadRate = async (id, payload) => {
  console.log("Update Lead Rate:", id, payload);
  try {
    const response = await leadAPI.patch(`/leadRate/${id}`, payload);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// DELETE Lead Rate
// -----------------------------
export const deleteLeadRate = async (id) => {
  console.log("Delete Lead Rate:", id);
  try {
    const response = await leadAPI.delete(`/leadRate/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
