import { apiClient } from "./config";

/**
 * Production-grade Call Tracking Service
 * Communicates with backend for call verification
 */

// Check if lead has recent initiated call
export const checkInitiatedCall = async (leadId) => {
  try {
    const response = await apiClient.get(`/call-tracking/check-initiated/${leadId}`);
    return response.data?.data;
  } catch (error) {
    console.error("❌ Error checking initiated call:", error);
    throw error;
  }
};

// Initiate call tracking on backend
export const initiateCallTracking = async (leadId, deviceInfo = {}) => {
  try {
    const response = await apiClient.post("/call-tracking/initiate", {
      leadId,
      deviceInfo: {
        platform: "mobile-app",
        appVersion: "1.0.0",
        ...deviceInfo,
      },
    });

    return response.data?.data;
  } catch (error) {
    console.error("❌ Error initiating call tracking:", error);
    throw error;
  }
};

// Verify call duration before allowing save
export const verifyCallTracking = async (sessionId, minimumDuration = 10) => {
  try {
    const response = await apiClient.post("/call-tracking/verify", {
      sessionId,
      minimumDuration,
    });

    return {
      verified: response.data?.data?.verified,
      callDuration: response.data?.data?.callDuration,
      remainingSeconds: response.data?.data?.remainingSeconds,
      reason: response.data?.data?.reason,
      code: response.data?.data?.code,
    };
  } catch (error) {
    console.error("❌ Error verifying call:", error);
    throw error;
  }
};

// Get call history for a lead (admin)
export const getCallHistory = async (leadId, limit = 10) => {
  try {
    const response = await apiClient.get(
      `/call-tracking/history/${leadId}?limit=${limit}`
    );
    return response.data?.data;
  } catch (error) {
    console.error("❌ Error fetching call history:", error);
    throw error;
  }
};

// Get call statistics (admin)
export const getCallStatistics = async (userId = null) => {
  try {
    const params = userId ? `?userId=${userId}` : "";
    const response = await apiClient.get(`/call-tracking/statistics${params}`);
    return response.data?.data;
  } catch (error) {
    console.error("❌ Error fetching statistics:", error);
    throw error;
  }
};

export default {
  checkInitiatedCall,
  initiateCallTracking,
  verifyCallTracking,
  getCallHistory,
  getCallStatistics,
};
