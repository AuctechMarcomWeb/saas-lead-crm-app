import { createHeaders, createAxiosInstance } from '../config';

const leadAPI = createAxiosInstance();


export const createLeadPlatform = async (payload) => {
  console.log("Create Lead Platform:", payload);
  try {
    const response = await leadAPI.post(`/platform`, payload);
    console.log(response)
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getLeadPlatform = async () => {
  try {
    const response = await leadAPI.get(`/platform`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const getLeadPlatformById = async (id) => {
  try {
    const response = await leadAPI.get(`/platform/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// UPDATE Lead Master
// -----------------------------
export const updateLeadPlatform = async (id, payload) => {
  console.log("Update Lead Master:", id, payload);
  try {
    const response = await leadAPI.patch(`/platform/${id}`, payload);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// -----------------------------
// DELETE Lead Master
// -----------------------------
export const deleteLeadPlatform = async (id) => {
  console.log("Delete Lead Master:", id);
  try {
    const response = await leadAPI.delete(`/platform/${id}`);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
