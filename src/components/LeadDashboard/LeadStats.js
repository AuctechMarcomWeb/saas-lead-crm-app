import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './LeadStyles';

const LeadStats = ({
  stats = [], // Direct backend data: Array(8)
  onStatusPress,
  selectedStatus,
}) => {
  // Safe array check (agar backend key structure wrap ho kar aaye toh fallback)
  const statsArray = Array.isArray(stats) ? stats : stats?.data || [];

  // Dynamic Icon aur Color generator taaki naye status par app crash na ho
  const getCardMeta = status => {
    const s = String(status).toLowerCase().trim();

    if (s === 'all') return { icon: 'format-list-bulleted', color: '#0891B2' };
    if (s === 'fresh') return { icon: 'star', color: '#3B82F6' };
    if (s === 'recent') return { icon: 'clock', color: '#F59E0B' };
    if (s.includes('follow'))
      return { icon: 'calendar-month', color: '#6B7280' };
    if (s === 'pending') return { icon: 'clock-outline', color: '#EF4444' };
    if (s.includes('meeting') || s.includes('schedule'))
      return { icon: 'calendar-check', color: '#22C55E' };
    if (s === 'open') return { icon: 'fire', color: '#1877F2' };
    if (s === 'scraped') return { icon: 'delete', color: '#EF4444' };
    if (s === 'qualified') return { icon: 'check-bold', color: '#10B981' };

    // Fallback default meta agar backend se koi bilkul anjaan status aa jaye
    return { icon: 'help-circle-outline', color: '#94A3B8' };
  };

  return (
    <View style={styles.statsContainer}>
      {statsArray.map((item, index) => {
        const statusName = item?.status || 'Unknown';
        const count = item?.count ?? 0;
        const meta = getCardMeta(statusName);

        // Active tab highlighting logic
        const isActive =
          String(selectedStatus).toLowerCase().trim() ===
          String(statusName).toLowerCase().trim();

        return (
          <TouchableOpacity
            key={`${statusName}_${index}`}
            activeOpacity={0.8}
            onPress={() => onStatusPress?.(statusName)}
            style={[styles.statCard, isActive && styles.activeCard]}
          >
            <View style={styles.iconRow}>
              <Icon name={meta.icon} size={24} color={meta.color} />
            </View>

            <Text style={[styles.statCount, isActive && styles.activeText]}>
              {count}
            </Text>

            <Text style={[styles.statTitle, isActive && styles.activeText]}>
              {String(statusName).toUpperCase().replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default LeadStats;
