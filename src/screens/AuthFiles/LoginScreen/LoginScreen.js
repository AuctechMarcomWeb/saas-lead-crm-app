/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setUser, setToken } from '../../../redux/slices/userSlice';
import { signin } from '../../../api/AuthApi/userApi';
import styles from './LoginScreen.style';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [UserId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    UserId: '',
    password: '',
  });

  const validateInputs = () => {
    const newErrors = {
      UserId: '',
      password: '',
    };

    if (!UserId.trim()) {
      newErrors.UserId = 'Please enter your User ID';
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }

    setErrors(newErrors);

    return !newErrors.UserId && !newErrors.password;
  };

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    Keyboard.dismiss();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const trimmedUserId = UserId.trim();
      const fcmToken = global.fcmToken || null;

      const requestData = {
        userId: trimmedUserId,
        password,
        fcmToken,
      };

      // Never log passwords or authentication credentials.
      const response = await signin(requestData);

      const responseBody = response?.data;
      const targetData = responseBody?.data || responseBody || null;

      if (!targetData || typeof targetData !== 'object') {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Unexpected response from server.',
          position: 'top',
        });
        return;
      }

      const user =
        targetData.user ||
        (targetData.data && typeof targetData.data === 'object'
          ? targetData.data
          : targetData);

      const authToken =
        targetData.authToken ||
        targetData.token ||
        user?.authToken ||
        user?.token;

      if (!user || typeof user !== 'object') {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'User details were not received.',
          position: 'top',
        });
        return;
      }

      // Prevent admin login from the mobile application.
      const role = String(user.role || '').toLowerCase();

      if (role === 'admin' || user.isAdmin === true) {
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'Admin users must use the web portal.',
          position: 'top',
          visibilityTime: 4000,
        });
        return;
      }

      if (!authToken) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Authentication token was not received.',
          position: 'top',
        });
        return;
      }

      const userProfile = { ...user };

      delete userProfile.authToken;
      delete userProfile.token;

      if (fcmToken) {
        userProfile.fcmToken = fcmToken;
      }

      // Save the session before updating Redux.
      await AsyncStorage.multiSet([
        ['authToken', authToken],
        ['userData', JSON.stringify(userProfile)],
      ]);

      dispatch(setToken(authToken));
      dispatch(setUser(userProfile));

      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Logged in successfully.',
        position: 'top',
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Login error:', error.response?.status || error.message);

      let errorMessage = 'Invalid credentials. Please try again.';

      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          errorMessage = 'Invalid User ID or password';
        } else if (status === 404) {
          errorMessage = 'User not found';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/images/auctech-logo-new.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* <View style={styles.brandBadge}>
                <Icon
                  name="shield-checkmark-outline"
                  size={13}
                  color="#2874F0"
                />
                <Text style={styles.brandBadgeText}>
                  PROPERTY INTELLIGENCE
                </Text>
              </View> */}

              <Text style={styles.heading}>Welcome Back</Text>
            </View>

            {/* Login card */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Sign in to your account</Text>

              {/* User ID */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  User ID
                  <Text style={styles.required}> *</Text>
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.UserId ? styles.inputError : null,
                  ]}
                >
                  <Icon
                    name="person-outline"
                    size={21}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your User ID"
                    placeholderTextColor="#6B7280"
                    value={UserId}
                    onChangeText={text => {
                      setUserId(text);
                      setErrors(prev => ({
                        ...prev,
                        UserId: '',
                      }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    cursorColor="#2874F0"
                    editable={!isLoading}
                    accessibilityLabel="User ID"
                  />
                </View>

                {!!errors.UserId && (
                  <Text style={styles.errorText}>{errors.UserId}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Password
                  <Text style={styles.required}> *</Text>
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    errors.password ? styles.inputError : null,
                  ]}
                >
                  <Icon
                    name="lock-closed-outline"
                    size={21}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      setErrors(prev => ({
                        ...prev,
                        password: '',
                      }));
                    }}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    cursorColor="#2874F0"
                    editable={!isLoading}
                    accessibilityLabel="Password"
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setIsPasswordVisible(prev => !prev)}
                    disabled={isLoading}
                    activeOpacity={0.7}
                    accessibilityLabel={
                      isPasswordVisible ? 'Hide password' : 'Show password'
                    }
                  >
                    <Icon
                      name={
                        isPasswordVisible ? 'eye-outline' : 'eye-off-outline'
                      }
                      size={21}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {!!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleLogin}
                style={[styles.button, isLoading && styles.buttonDisabled]}
                disabled={isLoading}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default LoginScreen;
