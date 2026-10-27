import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LeadStats from '../../../components/LeadDashboard/LeadStats';
import LeadFilter from '../../../components/LeadDashboard/LeadFilter';
import {
  getAllLeads,
  getDashboardStats,
  getPlatforms,
} from '../../../api/LeadApiService/LeadApiService';
import { initiateCallTracking } from '../../../api/CallTrackingService';

// ========== HELPER FUNCTIONS (outside component) ==========
const safeString = value => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

// Premium soft palette: main (header/icons), soft (card bg), border
const STATUS_THEMES = {
  emerald: { main: '#0F9D75', soft: '#F0FBF6', border: '#CDEBDD' },
  blue: { main: '#3B6FE0', soft: '#F1F6FF', border: '#D3E0FA' },
  amber: { main: '#D98A1F', soft: '#FFF9EE', border: '#F5E1BC' },
  rose: { main: '#D94F6A', soft: '#FFF3F5', border: '#F6D3DA' },
  violet: { main: '#7A5AE0', soft: '#F6F3FF', border: '#E0D8F8' },
  teal: { main: '#1B9CB0', soft: '#F0FAFC', border: '#CBE9EF' },
  slate: { main: '#5B6B82', soft: '#F6F8FB', border: '#DEE4EC' },
  pink: { main: '#CC4A94', soft: '#FFF3FA', border: '#F5D3E8' },
  indigo: { main: '#4F55D6', soft: '#F3F4FF', border: '#D9DBF8' },
};

const getStatusTheme = status => {
  if (!status) return STATUS_THEMES.slate;
  const s = String(status).toLowerCase().trim();

  if (s === 'fresh' || s === 'fresh lead' || s === 'new')
    return STATUS_THEMES.emerald;
  if (s === 'open' || s === 'interested' || s === 'inquiry')
    return STATUS_THEMES.blue;
  if (s.includes('follow') || s.includes('followup') || s === 'pending')
    return STATUS_THEMES.amber;
  if (s === 'not interested' || s === 'rejected' || s === 'closed')
    return STATUS_THEMES.rose;
  if (s === 'qualified' || s === 'hot lead') return STATUS_THEMES.violet;
  if (
    s.includes('meeting') ||
    s.includes('schedule') ||
    s.includes('visit') ||
    s.includes('call')
  )
    return STATUS_THEMES.teal;
  if (s === 'scraped' || s === 'prospect') return STATUS_THEMES.slate;
  if (s === 'negotiation' || s === 'in negotiation') return STATUS_THEMES.pink;
  if (s === 'in progress' || s === 'contacted') return STATUS_THEMES.indigo;
  return STATUS_THEMES.slate;
};

const formatDate = date => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
};

