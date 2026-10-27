import { createHeaders, createAxiosInstance } from '../config';

const leadAPI = createAxiosInstance();

// -----------------------------
// CREATE Lead Master
// -----------------------------
export const createLeadMaster = async (payload) => {
  console.log("Create Lead Master:", payload);
  try {
    const response = await leadAPI.post(`/leadAction`, payload);
    console.log(response)
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// GET All Lead Masters
// -----------------------------
export const getLeadMasterList = async () => {
  try {
    const response = await leadAPI.get(`/leadAction`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// GET Single Lead Master by ID
// -----------------------------
export const getLeadMasterById = async (id) => {
  try {
    const response = await leadAPI.get(`/leadAction/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// UPDATE Lead Master
// -----------------------------
export const updateLeadMaster = async (id, payload) => {
  console.log("Update Lead Master:", id, payload);
  try {
    const response = await leadAPI.patch(`/leadAction/${id}`, payload);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// DELETE Lead Master
// -----------------------------
export const deleteLeadMaster = async (id) => {
  console.log("Delete Lead Master:", id);
  try {
    const response = await leadAPI.delete(`/leadAction/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
