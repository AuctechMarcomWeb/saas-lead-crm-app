import { createHeaders, createAxiosInstance } from '../config';

// ✅ Create instance with baseURL = http://192.168.1.7:9001/api
// Don't pass any routeBase - we'll use full route path in each call
const authAPI = createAxiosInstance();

export const signin = async data => {
  console.log(data);
  try {
    const response = await authAPI.post(`auth/loginWithPassword`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const otpSend = async payload => {
  console.log(payload);
  try {
    const response = await authAPI.post(`auth/otp/send`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyCode = async payload => {
  console.log('verify otp', payload);
  try {
    const response = await authAPI.post(`auth/otp/verify`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUseDetails = async Id => {
  try {
    const response = await authAPI.get(`auth/profile/`);
return response

  } catch (error) {
    throw error;
  }
};

export const updateUser = async (Id,payload) => {
  console.log(payload,Id);
  try {
    const response = await authAPI.patch(`auth/update/${Id}`,{...payload} );
    console.log(response)
    return response;
  } catch (error) {
    console.log(error)
    throw error;

  }
};


export const getAllEmployees = async (filters = {}) => {
  try {
    // Pass filters as query params to the API
    const response = await authAPI.get(`auth/getAllUsers`, { 
      params: filters  // This sends filters to backend
    });
    console.log("get user all employee", response);
    return response;
  } catch (error) {
    throw error;
  }
};
//create user admin
export const CreateUser = async payload => {
  console.log(payload);
  try {
    const response = await authAPI.post(`auth/createUser`, payload);
    console.log(response)
    return response;
  } catch (error) {

    throw error;
  }
};