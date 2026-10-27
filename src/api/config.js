// import { LOCAL_URL } from '@env';

import { BASE_URL } from '@env';

import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';

// export const fullBaseURL = `${LOCAL_URL}/api`;

// For LOCAL development (change to your machine IP):
// export const fullBaseURL = `http://192.168.1.7:9001/api/`;

// For PRODUCTION (Custom domain):
export const fullBaseURL = `http://192.168.1.5:9001/api`;

console.log('fullBaseURL', fullBaseURL);

/**


 * @param {string} routeBase - subpath (e.g. "auth" or "driver")

 * @param {object} extraHeaders - additional headers (optional)

 */

export const createAxiosInstance = (routeBase = '', extraHeaders = {}) => {
  // Always ensure proper slash handling
  const baseURL = routeBase 
    ? `${fullBaseURL}/${routeBase}` 
    : fullBaseURL;

  console.log('Creating axios instance with baseURL:', baseURL, 'routeBase:', routeBase);

  const instance = axios.create({
    baseURL: baseURL,

    headers: {
      'Content-Type': extraHeaders['Content-Type'] || 'application/json',

      ...extraHeaders,
    },
  });

  /**

   *  Request Interceptor: automatically attach JWT token and tenant ID from AsyncStorage

   */

  instance.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('authToken');
      const tenantDomain = await AsyncStorage.getItem('tenantDomain');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (tenantDomain) {
        config.headers['x-tenant-id'] = tenantDomain;
      }

      console.log('Request URL:', `${baseURL}${config.url}`);
      console.log('x-tenant-id:', tenantDomain || 'Not set');

      return config;
    },

    error => Promise.reject(error),
  );

  return instance;
};

/**

 * Helper for extra headers (useful for file uploads or custom content-type)

 */

export const createHeaders = (extraHeaders = {}) => ({
  'Content-Type': 'application/json',

  ...extraHeaders,
});

/**
 * Default API client for most API calls
 * Base URL is /api (no subroute)
 */
export const apiClient = createAxiosInstance();
