import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, subtitle, icon }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    width: (width - 40) / 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statTitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
});

export default StatCard;