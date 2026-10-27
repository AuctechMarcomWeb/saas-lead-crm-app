import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const fullBaseURL = `https://auctech-leads-crm-backend-zcey.onrender.com/api`;

export default function TestNotificationScreen() {
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const [response, setResponse] = useState('');

  // Get FCM token from phone
  const getFCMToken = async () => {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const token = await messaging.getToken();
      setFcmToken(token);
      Alert.alert('FCM Token', token);
    } catch (error) {
      Alert.alert('Error', 'Could not get FCM token: ' + error.message);
    }
  };

  // Send test push notification
  const sendTestNotification = async () => {
    if (!fcmToken.trim()) {
      Alert.alert('Error', 'Please get FCM token first');
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(`${fullBaseURL}/test/send-message`, {
        fcmToken: fcmToken,
        title: '🚀 Test Notification',
        body: 'This is a test push notification from the backend!',
      });

      setResponse(JSON.stringify(result.data, null, 2));
      Alert.alert('Success', 'Notification sent! Check your phone.');
    } catch (error) {
      setResponse('Error: ' + error.message);
      Alert.alert('Error', 'Failed to send notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Broadcast to all users
  const broadcastNotification = async () => {
    setLoading(true);
    try {
      const result = await axios.post(`${fullBaseURL}/test/broadcast`, {
        title: '📢 Broadcast Test',
        body: 'This is a broadcast to all users!',
      });

      setResponse(JSON.stringify(result.data, null, 2));
      Alert.alert('Success', 'Broadcast sent!');
    } catch (error) {
      setResponse('Error: ' + error.message);
      Alert.alert('Error', 'Failed to broadcast: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get all users with tokens
  const getUsersWithTokens = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${fullBaseURL}/test/users-with-tokens`);
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (error) {
      setResponse('Error: ' + error.message);
      Alert.alert('Error', 'Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Test Push Notifications</Text>
        <Text style={styles.subtitle}>Render Deployment Test</Text>
      </View>

      {/* FCM Token Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1️⃣ Get Your FCM Token</Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={getFCMToken}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get FCM Token</Text>
        </TouchableOpacity>
        {fcmToken && (
          <Text style={styles.tokenText}>Token: {fcmToken.substring(0, 50)}...</Text>
        )}
      </View>

      {/* Send Individual Notification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2️⃣ Send Test to Your Device</Text>
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={sendTestNotification}
          disabled={loading || !fcmToken}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Test Notification</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Get Users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3️⃣ See All Users with Tokens</Text>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={getUsersWithTokens}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Users List</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Broadcast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4️⃣ Broadcast to All Users</Text>
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={broadcastNotification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Broadcast Notification</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Response Section */}
      {response && (
        <View style={styles.responseSection}>
          <Text style={styles.responseTitle}>📋 Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  responseSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
