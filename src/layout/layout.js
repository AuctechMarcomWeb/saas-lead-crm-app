import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav from '../components/BottomNavBar/bottomNav';
import ScreenWrapper from '../components/safeAreaViewWrapper/ScreenWrapper';

const Layout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Wrap only the content in ScreenWrapper */}
      <ScreenWrapper style={styles.content} >
        {children}
      </ScreenWrapper>

      {/* Persistent BottomNav, always at the bottom */}
      {/* <BottomNav /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // Ensure space is divided, with BottomNav always at the bottom
  },
  content: {
  },
});

export default Layout;
