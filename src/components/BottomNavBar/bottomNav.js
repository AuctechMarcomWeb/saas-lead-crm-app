import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from './bottomnavStyles';

const { width } = Dimensions.get('window');

const tabs = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'Home' },
  {
    name: 'Bills',
    icon: 'receipt-outline',
    activeIcon: 'receipt',
    route: 'BillsScreen',
  },
  {
    name: 'Complaints',
    icon: 'warning-outline',
    activeIcon: 'warning',
    route: 'ComplaintsScreen',
  },
  {
    name: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
    route: 'ProfileScreen',
  },
];

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [activeTab, setActiveTab] = useState(0);
  const scaleAnims = useRef(tabs.map(() => new Animated.Value(1))).current;
  const textOpacities = useRef(tabs.map(() => new Animated.Value(0))).current;

  // Update active tab based on route name
  const updateActiveTab = currentRouteName => {
    const index = tabs.findIndex(tab => tab.route === currentRouteName);
    if (index !== -1 && index !== activeTab) {
      // Animate out previous tab
      if (activeTab !== null) {
        Animated.parallel([
          Animated.spring(scaleAnims[activeTab], {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }),
          Animated.timing(textOpacities[activeTab], {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Animate in new tab
      Animated.parallel([
        Animated.spring(scaleAnims[index], {
          toValue: 1.1,
          useNativeDriver: true,
          friction: 8,
        }),
        Animated.timing(textOpacities[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setActiveTab(index);
    }
  };

  // Listen for navigation state changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const currentRoute = navigation.getCurrentRoute?.() || route;
      updateActiveTab(currentRoute.name);
    });

    // Initialize on mount
    updateActiveTab(route.name);

    return unsubscribe;
  }, [navigation]);

  // Handle tab press navigation
  const onTabPress = index => {
    navigation.navigate(tabs[index].route);
    updateActiveTab(tabs[index].route);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bottomNav}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity
              key={index}
              style={styles.tabItem}
              onPress={() => onTabPress(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale: scaleAnims[index] }],
                  },
                ]}
              >
                <Icon
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? '#FFFFFF' : '#B3B3B3'}
                  style={styles.tabIcon}
                />
                <Animated.Text
                  style={[
                    styles.tabText,
                    {
                      opacity: textOpacities[index],
                      color: isActive ? '#FFFFFF' : '#B3B3B3',
                    },
                  ]}
                >
                  {tab.name}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNav;