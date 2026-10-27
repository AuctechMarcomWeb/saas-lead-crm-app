import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../../redux/slices/userSlice';
import { wp, hp } from '../../../utilies/Functon/Responsive';
import Layout from '../../../layout/layout';
import colors from '../../../theme/colors';
import { getUseDetails, updateUser } from '../../../api/AuthApi/userApi';
import useImageUpload from '../../../utilies/Functon/imageUploadFunction';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  const {
    loading: uploadingImage,
    pickFromGallery,
    pickFromCamera,
  } = useImageUpload(async (imageUrl) => {
    await handleUpdateProfileImage(imageUrl);
  });

  // Menu items matching the design
  const menuItems = [
    { id: 1, icon: 'receipt-outline', label: 'Order History', screen: 'OrderHistory' },
    { id: 2, icon: 'location-outline', label: 'Shipping Address', screen: 'ShippingAddress' },
    { id: 3, icon: 'document-text-outline', label: 'Create Request', screen: 'CreateRequest' },
    { id: 4, icon: 'shield-checkmark-outline', label: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { id: 5, icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getUseDetails();
      console.log('response', response);

      if (response && response.data) {
        const user = response.data.data;

        setUserProfile({
          id: user._id,
          name: user.name || 'N/A',
          phone: user.phone || 'N/A',
          email: user.email || 'N/A',
          gender: user.gender || 'N/A',
          dob: user.dob ? new Date(user.dob).toDateString() : 'N/A',
          occupation: user.occupation || 'N/A',
          address: user.address || 'N/A',
          roll: user.roll || 'User',
          isNew: user.isNew,
          image: user.profilePic || null,
          updatedAt: new Date(user.updatedAt).toLocaleDateString(),
        });

        setUserId(user._id);
      } else {
        Alert.alert('Error', response?.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfileImage = async (imageUrl) => {
    try {
      if (!userId) {
        Alert.alert('Error', 'User information not found');
        return;
      }

      const updateData = { profilePic: imageUrl };
      const response = await updateUser(userId, updateData);
      console.log('updateUser response', response);

      if (response?.success) {
        setUserProfile((prev) => ({ ...prev, image: imageUrl }));
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    }
  };

  const handleImageSelection = (type) => {
    setImageModalVisible(false);
    setTimeout(() => {
      type === 'camera' ? pickFromCamera() : pickFromGallery();
    }, 500);
  };

  const handleMenuPress = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              dispatch(logout());
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity onPress={fetchUserData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back-outline" size={wp(6)} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: wp(6) }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userProfile.image ? (
              <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitial}>{userProfile.name.charAt(0)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={() => setImageModalVisible(true)}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={colors.cardColor} />
              ) : (
                <Icon name="camera-outline" size={wp(4)} color={colors.cardColor} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userPhone}>{userProfile.phone}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handleMenuPress(item.screen)}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={wp(5)} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon name="chevron-forward-outline" size={wp(5)} color={colors.textMuted} />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
              <Icon name="log-out-outline" size={wp(5)} color="#FF6B6B" />
            </View>
            <Text style={styles.logoutLabel}>Log out</Text>
            <Icon name="chevron-forward-outline" size={wp(5)} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Selection Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Update Profile Picture</Text>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleImageSelection('camera')}
            >
              <Icon name="camera-outline" size={wp(6)} color={colors.primary} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleImageSelection('gallery')}
            >
              <Icon name="images-outline" size={wp(6)} color={colors.primary} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setImageModalVisible(false)}
            >
              <Icon name="close-circle-outline" size={wp(6)} color="#FF6B6B" />
              <Text style={[styles.modalOptionText, { color: '#FF6B6B' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Layout>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: hp(2),
    color: colors.textSecondary,
    fontSize: wp(3.5),
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: wp(4),
  },
  retryButton: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: colors.primary,
    borderRadius: wp(2),
  },
  retryText: {
    color: colors.cardColor,
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: colors.cardColor,
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: hp(4),
    backgroundColor: colors.cardColor,
    marginBottom: hp(2),
  },
  profileImageContainer: {
    marginBottom: hp(2),
    position: 'relative',
  },
  profileImage: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#FFE4D6',
  },
  profileImagePlaceholder: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: '#FFE4D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: wp(10),
    fontWeight: '700',
    color: colors.primary,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardColor,
  },
  userName: {
    fontSize: wp(5.5),
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: hp(0.5),
  },
  userPhone: {
    fontSize: wp(3.5),
    color: colors.textMuted,
    marginBottom: hp(0.3),
  },
  userEmail: {
    fontSize: wp(3.5),
    color: colors.textMuted,
  },
  menuContainer: {
    paddingHorizontal: wp(4),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardColor,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  lastMenuItem: {
    marginBottom: hp(2),
  },
  menuIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FFE4D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuLabel: {
    flex: 1,
    fontSize: wp(4),
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardColor,
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    marginBottom: hp(3),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutIconContainer: {
    backgroundColor: '#FFE4E4',
  },
  logoutLabel: {
    flex: 1,
    fontSize: wp(4),
    color: '#FF6B6B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardColor,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    paddingBottom: hp(3),
  },
  modalHeader: {
    padding: wp(5),
    alignItems: 'center',
  },
  modalHandle: {
    width: wp(10),
    height: hp(0.5),
    backgroundColor: colors.neutral?.textMuted || '#ccc',
    borderRadius: wp(1),
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalOptionText: {
    marginLeft: wp(4),
    fontSize: wp(4),
    color: colors.textPrimary,
    fontWeight: '500',
  },
};

export default ProfileScreen;