// Handles both "HH:mm" strings and full date/ISO values
const formatTime = timeString => {
  if (!timeString) return 'N/A';
  try {
    let date;
    const isPlainTime =
      typeof timeString === 'string' && /^\d{1,2}:\d{2}/.test(timeString);

    if (isPlainTime) {
      const [hours, minutes] = timeString.split(':');
      date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
    } else {
      date = new Date(timeString);
      if (isNaN(date.getTime())) return 'N/A';
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

// ========== SKELETON LOADER ==========
const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonLineShort} />
    <View style={styles.skeletonLineLong} />
    <View style={styles.skeletonLineMedium} />
  </View>
);

// ========== LEAD CARD (outside AdminDashboard so state is not reset) ==========
const LeadCard = React.memo(({ item, index, onOpenMenu, onMakeCall, onOpenWhatsApp, onSendEmail }) => {
  const [expanded, setExpanded] = useState(false);

  // ✅ ALL DATA FROM ITEM - NO DUMMY VALUES
  const name = item.name || item.Name;
  const leadCode = item.leadCode || item.LeadCode;
  const platform =
    typeof item.platform === 'object'
      ? item.platform?.title || item.platform?.PlatformName
      : item.platform;
  const createdAt = item.createdAt || item.leadDate;
  const assignedTo =
    typeof item.assignTo === 'object'
      ? item.assignTo?.name || item.assignTo?.email
      : item.assignTo;
  const updatedAt = item.updatedAt || item.createdAt;
  const followUpTime = item.followUpTime;
  const action =
    typeof item.action === 'object'
      ? item.action?.title || item.action?.name
      : item.action;
  const remark = item.remark || item.Remark || item.query;
  const phone = item.phone || item.Phone;
  const currentStatus = item.currentStatus || item.status;
  const email = item.email || item.Email;

  const t = getStatusTheme(currentStatus);
  const c = t.main;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.soft, borderColor: t.border, shadowColor: c },
      ]}
    >
      {/* HEADER - solid status color */}
      <View style={[styles.cardHeader, { backgroundColor: c }]}>
        <View style={styles.headerContent}>
          <View style={styles.nameContainer}>
            <View style={styles.avatarContainer}>
              <Text style={[styles.avatarText, { color: c }]}>
                {String(name).charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nameText} numberOfLines={1}>
                {safeString(name)}
              </Text>
              <Text style={styles.platformText}>
                <Ionicons name="globe-outline" size={12} color="#FFFFFFCC" />{' '}
                {safeString(platform)} • {safeString(leadCode)}
              </Text>
            </View>
          </View>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
            <Text style={styles.timeText}>{formatTime(createdAt)}</Text>
          </View>
        </View>

        <View style={styles.headerStatusPill}>
          <View style={[styles.statusDot, { backgroundColor: c }]} />
          <Text style={[styles.statusText, { color: c }]}>
            {safeString(currentStatus).replace(/_/g, ' ')}
          </Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.cardBody}>
        {/* Assigned */}
        <View style={[styles.infoBlock, { borderColor: t.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle-outline" size={18} color={c} />
            <Text style={styles.assignedLabel}>Assigned to:</Text>
            <Text style={styles.assignedName} numberOfLines={1}>
              {safeString(assignedTo)}
            </Text>
          </View>
          <View style={styles.infoSubRow}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.assignedDateTime}>
              {formatDate(updatedAt)}
              {followUpTime ? ` at ${formatTime(followUpTime)}` : ''}
            </Text>
          </View>
        </View>

        {/* Last action */}
        <View style={[styles.infoBlock, { borderColor: t.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="flash-outline" size={16} color={c} />
            <Text style={styles.actionLabel}>Last Action:</Text>
            <Text style={styles.actionText} numberOfLines={1}>
              {safeString(action)}
            </Text>
          </View>
        </View>

        {/* Remark */}
        <TouchableOpacity
          style={[styles.infoBlock, { borderColor: t.border }]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <View style={styles.remarkHeader}>
            <View style={styles.remarkTitleContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={c} />
              <Text style={styles.remarkLabel}>Remark</Text>
            </View>
            <Ionicons
              name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'}
              size={22}
              color={c}
            />
          </View>
          <Text
            style={[styles.remarkText, expanded && styles.remarkTextExpanded]}
            numberOfLines={expanded ? undefined : 2}
          >
            {safeString(remark)}
          </Text>
        </TouchableOpacity>

        {/* Contact */}
        <View style={styles.contactContainer}>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={16} color={c} />
            <Text style={styles.phoneText}>{safeString(phone)}</Text>
          </View>
          <View style={styles.contactIcons}>
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: t.border }]}
              onPress={() => onMakeCall?.(phone, item._id)}
            >
              <Ionicons name="call" size={20} color={c} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: t.border }]}
              onPress={() => onOpenWhatsApp?.(phone)}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
            {email && email !== '-' && (
              <TouchableOpacity
                style={[styles.iconButton, { borderColor: t.border }]}
                onPress={() => onSendEmail?.(email)}
              >
                <Ionicons name="mail-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuButtonSmall}
              onPress={() => onOpenMenu(item)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

// ========== MAIN SCREEN ==========
const AdminDashboard = () => {
  const navigation = useNavigation();

  // ---------- STATE ----------
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic stats state
  const [dashboardStats, setDashboardStats] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // ---------- MODAL STATE ----------
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [queryModalVisible, setQueryModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [lastCalledLeadId, setLastCalledLeadId] = useState(null);
  const [lastCallTime, setLastCallTime] = useState(null); // Track when call was made

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ---------- FILTER STATE ----------
  const [filters, setFilters] = useState({
    searchText: '',
    platform: null,
    staff: null,
    status: null,
    currentStatus: '',
    phone: '',
    dashboardStatus: 'All',
    sortBy: '',
  });

  const loadingRef = useRef(false);
  const isMounted = useRef(true);
  const hasMoreData = useRef(true);

  // ---------- CONTACT FUNCTIONS ----------
  const makePhoneCall = async (phoneNumber, leadId = null) => {
    console.log('📞 makePhoneCall called with:', { phoneNumber, leadId, leadIdType: typeof leadId });
    console.log('📞 leadId is:', leadId);
    
    if (!phoneNumber || phoneNumber === '-') {
      Toast.show({
        type: 'error',
        text1: 'Phone Number Not Available',
      });
      return;
    }

    try {
      // ✅ INITIATE backend call tracking BEFORE opening dialer
      if (leadId) {
        console.log('🔴 Calling backend for lead:', leadId, 'Type:', typeof leadId);
        
        try {
          // Use the imported function
          const callData = await initiateCallTracking(leadId);
          console.log('✅ Backend response:', callData);
          
          if (callData?.sessionId) {
            setLastCalledLeadId(leadId);
            setLastCallTime(Date.now());
            
            Toast.show({
              type: 'success',
              text1: 'Call initiated ✅',
              text2: 'Backend tracking started',
            });
          }
        } catch (err) {
          console.error('❌ Backend error:', err?.message || err);
          // Continue with call even if tracking fails
          Toast.show({
            type: 'warning',
            text1: 'Call Tracking Issue',
            text2: 'Proceeding with call',
          });
        }
      } else {
        console.log('⚠️ No leadId provided to makePhoneCall');
      }
      
      // Open phone dialer
      console.log('📲 Opening dialer for number:', phoneNumber);
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.error('❌ Error:', error?.message);
      Toast.show({
        type: 'error',
        text1: 'Unable to Make Call',
      });
    }
  };

  const openWhatsApp = phoneNumber => {
    if (!phoneNumber || phoneNumber === '-') {
      Alert.alert('Error', 'No phone number available');
      return;
    }
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          const webUrl = `https://wa.me/${cleanNumber}`;
          Linking.openURL(webUrl).catch(() => {
            Alert.alert('Error', 'WhatsApp is not installed on this device');
          });
        }
      })
      .catch(err => {
        console.error('WhatsApp error:', err);
        Alert.alert('Error', 'Failed to open WhatsApp');
      });
  };

  const sendEmail = async email => {
    if (!email || email === '-') {
      Toast.show({
        type: 'error',
        text1: 'Email Not Available',
      });
      return;
    }

    const subject = 'Inquiry regarding your lead';
    const body = 'Hello, I am reaching out regarding your inquiry.';

    try {
      await Linking.openURL(
        `mailto:${email}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(body)}`,
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unable to Open Email',
      });
    }
  };

  // ---------- FETCH LEADS ----------
  const fetchLeadsFromAPI = useCallback(
    async (params = {}, isLoadMore = false, isRefresh = false) => {
      try {
        if (isLoadMore) {
          if (loadingRef.current || !hasMoreData.current) return;
          loadingRef.current = true;
          setMoreLoading(true);
        } else if (isRefresh) {
          // Pull-to-refresh: spinner already showing via refreshing state
          // Don't set loading=true (avoids skeleton + spinner overlap)
          loadingRef.current = true;
        } else {
          setLoading(true);
          hasMoreData.current = true;
        }

        const currentPage = params.page || 1;
        const currentLimit = params.limit || 10;

        const query = {
          page: currentPage,
          limit: currentLimit,
          isPagination: true,
          search: (params.search ?? filters.searchText) || '',
          platformId: (params.platform ?? filters.platform) || '', // ✅ FIXED: was 'platform'
          currentStatus: (params.status ?? filters.status) || '',
          assignTo: (params.staff ?? filters.staff) || '',
          phone: (params.phone ?? filters.phone) || '',
          assigned: 'all',
        };

        if (params.dashboardStatus) {
          query.dashboardStatus = params.dashboardStatus;
        } else if (filters.dashboardStatus) {
          query.dashboardStatus = filters.dashboardStatus;
        }

        if (params.currentStatus !== undefined) {
          query.currentStatus = params.currentStatus;
        } else if (filters.currentStatus) {
          query.currentStatus = filters.currentStatus;
        }

        if (params.sortBy) {
          query.sortBy = params.sortBy;
        }

        console.log('📡 Fetching leads:', query);

        const response = await getAllLeads(query);

        if (!isMounted.current) return;

        if (response?.data?.success || response?.data?.statusCode < 400) {
          const data = response.data.data;
          console.log('data of leads-=====', data);
          const incomingLeads = data.leads || [];

          if (currentPage === 1) {
            setLeads(incomingLeads);
            setFilteredLeads(incomingLeads);
          } else {
            setLeads(prev => {
              const merged = [...prev, ...incomingLeads];
              return merged.filter(
                (item, index, self) =>
                  index === self.findIndex(x => x._id === item._id),
              );
            });
            setFilteredLeads(prev => {
              const merged = [...prev, ...incomingLeads];
              return merged.filter(
                (item, index, self) =>
                  index === self.findIndex(x => x._id === item._id),
              );
            });
          }

          const totalPages = data.totalPages || 1;
          setPagination({
            page: data.currentPage || currentPage,
            limit: currentLimit,
            total: data.totalLeads || 0,
            totalPages: totalPages,
          });

          // ✅ FIXED: Use response data directly to avoid race condition
          hasMoreData.current = currentPage < totalPages;
        } else {
          if (isMounted.current) {
            Alert.alert(
              'Error',
              response?.data?.message || 'Failed to fetch leads',
            );
          }
        }
      } catch (error) {
        if (!isMounted.current) return;
        console.log('❌ Fetch Leads Error:', error);
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            error.message ||
            'Failed to fetch leads',
        );
      } finally {
        if (isMounted.current) {
          loadingRef.current = false;
          setLoading(false);
          setMoreLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filters],
  );

  // ---------- FETCH STATS ----------
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await getDashboardStats();
      console.log('📊 Stats received:', response?.data);

      if (!isMounted.current) return;

      if (response?.data?.success) {
        const statsData = response.data.data || [];
        setDashboardStats(statsData);
      } else {
        setDashboardStats([]);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.log('❌ Stats Error:', error);
      setDashboardStats([]);
    }
  }, []);

  // ---------- LOAD INITIAL DATA ----------
  useEffect(() => {
    isMounted.current = true;

    const loadInitialData = async () => {
      await fetchDashboardStats();
      await fetchLeadsFromAPI({ page: 1 });
    };

    loadInitialData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ---------- PULL TO REFRESH ----------
  const onRefresh = useCallback(() => {
    if (loadingRef.current) return; // prevent double trigger
    setRefreshing(true);
    hasMoreData.current = true;
    // reset filters & status to default on refresh
    setSelectedStatus('All');
    setFilters(prev => ({
      ...prev,
      dashboardStatus: 'All',
      currentStatus: '',
      sortBy: '',
    }));
    fetchDashboardStats();
    fetchLeadsFromAPI(
      { page: 1, dashboardStatus: 'All', currentStatus: '' },
      false,
      true,
    );
  }, [fetchDashboardStats, fetchLeadsFromAPI]);

  // ---------- HANDLE FILTER ----------
  const handleFilter = useCallback(
    payload => {
      setFilters(prev => ({
        ...prev,
        searchText: payload.searchText || '',
        platform: payload.platform || null,
        staff: payload.staff || null,
        status: payload.status || null,
        currentStatus: payload.status || '',
        dashboardStatus: 'All',
        phone: payload.phone || '',
        sortBy: '',
      }));
      setPagination(prev => ({ ...prev, page: 1 }));
      hasMoreData.current = true;
      fetchLeadsFromAPI({
        page: 1,
        search: payload.searchText,
        platform: payload.platform,
        staff: payload.staff,
        status: payload.status,
        currentStatus: payload.status || '',
        dashboardStatus: 'All',
        phone: payload.phone,
        sortBy: '',
      });
    },
    [fetchLeadsFromAPI],
  );

  // ---------- HANDLE STATUS CARD PRESS ----------
  const handleStatusPress = useCallback(
    filterKey => {
      setSelectedStatus(filterKey);

      let newCurrentStatus = '';
      let newDashboardStatus = 'All';
      let newSortBy = '';

      const cleanedKey = String(filterKey).toLowerCase().trim();

      if (cleanedKey === 'recent') {
        newDashboardStatus = 'Recent';
        newSortBy = 'recent';
      } else if (cleanedKey === 'all') {
        newDashboardStatus = 'All';
        newSortBy = '';
      } else if (cleanedKey === 'follow up' || cleanedKey === 'followup') {
        newDashboardStatus = 'Follow Up';
        newSortBy = '';
      } else if (cleanedKey === 'pending') {
        newDashboardStatus = 'Pending';
        newSortBy = '';
      } else if (cleanedKey === 'fresh') {
        newDashboardStatus = 'Fresh';
        newSortBy = '';
      } else {
        // Non-special statuses (e.g. Qualified, Interested) — use dashboardStatus
        // so backend's LeadStatus title lookup (else branch in getAllLeads) kicks in.
        // Do NOT use currentStatus here — that's a different free-text field on the lead.
        newDashboardStatus = filterKey;
        newCurrentStatus = '';
        newSortBy = '';
      }

      const updatedFilters = {
        ...filters,
        currentStatus: newCurrentStatus,
        dashboardStatus: newDashboardStatus,
        sortBy: newSortBy,
      };

      setFilters(updatedFilters);
      hasMoreData.current = true;

      fetchLeadsFromAPI({
        page: 1,
        search: updatedFilters.searchText,
        platform: updatedFilters.platform,
        staff: updatedFilters.staff,
        status: updatedFilters.status,
        currentStatus: newCurrentStatus, // use the resolved value, not updatedFilters.status
        phone: updatedFilters.phone,
        dashboardStatus: updatedFilters.dashboardStatus,
        sortBy: updatedFilters.sortBy,
      });
    },
    [filters, fetchLeadsFromAPI],
  );

  // ---------- LOAD MORE ----------
  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || moreLoading || !hasMoreData.current) return;
    if (pagination.page >= pagination.totalPages) return;

    const nextPage = pagination.page + 1;
    console.log('🔄 Loading page:', nextPage);

    fetchLeadsFromAPI(
      {
        page: nextPage,
        limit: pagination.limit,
        search: filters.searchText,
        platform: filters.platform,
        staff: filters.staff,
        status: filters.status,
        currentStatus: filters.status,
        dashboardStatus: filters.dashboardStatus,
        sortBy: filters.sortBy,
      },
      true,
    );
  }, [pagination, filters, moreLoading, fetchLeadsFromAPI]);

  // ---------- MENU HANDLERS ----------
  const openMenu = useCallback(item => {
    setSelectedItem(item);
    setMenuVisible(true);
  }, []);

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedItem(null);
  };

  const handleMenuOption = (option, callMade = false) => {
    if (!selectedItem) return;

    switch (option) {
      case 'query':
        closeMenu();
        setSelectedDescription(
          selectedItem.remark ||
            selectedItem.Remark ||
            selectedItem.Query ||
            selectedItem.query ||
            'No Description',
        );
        setQueryModalVisible(true);
        break;

      case 'activity':
        closeMenu();
        navigation.navigate('LeadActivityDetails', {
          leadId: selectedItem._id,
          title: 'Last Activity',
          leadData: selectedItem,
        });
        break;

      case 'action':
        closeMenu();
        // Check if the user just called this lead from the dashboard
        // Also check if 10 seconds have passed since the call
        const wasJustCalled = lastCalledLeadId === selectedItem._id;
        const callPassed10Seconds = lastCallTime && (Date.now() - lastCallTime) >= 10000;
        
        navigation.navigate('LeadActionScreen', {
          leadData: selectedItem,
          leadId: selectedItem._id,
          callMade: (callPassed10Seconds && wasJustCalled),
          callTime: wasJustCalled ? lastCallTime : null,
        });
        break;

      default:
        closeMenu();
        break;
    }
  };

  return (
    <>
      <FlatList
        data={filteredLeads}
        keyExtractor={(item, index) =>
          item?._id ? `${item._id}_${index}` : `lead_${index}`
        }
        renderItem={({ item, index }) => (
          <LeadCard 
            item={item} 
            index={index} 
            onOpenMenu={openMenu} 
            onMakeCall={makePhoneCall}
            onOpenWhatsApp={openWhatsApp}
            onSendEmail={sendEmail}
          />
        )}
        ListHeaderComponent={
          <>
            <LeadFilter
              leads={leads}
              onApplyFilter={handleFilter}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />

            <LeadStats
              stats={dashboardStats}
              onStatusPress={handleStatusPress}
              selectedStatus={selectedStatus}
            />

            {loading && (
              <View style={styles.skeletonContainer}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No leads found</Text>
              <Text style={styles.emptySubText}>
                Pull to refresh or change filters
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListFooterComponent={() => {
          if (!hasMoreData.current) {
            return (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                  No More Data
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              onPress={handleLoadMore}
              disabled={moreLoading}
              style={styles.loadMoreBtn}
            >
              {moreLoading ? (
                <ActivityIndicator color="#4F46E5" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={10}
      />

      {/* ========== MENU MODAL ========== */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('query')}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color="#1E293B"
              />
              <Text style={styles.menuItemText}>View Query</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('activity')}
            >
              <Ionicons name="time-outline" size={20} color="#1E293B" />
              <Text style={styles.menuItemText}>View Activity</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('action')}
            >
              <Ionicons name="call-outline" size={20} color="#1E293B" />
              <Text style={styles.menuItemText}>Update Action</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========== QUERY MODAL ========== */}
      <Modal
        visible={queryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQueryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setQueryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#4F46E5" />
              <Text style={styles.modalTitle}>Client Query</Text>
            </View>
            <Text style={styles.modalText}>
              {selectedDescription || 'No query available'}
            </Text>
            <TouchableOpacity
              onPress={() => setQueryModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  contentContainer: { paddingHorizontal: 16, paddingBottom: 10 },
  skeletonContainer: { paddingVertical: 8 },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skeletonLineShort: {
    width: '40%',
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLineLong: {
    width: '90%',
    height: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineMedium: {
    width: '60%',
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 12,
  },
  emptySubText: { fontSize: 14, color: '#CBD5E1', marginTop: 4 },

  // ----- Card -----
  card: {
    borderRadius: 18,
    marginBottom: 14,
    marginTop: 6,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '800' },
  nameText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  platformText: { fontSize: 12, color: '#FFFFFFD9', marginTop: 2 },
  dateTimeContainer: { alignItems: 'flex-end', marginLeft: 8 },
  dateText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  timeText: { fontSize: 11, color: '#FFFFFFB3', marginTop: 2 },
  headerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardBody: { padding: 12 },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 2,
  },
  assignedLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    marginRight: 4,
  },
  assignedName: { fontSize: 14, fontWeight: '600', color: '#0F172A', flex: 1 },
  assignedDateTime: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  actionLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    marginRight: 4,
  },
  actionText: { fontSize: 13, fontWeight: '600', color: '#0F172A', flex: 1 },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  remarkTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remarkLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 6,
  },
  remarkText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    paddingRight: 4,
  },
  remarkTextExpanded: {
    lineHeight: 22,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginLeft: 8,
  },
  contactIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginLeft: 6,
    borderWidth: 1,
  },
  menuButtonSmall: {
    padding: 8,
    borderRadius: 10,
    marginLeft: 6,
  },

  // ----- Menu & Modal -----
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 14,
    fontWeight: '500',
  },
  menuDivider: { height: 1, backgroundColor: '#F0F2F5', marginHorizontal: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
  },
  modalText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  loadMoreBtn: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 20,
    minWidth: 160,
    alignItems: 'center',
  },
  loadMoreText: { color: '#4F46E5', fontSize: 15, fontWeight: '700' },
});

export default AdminDashboard;