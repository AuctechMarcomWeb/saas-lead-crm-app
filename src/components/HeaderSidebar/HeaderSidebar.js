/* eslint-disable react-hooks/exhaustive-deps */
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wp, hp } from '../../utilies/Functon/Responsive';
import styles from './HeaderSidebarstyle';
import { getUseDatabyId } from '../../api/AuthApi/userApi';
import { updateUserInfo } from '../../redux/slices/userSlice';
import colors from '../../theme/colors';

const WalletBalanceCard = ({ onNotificationPress, onComponentChange }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({}); // Track expanded menus
  const userInfo = useSelector(state => state.user.userInfo);
  console.log('dataudr info ===', userInfo);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      const userId = userData ? JSON.parse(userData).id : null;

      if (userId) {
        const response = await getUseDatabyId(userId);
        if (response && response.data) {
          const user = response.data;
          dispatch(
            updateUserInfo({
              id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              projectId: user.projectId,
              siteId: user.siteId,
              unitId: user.unitId,
              profilePic: user.referenceId?.profilePic || null,
              address: user.referenceId?.address || null,
              referenceId: user.referenceId?._id || null,
              isActive: user.referenceId?.isActive || true,
              ownershipStartDate: user.referenceId?.ownershipStartDate || null,
              unitIds: user.referenceId?.unitIds || [],
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            }),
          );
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      dispatch(
        updateUserInfo({
          name: 'Guest User',
          profilePic: null,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  // Toggle menu expansion
  const toggleMenu = index => {
    setExpandedMenus(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle sub-item press
  const handleSubItemPress = componentName => {
    toggleSidebar();
    if (onComponentChange) {
      onComponentChange(componentName);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      {/* 🌟 Header Card */}
      <LinearGradient
        colors={['#2563EB', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          {/* Profile Image — Click opens sidebar */}
          <TouchableOpacity onPress={toggleSidebar} activeOpacity={0.8}>
            {loading ? (
              <View style={styles.avatar}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : (
              <Image
                source={
                  userInfo?.profilePic
                    ? { uri: userInfo.profilePic }
                    : require('../../assets/images/Login.jpg')
                }
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>
              {loading ? 'Loading...' : userInfo?.userId || 'Guest User'}
            </Text>
          </View>

          {/* Notification */}
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
          >
            <Icon name="notifications-outline" size={wp(5.5)} color="#FFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ⚡ Sidebar Modal (Expandable Menu) */}
      <Modal
        isVisible={isSidebarOpen}
        style={{ margin: 0, justifyContent: 'flex-start' }}
        animationIn="fadeInLeft"
        animationOut="fadeOutLeft"
        onBackdropPress={toggleSidebar}
        onSwipeComplete={toggleSidebar}
        swipeDirection="left"
        backdropOpacity={0.4}
        propagateSwipe
        onRequestClose={toggleSidebar}
      >
        <View style={localStyles.sidebarWrapper}>
          <View style={localStyles.sidebar}>
            {/* Profile Info */}
            <View style={localStyles.profileSection}>
              <Image
                source={
                  userInfo?.profilePic
                    ? { uri: userInfo.profilePic }
                    : require('../../assets/images/Login.jpg')
                }
                style={localStyles.profileImage}
              />
              <View style={localStyles.profileDetails}>
                {/* <TouchableOpacity
                  onPress={() => {
                    toggleSidebar();
                    navigation.navigate('ProfileScreen');
                  }}
                >
                  <Text style={localStyles.profileName}>
                    {userInfo?.name || 'Guest User'}
                  </Text>
                  <Text style={localStyles.editProfile}>Edit Profile</Text>
                </TouchableOpacity> */}
              </View>
            </View>

            {/* Expandable Menu Items */}
            {/* <ScrollView showsVerticalScrollIndicator={false}>
              {menuOptions.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={localStyles.menuItem}
                    onPress={() => toggleMenu(index)}
                  >
                    <Image source={item.image} style={localStyles.menuIcon} />
                    <Text style={localStyles.menuItemText}>{item.title}</Text>
                    <Icon
                      name={
                        expandedMenus[index] ? 'chevron-up' : 'chevron-down'
                      }
                      size={wp(5)}
                      color="white"
                      style={localStyles.chevronIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={localStyles.logoutButton}
                    onPress={handleLogout}
                  >
                    <Icon name="log-out-outline" size={wp(5)} color="#fff" />
                    <Text style={localStyles.logoutText}>Logout</Text>
                  </TouchableOpacity>

                  {expandedMenus[index] && item.subItems && (
                    <View style={localStyles.subItemsContainer}>
                      {item.subItems.map((subItem, subIndex) => (
                        <TouchableOpacity
                          key={subIndex}
                          style={localStyles.subMenuItem}
                          onPress={() =>
                            handleSubItemPress(subItem.componentName)
                          }
                        >
                          <Icon
                            name={subItem.icon}
                            size={wp(4)}
                            color="rgba(255,255,255,0.8)"
                          />
                          <Text style={localStyles.subMenuItemText}>
                            {subItem.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView> */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {menuOptions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={localStyles.menuItem}
                  onPress={() => handleSubItemPress(item.componentName)}
                >
                  <Image source={item.image} style={localStyles.menuIcon} />
                  <Text style={localStyles.menuItemText}>{item.title}</Text>

                  <Icon
                    name="chevron-forward"
                    size={wp(5)}
                    color="white"
                    style={localStyles.chevronIcon}
                  />
                </TouchableOpacity>
              ))}

              {/* Logout Button */}
              <TouchableOpacity
                style={localStyles.logoutButton}
                onPress={handleLogout}
              >
                <Icon name="log-out-outline" size={wp(5)} color="#fff" />
                <Text style={localStyles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Updated menu options with sub-items
const menuOptions = [
  {
    title: 'Dashboard',
    componentName: 'Dashboard',
    image: require('../../assets/images/Dashboards.png'),
    icon: 'home-outline',
  },
  // {
  //   title: 'Dashboards',
  //   image: require('../../assets/images/Dashboards.png'),
  //   subItems: [
  //     {
  //       title: 'Main Dashboard',
  //       componentName: 'Dashboard',
  //       icon: 'home-outline',
  //     },
  //     // {
  //     //   title: 'Analytics',
  //     //   componentName: 'Analytics',
  //     //   icon: 'stats-chart-outline',
  //     // },
  //   ],
  // },
  // {
  //   title: 'Admin',
  //   image: require('../../assets/images/Admin.png'),
  //   subItems: [
  //     {
  //       title: 'User Management',
  //       componentName: 'UserManagement',
  //       icon: 'people-outline',
  //     },
  //     // {
  //     //   title: 'Roles & Permissions',
  //     //   componentName: 'RolesPermissions',
  //     //   icon: 'shield-outline',
  //     // },
  //   ],
  // },

  // {
  //   title: 'Master',
  //   image: require('../../assets/images/Sales&Marketing.png'),
  //   subItems: [
  //     {
  //       title: 'Lead Action',
  //       componentName: 'LeadActionMaster',
  //       icon: 'flash-outline',
  //     },
  //     {
  //       title: 'Lead Status',
  //       componentName: 'LeadStatusMaster',
  //       icon: 'layers-outline',
  //     },
  //     {
  //       title: 'Lead Rate',
  //       componentName: 'LeadRateMaster',
  //       icon: 'cash-outline',
  //     },
  //     {
  //       title: 'Platforms',
  //       componentName: 'PlatformsMaster',
  //       icon: 'apps-outline',
  //     },

  //   ],
  // }

  // {
  //   title: 'Lead Management',
  //   image: require('../../assets/images/Team.png'),
  //   subItems: [
  //     {
  //       title: 'Lead Dashboard',
  //       componentName: 'LeadDashboard',
  //       icon: 'speedometer-outline',
  //     },
  //     { title: 'Lead Log', componentName: 'LeadLog', icon: 'list-outline' },
  //     {
  //       title: 'Lead Bank (Assigned)',
  //       componentName: 'LeadBankAssigned',
  //       icon: 'folder-outline',
  //     },
  //     {
  //       title: 'Lead Distribution',
  //       componentName: 'LeadDistribution',
  //       icon: 'share-social-outline',
  //     },
  //     // {
  //     //   title: 'Project Assign',
  //     //   componentName: 'Project',
  //     //   icon: 'briefcase-outline',
  //     // },
  //   ],
  // },

  // {
  //   title: 'Lead Reports',
  //   image: require('../../assets/images/Project.png'),
  //   subItems: [
  //     {
  //       title: 'Platform Analytics',
  //       componentName: 'PlatformAnalytics',
  //       icon: 'analytics-outline',
  //     },
  //     {
  //       title: 'Lead Status Report',
  //       componentName: 'LeadStatusReport',
  //       icon: 'newspaper-outline',
  //     },
  //     {
  //       title: 'Lead Excel Report',
  //       componentName: 'LeadExcelReport',
  //       icon: 'document-outline',
  //     },
  //     {
  //       title: 'User Performance Report',
  //       componentName: 'UserPerformanceReport',
  //       icon: 'trophy-outline',
  //     },
  //     {
  //       title: 'IVR Call Statistics',
  //       componentName: 'IVRCallStatistics',
  //       icon: 'call-outline',
  //     },
  //     {
  //       title: 'IVR Call Log Report',
  //       componentName: 'IVRCallLogReport',
  //       icon: 'phone-portrait-outline',
  //     },
  //   ],
  // },

  // {
  //   title: 'Settings',
  //   image: require('../../assets/images/setting.png'),
  //   subItems: [
  //     {
  //       title: 'Account Settings',
  //       componentName: 'AccountSettings',
  //       icon: 'person-circle-outline',
  //     },
  //     {
  //       title: 'Preferences',
  //       componentName: 'Preferences',
  //       icon: 'options-outline',
  //     },
  //   ],
  // },
  ,
];

const localStyles = StyleSheet.create({
  sidebarWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sidebar: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.textSecondary,
    padding: wp(5),
    borderTopRightRadius: wp(4),
    borderBottomRightRadius: wp(4),
    elevation: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: hp(1.5),
    marginBottom: hp(2),
  },
  profileImage: {
    width: wp(13),
    height: wp(13),
    borderRadius: wp(6.5),
  },
  profileDetails: {
    marginLeft: wp(3),
  },
  profileName: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: 'white',
  },
  editProfile: {
    color: 'white',
    fontSize: wp(3.3),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    width: wp(8),
    height: wp(8),
    resizeMode: 'contain',
    marginRight: wp(3),
  },
  menuItemText: {
    fontSize: wp(4),
    color: 'white',
    flex: 1,
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  subItemsContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingLeft: wp(8),
    paddingVertical: hp(0.5),
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    paddingLeft: wp(6),
  },
  subMenuItemText: {
    fontSize: wp(3.5),
    color: 'rgba(255,255,255,0.9)',
    marginLeft: wp(3),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    marginTop: hp(2),
  },
  logoutText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(2),
  },
});

export default WalletBalanceCard;
