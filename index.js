import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import App from './App';
import { name as appName } from './app.json';
import { displayNotification } from './src/services/notificationService';

// Background / killed state me message handler (top level pe hi hona chahiye)
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('📩 [FCM] Background message:', remoteMessage?.messageId);

  // Notification payload ko Android khud dikhata hai.
  // Data-only message ho tabhi Notifee se dikhao (duplicate se bachne ke liye).
  if (!remoteMessage?.notification) {
    await displayNotification(remoteMessage);
  }
});

// Notifee background events (required, warna warning aati hai)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('👆 [NOTIFEE] Pressed in background:', detail?.notification?.data);
  }
});

AppRegistry.registerComponent(appName, () => App);