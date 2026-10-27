import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './NotificationScreen.style';
import { createAxiosInstance } from '../../api/config';
import ArrowHeader from '../../components/arrowHeader/arrowHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const apiClient = createAxiosInstance('user-notifications');

  // 🔥 Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/', {
        params: { page: 1, limit: 50 },
      });
      const data = response.data?.data?.notifications || [];
      setNotifications(data);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/unread-count');
      setUnreadCount(response.data?.data?.unreadCount || 0);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error.message);
    }
  };

  // 🔥 Mark notification as read
  const handleMarkAsRead = async notificationId => {
    try {
      await apiClient.patch(`/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('❌ Error marking as read:', error.message);
    }
  };

  // 🔥 Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch('/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all as read:', error.message);
    }
  };

  // 🔥 Delete notification
  const handleDeleteNotification = async notificationId => {
    try {
      await apiClient.delete(`/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId),
      );
    } catch (error) {
      console.error('❌ Error deleting notification:', error.message);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    await fetchUnreadCount();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const cleanTitle = (title) => {
    // Remove MongoDB ID from title if present
    return title.replace(/: [a-f0-9]{24}$/, '');
  };

  const renderItem = ({ item }) => {
    let icon = 'notifications-outline';
    let color = '#C5A253';

    if (item.type === 'Bill') {
      icon = 'receipt-outline';
      color = '#5A67D8';
    } else if (item.type === 'Complaint') {
      icon = 'construct-outline';
      color = '#FFB100';
    } else if (item.type === 'Disconnection') {
      icon = 'alert-circle-outline';
      color = '#FF4B4B';
    } else if (item.type === 'System') {
      icon = 'information-circle-outline';
      color = '#00BFA6';
    } else if (item.type === 'Lead') {
      icon = 'person-outline';
      color = '#FF6B9D';
    } else if (item.type === 'Reminder') {
      icon = 'alarm-outline';
      color = '#FFA500';
    } else if (item.type === 'Status') {
      icon = 'checkmark-circle-outline';
      color = '#4CAF50';
    }

    const leadDetails = item.leadDetails;
    const titleText = cleanTitle(item.title);

    const handleNotificationPress = () => {
      if (!item.isRead) {
        handleMarkAsRead(item._id);
      }
      setSelectedNotification(item);
    };

    return (
      <TouchableOpacity
        onPress={handleNotificationPress}
        activeOpacity={0.7}
      >
        <View style={styles.notificationCard}>
          {/* Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: color + '20' }]}
          >
            <Icon name={icon} size={28} color={color} />
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            {/* Title */}
            <Text 
              style={[styles.title, item.isRead && styles.readText]}
              numberOfLines={1}
            >
              {titleText}
            </Text>

            {/* Lead Details or Message */}
            {leadDetails ? (
              <>
                <Text 
                  style={[styles.message, item.isRead && styles.readText]}
                  numberOfLines={1}
                >
                  👤 {leadDetails.name} • {leadDetails.phone}
                </Text>
                <Text 
                  style={[styles.subtitle, item.isRead && styles.readText]}
                  numberOfLines={1}
                >
                  {leadDetails.email} • 📍 {leadDetails.status}
                </Text>
              </>
            ) : (
              <Text 
                style={[styles.message, item.isRead && styles.readText]}
                numberOfLines={2}
              >
                {item.message}
              </Text>
            )}

            {/* Timestamp */}
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteNotification(item._id);
            }}
          >
            <Icon name="close-circle" size={20} color="#FF4B4B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ArrowHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        rightIcon={unreadCount > 0 ? 'checkmark-done-outline' : null}
        onRightPress={unreadCount > 0 ? handleMarkAllAsRead : null}
      />

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off-outline" size={60} color="#CCC" />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}

      {/* Modal - Notification Detail */}
      {selectedNotification && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedNotification(null)}
            >
              <Icon name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Modal Content */}
            <View style={styles.modalContent}>
              {/* Title */}
              <Text style={styles.modalTitle}>
                {cleanTitle(selectedNotification.title)}
              </Text>

              {/* Message */}
              <Text style={styles.modalMessage}>
                {selectedNotification.message}
              </Text>

              {/* Lead Details */}
              {selectedNotification.leadDetails && (
                <View style={styles.leadDetailsBox}>
                  <Text style={styles.leadName}>
                    👤 {selectedNotification.leadDetails.name}
                  </Text>
                  <Text style={styles.leadInfo}>
                    📞 {selectedNotification.leadDetails.phone}
                  </Text>
                  <Text style={styles.leadInfo}>
                    📧 {selectedNotification.leadDetails.email}
                  </Text>
                  <Text style={styles.leadInfo}>
                    📍 {selectedNotification.leadDetails.status}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalButtonsContainer}>
                {/* View History Button */}
                <TouchableOpacity
                  style={[styles.modalButton, styles.historyBtn]}
                  onPress={() => {
                    setSelectedNotification(null);
                    if (selectedNotification.data?.leadId) {
                      navigation.navigate('LeadActivityDetails', {
                        leadId: selectedNotification.data.leadId,
                        title: selectedNotification.title,
                        phone: selectedNotification.leadDetails?.phone,
                      });
                    }
                  }}
                >
                  <Icon name="document-text" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>View History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
