import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import Layout from '../../../layout/layout';
import colors from '../../../theme/colors';
import axios from 'axios';

// Import your menu components
import Dashboard from '../../HomeDashboard/HomeScreen/Dashboard';
import WalletCard from '../../../components/HeaderSidebar/HeaderSidebar';

// Placeholder component for routes that don't have screens yet
const ComingSoon = ({ title }) => (
  <View style={styles.comingSoonContainer}>
    <Text style={styles.comingSoonTitle}>{title}</Text>
    <Text style={styles.comingSoonText}>This feature is coming soon!</Text>
  </View>
);

const Home = ({ navigation }) => {
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [testLoading, setTestLoading] = useState(false);

  // 🔥 Setup notification listeners
  useEffect(() => {
    console.log('🏠 [Home] Setting up notification listeners...');

    if (!messaging) {
      console.warn('⚠️ [Home] Firebase messaging not available');
      return;
    }

    try {
      // Handle foreground messages (App is open)
      const unsubscribeForeground = messaging.onMessage(async remoteMessage => {
        console.log('\n' + '='.repeat(80));
        console.log('📨 [HOME] FOREGROUND MESSAGE RECEIVED');
        console.log('='.repeat(80));
        console.log('Title:', remoteMessage?.notification?.title);
        console.log('Body:', remoteMessage?.notification?.body);
        console.log('='.repeat(80) + '\n');

        Toast.show({
          type: 'info',
          text1: remoteMessage.notification?.title || 'Notification',
          text2: remoteMessage.notification?.body || '',
          position: 'top',
          visibilityTime: 5000,
        });
      });

      // Handle notification opened from background
      const unsubscribeBackground = messaging.onNotificationOpenedApp(
        remoteMessage => {
          console.log('\n' + '='.repeat(80));
          console.log('📌 [HOME] NOTIFICATION OPENED FROM BACKGROUND');
          console.log('='.repeat(80));
          console.log('Title:', remoteMessage?.notification?.title);
          console.log('Body:', remoteMessage?.notification?.body);
          console.log('='.repeat(80) + '\n');

          Toast.show({
            type: 'success',
            text1: remoteMessage.notification?.title || 'Notification',
            text2: 'App opened from notification',
            position: 'top',
            visibilityTime: 5000,
          });
        },
      );

      // Check if app was opened by notification (Killed state)
      messaging.getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 [HOME] App opened from killed state notification');
          console.log('Title:', remoteMessage?.notification?.title);
        }
      });

      console.log('✅ [Home] Notification listeners setup complete');

      // Cleanup on unmount
      return () => {
        unsubscribeForeground();
        unsubscribeBackground();
      };
    } catch (error) {
      console.error('❌ [Home] Error setting up notifications:', error.message);
    }
  }, []);

  // 🧪 Send test notification
  const sendTestNotification = async () => {
    setTestLoading(true);
    try {
      console.log('📤 [Home] Sending test notification...');

      if (!global.fcmToken) {
        Toast.show({
          type: 'error',
          text1: '❌ No FCM Token',
          text2: 'Please login first',
          position: 'top',
          visibilityTime: 3000,
        });
        setTestLoading(false);
        return;
      }

      const response = await axios.post(
        'http://192.168.1.7:9001/api/test/send-message',
        {
          fcmToken: global.fcmToken,
          title: '🧪 Test Notification',
          body: 'Sent from app! ✅',
        },
      );

      console.log('✅ Test sent:', response.data?.data?.messageId);

      Toast.show({
        type: 'success',
        text1: '✅ Test Sent',
        text2: 'Check notifications!',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('❌ Error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const renderComponent = () => {
    switch (activeComponent) {
      // Dashboards
      case 'Dashboard':
        return <Dashboard />;
      case 'Analytics':
        return <ComingSoon title="Analytics Dashboard" />;

      // Admin
      case 'Admin':
        return <Admin />;
      case 'UserManagement':
        return <UserManagment />;
      case 'RolesPermissions':
        return <ComingSoon title="Roles & Permissions" />;

      // Masters
      case 'PlatformsMaster':
        return <Platform />;
      case 'LeadStatusMaster':
        return <LeadStatus />;
      case 'LeadActionMaster':
        return <LeadAction />;

      case 'LeadRateMaster':
        return <LeadRateMaster />;

      // Lead Management
      case 'LeadDashboard':
        return <LeadDashboard />;
      case 'LeadLog':
        return <LeadLogs />;
      case 'LeadBankAssigned':
        return <LeadBankAssigned />;
      case 'LeadDistribution':
        return <LeadDistribution />;
      case 'LeadLogs':
        return <LeadLogs />;
      case 'Project':
        return <Project />;

      // Lead Reports
      case 'PlatformAnalytics':
        return <ComingSoon title="Platform Analytics" />;
      case 'LeadStatusReport':
        return <ComingSoon title="Lead Status Report" />;
      case 'LeadExcelReport':
        return <ComingSoon title="Lead Excel Report" />;
      case 'UserPerformanceReport':
        return <ComingSoon title="User Performance Report" />;
      case 'IVRCallStatistics':
        return <ComingSoon title="IVR Call Statistics" />;
      case 'IVRCallLogReport':
        return <ComingSoon title="IVR Call Log Report" />;

      // Settings
      case 'Settings':
        return <Settings />;
      case 'AccountSettings':
        return <ComingSoon title="Account Settings" />;
      case 'Preferences':
        return <ComingSoon title="Preferences" />;

      // Team (keeping for backward compatibility)
      case 'Team':
        return <Team />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {/* Wallet Balance Card */}
      <WalletCard
        userName="Seina Wilson"
        userImage={null}
        balance={2450.0}
        onAddMoney={() => navigation.navigate('WalletScreen')}
        onNotificationPress={() => navigation.navigate('NotificationScreen')}
        onComponentChange={setActiveComponent}
      />

      {/* 🧪 Test Notification Button */}
      {/* <TouchableOpacity
        style={[styles.testButton, testLoading && styles.testButtonDisabled]}
        onPress={sendTestNotification}
        disabled={testLoading}
      >
        {testLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.testButtonText}>🧪 Send Test Notification</Text>
        )}
      </TouchableOpacity> */}

      {/*
        Dashboard has its own FlatList with RefreshControl.
        Wrapping it in a ScrollView breaks pull-to-refresh because the outer
        ScrollView intercepts the gesture. Use a plain flex View instead.
        All other components get a ScrollView so they can scroll normally.
      */}
      {activeComponent === 'Dashboard' ? (
        <View style={styles.container}>{renderComponent()}</View>
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {renderComponent()}
        </ScrollView>
      )}
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary || '#333',
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
