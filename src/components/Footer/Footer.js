import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const AppFooter = () => {
  return (
    <LinearGradient
      colors={['#7A5FFF', '#5C4DFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.footer}>
      <Text style={styles.footerText}>
        © 2025 | DEVELOPED BY AUCTECH MARCOM
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  footer: {

    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.3,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 8,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});

export default AppFooter;
