/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArrowHeader from '../../components/arrowHeader/arrowHeader';
import { getLeadHistory } from '../../api/LeadApiService/LeadApiService';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';

const LeadActivityDetailsScreen = ({ route }) => {
  const { leadId, title, phone } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedItems, setExpandedItems] = useState({});
  const [exporting, setExporting] = useState(false);

  const allActivitiesRef = useRef([]);

  useEffect(() => {
    if (leadId) {
      getActivities(1, false, false);
    }
  }, [leadId]);

  const getActivities = async (
    pageNumber = 1,
    isRefreshing = false,
    isLoadMore = false,
  ) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await getLeadHistory(leadId, pageNumber);
      console.log('response', res);
      const responseData = res?.data?.data || res?.data || {};
      const targetHistories = responseData.histories || [];
      const totalPagesCount = responseData.totalPages || 1;

      if (pageNumber === 1) {
        setActivities(targetHistories);
        allActivitiesRef.current = targetHistories;
      } else {
        setActivities(prev => {
          const updated = [...prev, ...targetHistories];
          allActivitiesRef.current = updated;
          return updated;
        });
      }

      setPage(pageNumber);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.log('HISTORY ERROR =>', error?.response?.data || error);
      if (pageNumber === 1) {
        setActivities([]);
        allActivitiesRef.current = [];
      }
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    getActivities(1, true, false);
  }, [leadId]);

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      getActivities(page + 1, false, true);
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ' • ' +
      date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    );
  };

  const formatDateOnly = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = status => {
    const map = {
      New: '#4299E1',
      Contacted: '#ED8936',
      Qualified: '#48BB78',
      Lost: '#FC8181',
      Won: '#48BB78',
      'In Progress': '#4299E1',
      Closed: '#A0AEC0',
      Open: '#4299E1',
    };
    return map[status] || '#718096';
  };

  const getInitials = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const toggleExpand = id => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const convertToCSV = data => {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = [
      'S.No',
      'Action',
      'ActionResult',
      'Status',
      'Previous Status',
      'Remark/Comment',
      'Next Action',
      'Follow Up Date',
      'Follow Up Time',
      'Site Visit Date',
      'Performed By',
      'Performed At',
      'Lead Name',
      'Lead Code',
      'Lead Phone',
    ];

    const rows = data.map((item, index) => [
      index + 1,
      item?.action?.title || 'N/A',
      item?.actionResult?.title || 'N/A',
      item?.status?.title || item?.currentStatus || 'N/A',
      item?.prevStatus?.title || 'N/A',
      (item?.remark || item?.comment || 'N/A').replace(/,/g, ';'),
      item?.nextAction?.title || 'N/A',
      item?.followUpDate || 'N/A',
      item?.followUpTime || 'N/A',
      item?.siteVisitDate || 'N/A',
      item?.performedBy?.name || item?.performedBy?.role || 'System',
      formatDate(item?.performedAt || item?.createdAt),
      item?.leadId?.name || 'N/A',
      item?.leadId?.leadCode || 'N/A',
      item?.leadId?.phone || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    // Android 13+ (API 33) doesn't need WRITE_EXTERNAL_STORAGE for Downloads
    if (Platform.Version >= 33) return true;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs storage access to save the CSV report.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  const handleCall = async () => {
    if (!phone) {
      Alert.alert(
        'No Phone Number',
        'Phone number not available for this lead.',
      );
      return;
    }

    const phoneUrl = `tel:${phone}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make a call on this device.');
      }
    } catch (error) {
      console.log('Call error:', error);
      Alert.alert('Error', 'Failed to initiate call.');
    }
  };

  const exportToCSV = async () => {
    try {
      console.log('Exporting started...');
      setExporting(true);

      const dataToExport = allActivitiesRef.current;

      if (!dataToExport || dataToExport.length === 0) {
        Alert.alert('Export Info', 'No activities available to export.');
        setExporting(false);
        return;
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission && Platform.OS === 'android') {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the file.',
        );
        setExporting(false);
        return;
      }

      const csvData = convertToCSV(dataToExport);
      if (!csvData) {
        Alert.alert('Export Error', 'Failed to convert data to CSV format.');
        setExporting(false);
        return;
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      const fileName = `Lead_Activities_${timestamp}.csv`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      await RNFS.writeFile(filePath, csvData, 'utf8');
      console.log('File saved:', filePath);

      const shareOptions = {
        title: 'Lead Activities Report',
        message: 'Here is the lead activities report',
        url: `file://${filePath}`,
        type: 'text/csv',
        mimeType: 'text/csv',
        subject: 'Lead Activities Export',
        // iOS specific
        activityItemSources: [
          {
            placeholderItem: {
              type: 'text/csv',
              content: `file://${filePath}`,
            },
            item: {
              default: { type: 'text/csv', content: `file://${filePath}` },
            },
            subject: { title: 'Lead Activities' },
          },
        ],
      };

      try {
        await Share.open(shareOptions);
        console.log('Share dialog opened successfully');
      } catch (shareError) {
        // User dismissed the share dialog — not a real error, ignore silently
        const msg = shareError?.message || '';
        if (
          msg.includes('User did not share') ||
          msg.includes('userDidNotShare') ||
          msg.includes('dismissed') ||
          shareError?.error === 'User did not share'
        ) {
          // File is already saved to Downloads — just let the user know
          Alert.alert(
            'File Saved',
            `Report saved to Downloads folder:\n${fileName}`,
            [{ text: 'OK' }],
          );
          return;
        }

        // Real share failure — try FileViewer as fallback
        try {
          await FileViewer.open(filePath, { showOpenWithDialog: true });
        } catch (fileViewerError) {
          Alert.alert(
            'File Saved',
            `File saved to Downloads:\n${fileName}\n\nInstall Google Sheets or Microsoft Excel to open CSV files.`,
            [{ text: 'OK' }],
          );
        }
      }
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Export Failed', error.message || 'Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedItems[item._id] || false;
    const statusColor = getStatusColor(
      item?.status?.title || item?.currentStatus,
    );
    const prevStatusColor = getStatusColor(item?.prevStatus?.title);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          {/* Summary Section */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleExpand(item._id)}
            style={styles.summaryTouch}
          >
            <View style={styles.headerRow}>
              <View style={styles.actionContainer}>
                <Text style={styles.actionTitle}>
                  {item?.action?.title || 'No Action'}
                </Text>
                {item?.actionResult?.title && (
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>
                      {item.actionResult.title}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={14} color="#A0AEC0" />
                <Text style={styles.dateText}>
                  {formatDate(item?.performedAt || item?.createdAt)}
                </Text>
              </View>
            </View>

            {/* Status – highlighted */}
            <View style={styles.statusRow}>
              <View style={styles.statusChip}>
                <Text style={styles.statusLabel}>Status</Text>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: statusColor + '20' },
                  ]}
                >
                  <Text style={[styles.statusValue, { color: statusColor }]}>
                    {item?.status?.title || item?.currentStatus || 'N/A'}
                  </Text>
                </View>
              </View>
              {item?.prevStatus?.title && (
                <View style={styles.statusChip}>
                  <Text style={styles.statusLabel}>Previous</Text>
                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: prevStatusColor + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusValue, { color: prevStatusColor }]}
                    >
                      {item.prevStatus.title}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.expandIcon}>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#4299E1"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Expanded Details */}
          {isExpanded && (
            <View style={styles.expandedContainer}>
              {/* Remark / Comment */}
              {(item?.remark || item?.comment) && (
                <View style={styles.commentBox}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color="#4299E1"
                  />
                  <Text style={styles.commentText}>
                    {item?.remark || item?.comment}
                  </Text>
                </View>
              )}

              {/* Next Schedule */}
              {item?.nextAction?.title && (
                <View style={styles.nextBox}>
                  <View style={styles.nextHeader}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#2B6CB0"
                    />
                    <Text style={styles.nextLabel}>Next Scheduled</Text>
                  </View>
                  <View style={styles.nextDetail}>
                    <Text style={styles.nextActionText}>
                      {item.nextAction.title}
                    </Text>
                    {item?.followUpDate && (
                      <Text style={styles.nextDate}>
                        {formatDateOnly(item.followUpDate)}
                        {item?.followUpTime && ` at ${item.followUpTime}`}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Site Visit Date */}
              {item?.siteVisitDate && (
                <View style={styles.siteVisitBox}>
                  <Ionicons name="location-outline" size={16} color="#805AD5" />
                  <Text style={styles.siteVisitLabel}>Site Visit:</Text>
                  <Text style={styles.siteVisitDate}>
                    {formatDateOnly(item.siteVisitDate)}
                  </Text>
                </View>
              )}

              {/* Previous Action & Result */}
              {item?.prevAction?.title && (
                <View style={styles.prevBox}>
                  <Text style={styles.prevLabel}>Previous Action</Text>
                  <View style={styles.prevContent}>
                    <Text style={styles.prevActionText}>
                      {item.prevAction.title}
                    </Text>
                    {item?.prevActionResult?.title && (
                      <Text style={styles.prevResultText}>
                        → {item.prevActionResult.title}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.userWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(item?.performedBy?.role || 'S')}
                </Text>
              </View>
              <View>
                <Text style={styles.userRole}>
                  {item?.performedBy?.role || 'System'}
                </Text>
              </View>
            </View>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>
                #{item?._id ? item._id.slice(-6) : '------'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4299E1" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ArrowHeader
        title={title || 'Lead History'}
        rightIcon="call"
        rightIcon2="download-outline"
        onRightPress={handleCall}
        onRightPress2={exportToCSV}
      />
      {loading && page === 1 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4299E1" />
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#CBD5E0" />
          <Text style={styles.emptyText}>No history details found</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4299E1']}
              tintColor="#4299E1"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  cardContent: {
    padding: 16,
  },
  summaryTouch: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
  },
  resultBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  resultBadgeText: {
    fontSize: 11,
    color: '#3182CE',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
  },
  expandedContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F7FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  nextBox: {
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginBottom: 10,
  },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nextLabel: {
    fontSize: 12,
    color: '#2B6CB0',
    fontWeight: '600',
  },
  nextDetail: {
    paddingLeft: 22,
  },
  nextActionText: {
    fontSize: 14,
    color: '#1A202C',
    fontWeight: '500',
  },
  nextDate: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  siteVisitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D8FD',
    marginBottom: 10,
  },
  siteVisitLabel: {
    fontSize: 13,
    color: '#805AD5',
    fontWeight: '500',
  },
  siteVisitDate: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  prevBox: {
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginBottom: 10,
  },
  prevLabel: {
    fontSize: 11,
    color: '#FC8181',
    fontWeight: '600',
    marginBottom: 2,
  },
  prevContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  prevActionText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  prevResultText: {
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  userWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4299E1',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4299E1',
  },
  userRole: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
  },
  idBadge: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  idText: {
    fontSize: 11,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
});

export default LeadActivityDetailsScreen;
