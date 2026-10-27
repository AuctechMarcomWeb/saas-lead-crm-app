import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, backgroundColor = '#fff', style }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === 'ios' ? insets.top : 0, // ✅ only iOS gets padding
            backgroundColor,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'flex-start' },
});

export default ScreenWrapper;
