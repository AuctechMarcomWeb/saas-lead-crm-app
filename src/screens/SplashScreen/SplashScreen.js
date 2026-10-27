import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

import {
  requestNotificationPermission,
  getFCMToken,
} from '../../services/notificationService';

import colors from '../../theme/colors';

const SplashScreen = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1800));

        if (!active) return;

        const hasPermission = await requestNotificationPermission();

        if (hasPermission && active) {
          await getFCMToken();
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Splash error:', error?.message);
      } finally {
        if (active) {
          onComplete?.();
        }
      }
    };

    initializeApp();

    return () => {
      active = false;
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      lineAnim.stopAnimation();
    };
  }, [onComplete, fadeAnim, slideAnim, lineAnim]);

  const animatedWidth = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top corporate accent */}
      <View style={styles.topAccent} />

      {/* Subtle background shapes */}
      <View style={styles.backgroundCircle} />
      <View style={styles.backgroundCircleSmall} />

      {/* Company branding */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/auctech-logo-new.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.taglineContainer}>
          <View style={styles.taglineLine} />

          <Text style={styles.tagline}>ROOTED IN GROWTH.</Text>

          <Text style={styles.taglineAccent}>BUILT FOR TRUST.</Text>
        </View>
      </Animated.View>

      {/* Animated loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressBar, { width: animatedWidth }]}
          />
        </View>
      </View>

      {/* Bottom brand accent */}
      <View style={styles.bottomAccent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: colors.backgroundbtn,
  },

  backgroundCircle: {
    position: 'absolute',
    top: -145,
    right: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(40, 116, 240, 0.045)',
  },

  backgroundCircleSmall: {
    position: 'absolute',
    bottom: -120,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(242, 78, 30, 0.045)',
  },

  brandContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  logoContainer: {
    width: '100%',
    height: 290,
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  taglineContainer: {
    alignItems: 'center',
    marginTop: 22,
  },

  taglineLine: {
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginBottom: 18,
  },

  tagline: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.backgroundbtn,
    letterSpacing: 2,
    textAlign: 'center',
  },

  taglineAccent: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginTop: 5,
    textAlign: 'center',
  },

  loadingContainer: {
    position: 'absolute',
    bottom: 65,
    width: 90,
    alignItems: 'center',
  },

  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E9EEF6',
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.backgroundbtn,
  },

  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 65,
    height: 5,
    backgroundColor: colors.primary,
  },
});

export default SplashScreen;
