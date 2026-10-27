import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import RootNavigation from './src/routes/RootNavigation';
import store from './src/redux/store';
import { initializeNotifications } from './src/services/notificationService';

/**
 * Send FCM token to backend
 */
const syncFCMTokenToBackend = async (token) => {
  try {
    if (!token) {
      console.warn('⚠️ Empty FCM token, cannot sync to backend');
      return false;
    }

    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      console.warn('⚠️ No auth token found, user not logged in');
      return false;
    }

    const response = await axios.patch(
      'http://192.168.1.5:9001/api/auth/updateFCMToken',
      { fcmToken: token },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ FCM token synced to backend:', token?.slice(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Failed to sync FCM token:', error?.response?.data?.message || error.message);
    return false;
  }
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    let cleanup = () => {};

    initializeNotifications(async (token) => {
      console.log('📲 FCM token obtained:', token?.slice(0, 20) + '...');
      
      // ✅ Send token to backend on app startup
      await syncFCMTokenToBackend(token);
    }).then(fn => {
      cleanup = fn;
    });

    return () => cleanup();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigation />
        <Toast />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
