import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setToken } from '../redux/slices/userSlice';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './AuthNavigation';
import UnauthNavigation from './UnauthNavigation';
import SplashScreen from '../screens/SplashScreen/SplashScreen';

const RootNavigation = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('userData');

        console.log('Stored token:', storedToken);

        if (storedToken) {
          dispatch(setToken(storedToken));
        }

        if (storedUser) {
          dispatch(setUser(JSON.parse(storedUser)));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [dispatch]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (isLoading || showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <NavigationContainer>
      {token ? <AuthNavigation /> : <UnauthNavigation />}
    </NavigationContainer>
  );
};

export default RootNavigation;
