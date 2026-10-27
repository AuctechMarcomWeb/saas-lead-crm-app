import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  onTokenRefresh,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

const TAG = '[NotifService]';
const log = (...args) => console.log(`🔥 ${TAG}`, ...args);
const warn = (...args) => console.warn(`⚠️ ${TAG}`, ...args);
const logError = (...args) => console.error(`❌ ${TAG}`, ...args);

let messagingInstance;
const getMessagingInstance = () => {
  if (!messagingInstance) {
    messagingInstance = getMessaging();
  }
  return messagingInstance;
};

const CHANNEL_ID = 'high';

// ---------- Display (Notifee) ----------
export const displayNotification = async remoteMessage => {
  try {
    const title =
      remoteMessage?.notification?.title ||
      remoteMessage?.data?.title ||
      'New Notification';
    const body =
      remoteMessage?.notification?.body ||
      remoteMessage?.data?.body ||
      'You have a new notification';

    const channelId = await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'High Priority Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
      vibrationPattern: [300, 500],
    });

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage?.data || {},
      android: {
        channelId,
        smallIcon: 'ic_launcher', // better: white notification icon (ic_notification)
        color: '#2874F0',
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    });

    log('Notification displayed');
  } catch (error) {
    logError('Display error:', error?.message || error);
  }
};

// ---------- Navigation on tap ----------
export const handleNotificationNavigation = data => {
  log('Notification tapped, data:', JSON.stringify(data || {}));
  // TODO: navigate based on data, e.g.
  // navigationRef.navigate(data.screen, { id: data.id });
};

// ---------- Permission ----------
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const status = await requestPermission(getMessagingInstance());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    logError('Permission failed:', error?.message || error);
    return false;
  }
};

// ---------- Token ----------
export const getFCMToken = async () => {
  try {
    const token = await getToken(getMessagingInstance());
    if (!token) {
      warn('Empty FCM token');
      return null;
    }
    log('FCM token:', token); // dev ke liye full token, copy karke Firebase console se test karo
    global.fcmToken = token;
    return token;
  } catch (error) {
    logError('Token error:', error?.message || error);
    return null;
  }
};

// ---------- Sync token to backend on refresh ----------
const syncTokenToBackend = async (token) => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    if (!authToken) {
      warn('No auth token, skipping backend sync');
      return;
    }

    const response = await axios.patch(
      'http://192.168.1.5:9001/api/auth/updateFCMToken',
      { fcmToken: token },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    log('✅ Token synced to backend on refresh:', token?.slice(0, 20) + '...');
  } catch (error) {
    logError('Failed to sync token to backend:', error?.response?.data?.message || error.message);
  }
};

export const listenTokenRefresh = onNewToken =>
  onTokenRefresh(getMessagingInstance(), async (newToken) => {
    log('Token refreshed:', newToken?.slice(0, 20) + '...');
    global.fcmToken = newToken;
    
    // ✅ Sync new token to backend
    await syncTokenToBackend(newToken);
    
    onNewToken?.(newToken);
  });

// ---------- Listeners ----------
export const setupForegroundNotifications = () =>
  onMessage(getMessagingInstance(), async remoteMessage => {
    log('Foreground message:', remoteMessage?.messageId);
    await displayNotification(remoteMessage);
  });

export const setupTapListeners = () => {
  // FCM notification tapped (app in background)
  const unsubOpened = onNotificationOpenedApp(
    getMessagingInstance(),
    remoteMessage => handleNotificationNavigation(remoteMessage?.data),
  );

  // Notifee notification tapped (app in foreground)
  const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationNavigation(detail?.notification?.data);
    }
  });

  return () => {
    unsubOpened?.();
    unsubNotifee?.();
  };
};

export const checkInitialNotification = async () => {
  try {
    // App killed state se FCM notification se khula
    const remoteMessage = await getInitialNotification(getMessagingInstance());
    if (remoteMessage) {
      handleNotificationNavigation(remoteMessage?.data);
      return;
    }

    // App killed state se Notifee notification se khula
    const initial = await notifee.getInitialNotification();
    if (initial) {
      handleNotificationNavigation(initial?.notification?.data);
    }
  } catch (error) {
    logError('Initial notification error:', error?.message || error);
  }
};

// ---------- One-call setup ----------
export const initializeNotifications = async onToken => {
  const granted = await requestNotificationPermission();
  if (!granted) {
    warn('Permission denied');
    return () => {};
  }

  const token = await getFCMToken();
  if (token) {
    onToken?.(token); // yahan backend ko token bhejo
  }

  const unsubForeground = setupForegroundNotifications();
  const unsubTap = setupTapListeners();
  const unsubToken = listenTokenRefresh(onToken);
  await checkInitialNotification();

  return () => {
    unsubForeground?.();
    unsubTap?.();
    unsubToken?.();
  };
};

export default {
  requestNotificationPermission,
  getFCMToken,
  displayNotification,
  setupForegroundNotifications,
  setupTapListeners,
  checkInitialNotification,
  initializeNotifications,
};
