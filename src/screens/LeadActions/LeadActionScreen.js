/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ArrowHeader from '../../components/arrowHeader/arrowHeader';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hp, wp } from '../../utilies/Functon/Responsive';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

import {
  getLeadActions,
  getLeadActionResults,
  getLeadStatuses,
  saveLeadAction,
} from '../../api/LeadApiService/LeadApiService';

import {
  initiateCallTracking,
  verifyCallTracking,
  checkInitiatedCall,
} from '../../api/CallTrackingService';

// ─── Skeleton shimmer block ───────────────────────────────────────────────────
const SkeletonBox = ({ height = hp(6) }) => (
  <View
    style={{
      width: '100%',
      height,
      borderRadius: 12,
      backgroundColor: '#E8EDF2',
      marginBottom: hp(1.5),
    }}
  />
);

// ─── Inline spinner shown inside a dropdown slot while next options load ──────
const DropdownLoader = ({ label }) => (
  <View style={styles.dropdownLoaderWrap}>
    <ActivityIndicator size="small" color="#6C7BF2" />
    <Text style={styles.dropdownLoaderText}>Loading {label}…</Text>
  </View>
);

const LeadActionScreen = ({ route }) => {
  const { leadData, callMade: initialCallMade, callTime } = route.params || {};
  const navigation = useNavigation();

  // Master Dropdown States
  const [actions, setActions] = useState([]);
  const [actionResults, setActionResults] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [showSiteVisitDate, setShowSiteVisitDate] = useState(false);

  // Per-step loading flags
  const [loadingActions, setLoadingActions] = useState(true); // initial page load
  const [loadingResults, setLoadingResults] = useState(false); // after action picked
  const [loadingStatuses, setLoadingStatuses] = useState(false); // after result picked

  // Selected Values States
  const [showSiteVisitPicker, setShowSiteVisitPicker] = useState(false);
  const [action, setAction] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [description, setDescription] = useState('');
  const [siteVisitDate, setSiteVisitDate] = useState(null);

  // Date & Time Picker States
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 3);
  const [date, setDate] = useState(defaultDate);

  const defaultTime = new Date();
  defaultTime.setHours(23);
  defaultTime.setMinutes(0);
  const [time, setTime] = useState(defaultTime);

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const [callMade, setCallMade] = useState(initialCallMade || false); // Track if call was made
  
  // Call timer state (PRODUCTION: Backend-driven)
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimeRemaining, setCallTimeRemaining] = useState(10);
  const [callSessionId, setCallSessionId] = useState(null); // Backend session ID
  const [isVerifying, setIsVerifying] = useState(false); // Verification in progress
  const callTimerRef = useRef(null);
  const immediateIntervalRef = useRef(null);

  // Communications
  const openEmail = async () => {
    const email = leadData?.email;
    if (!email) {
      Toast.show({ type: 'error', text1: 'Email Not Available' });
      return;
    }
    try {
      await Linking.openURL(`mailto:${email}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to Open Email' });
    }
  };

  const openWhatsApp = async () => {
    const phone = leadData?.phone;
    if (!phone) {
      Toast.show({ type: 'error', text1: 'Phone Number Not Available' });
      return;
    }
    try {
      await Linking.openURL(`https://wa.me/91${phone}`);
    } catch {
      Toast.show({ type: 'error', text1: 'Unable to Open WhatsApp' });
    }
  };

  const makeCall = async () => {
    const phone = leadData?.phone;
    if (!phone) {
      Toast.show({ type: 'error', text1: 'Phone Number Not Available' });
      return;
    }
    
    try {
      // 1️⃣ INITIATE backend tracking
      Toast.show({ 
        type: 'info', 
        text1: 'Starting call verification...'
      });

      const callData = await initiateCallTracking(leadData?._id);
      
      if (!callData?.sessionId) {
        throw new Error('Failed to initiate call tracking');
      }

      setCallSessionId(callData.sessionId);
      setIsCallActive(true);
      setCallTimeRemaining(10);
      
      // 2️⃣ Start UI countdown
      let timeLeft = 10;
      immediateIntervalRef.current = setInterval(() => {
        timeLeft--;
        setCallTimeRemaining(timeLeft);
        
        if (timeLeft <= 0) {
          setIsCallActive(false);
          clearInterval(immediateIntervalRef.current);
          Toast.show({
            type: 'success',
            text1: '✅ 10 seconds complete!',
            text2: 'You can now save the lead action',
          });
        }
      }, 1000);
      
      Toast.show({ 
        type: 'info', 
        text1: 'Call timer started!',
        text2: 'Wait 10 seconds to save'
      });
      
      // 3️⃣ Open phone dialer
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      console.error('❌ Call tracking error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Call Error',
        text2: error?.response?.data?.message || 'Unable to start call verification'
      });
      setIsCallActive(false);
      if (immediateIntervalRef.current) {
        clearInterval(immediateIntervalRef.current);
      }
    }
  };

  // Status Title Verification Logic for Meeting/Visit Date
  const shouldShowSiteVisitDate = (statusTitle = '') => {
    const title = statusTitle.toLowerCase().trim();
    return (
      title === 'on call meeting scheduled' ||
      title === 'online meeting scheduled' ||
      title === 'client visit (scheduled)' ||
      title === 'executive visit (scheduled)' ||
      title.includes('meeting') ||
      title.includes('visit')
    );
  };

  const formatDate = date => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = date => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDateUI = date => {
    if (!date) return 'Select Date';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (immediateIntervalRef.current) {
        clearInterval(immediateIntervalRef.current);
      }
    };
  }, []);

  // Initial Data Load
  useEffect(() => {
    loadMasterActions();
    checkPreviousInitiatedCall(); // Check if call already initiated
  }, []);

  // Handle dashboard call time countdown
  useEffect(() => {
    if (callTime && !initialCallMade) {
      const elapsedMs = Date.now() - callTime;
      const remainingMs = 10000 - elapsedMs; // Changed to 10 seconds
      
      if (remainingMs > 0) {
        setIsCallActive(true);
        setCallTimeRemaining(Math.ceil(remainingMs / 1000));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Call timer countdown (for dashboard call time continuation only)
  useEffect(() => {
    if (!isCallActive) return;

    // Only use this effect if timer didn't already start in makeCall
    // (i.e., when coming from dashboard with callTime param)
    if (callTime && callTimeRemaining > 0 && callTimeRemaining <= 10) {
      let isMounted = true;

      callTimerRef.current = setInterval(() => {
        if (!isMounted) return;
        
        setCallTimeRemaining(prev => {
          if (prev <= 1) {
            if (isMounted) {
              setCallMade(true);
              setIsCallActive(false);
              Toast.show({
                type: 'success',
                text1: '✅ Call verified!',
                text2: 'Status update enabled. You can now save.',
              });
            }
            clearInterval(callTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        isMounted = false;
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCallActive, callTime]);

  const loadMasterActions = async () => {
    try {
      setLoadingActions(true);
      const actionRes = await getLeadActions();
      const actionData = actionRes?.data?.data?.data || [];
      setActions(
        actionData.map(item => ({ label: item.title, value: item._id })),
      );
    } catch (error) {
      console.log('LOAD ACTIONS ERROR =>', error?.response?.data || error);
    } finally {
      setLoadingActions(false);
    }
  };

  // Check if this lead has previous INITIATED call (within 5 minutes)
  const checkPreviousInitiatedCall = async () => {
    try {
      console.log('🔍 Checking for previous initiated call on lead:', leadData?._id);
      
      const result = await checkInitiatedCall(leadData?._id);
      
      if (result?.found && result?.sessionId) {
        console.log('✅ Found previous initiated call! SessionId:', result.sessionId);
        setCallSessionId(result.sessionId);
        setCallMade(true);
        
        Toast.show({
          type: 'success',
          text1: '✅ Previous call found',
          text2: 'You can save your action without calling again',
          position: 'top',
        });
      } else {
        console.log('⚠️ No previous initiated call found');
      }
    } catch (error) {
      console.log('⚠️ Error checking initiated call:', error?.message);
      // Don't show error toast - it's optional
    }
  };

  const handleActionChange = async item => {
    try {
      setAction(item.value);
      setResult(null);
      setStatus(null);
      setActionResults([]);
      setLeadStatuses([]);
      setShowSiteVisitDate(false);
      setLoadingResults(true);

      const res = await getLeadActionResults(item.value);
      console.log('actionresult======', res);
      const resultData = res?.data?.data?.data || [];

      setActionResults(
        resultData.map(resItem => ({
          label: resItem.title || resItem.name,
          value: resItem._id,
        })),
      );
    } catch (error) {
      console.log('ACTION RESULT ERROR =>', error?.response?.data || error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleResultChange = async item => {
    try {
      setResult(item.value);
      setStatus(null);
      setLeadStatuses([]);
      setShowSiteVisitDate(false);
      setLoadingStatuses(true);

      const res = await getLeadStatuses(item.value);
      console.log('getLeadStatuses======', res);

      const statusData = res?.data?.data?.data || [];
      const formattedStatuses = statusData.map(statusItem => ({
        label: statusItem.title,
        value: statusItem._id,
      }));

      setLeadStatuses(formattedStatuses);

      // CRITICAL LOGIC: If exactly 1 status exists, Auto-Select it!
      if (formattedStatuses.length === 1) {
        const autoStatus = formattedStatuses[0];
        setStatus(autoStatus.value);
        // Meeting/Visit condition check for Auto-selected data
        setShowSiteVisitDate(shouldShowSiteVisitDate(autoStatus.label));
      }
    } catch (error) {
      console.log('STATUS ERROR =>', error?.response?.data || error);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const handleStatusChange = item => {
    setStatus(item.value);
    setShowSiteVisitDate(shouldShowSiteVisitDate(item.label));
  };

  const handleSave = async () => {
    if (!action || !result || !status) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields (*)',
        position: 'top',
      });
      return;
    }

    // ✅ PRODUCTION: Verify with backend
    if (!callSessionId) {
      Toast.show({
        type: 'error',
        text1: 'Call Required',
        text2: 'Please make a call first',
        position: 'top',
      });
      return;
    }

    try {
      setIsVerifying(true);

      // ✅ ALWAYS verify with backend - this is the source of truth
      console.log('🔐 Verifying call with backend for sessionId:', callSessionId);
      const verification = await verifyCallTracking(callSessionId, 10);
      
      if (!verification.verified) {
        console.log('❌ Verification failed:', verification.reason);
        Toast.show({
          type: 'error',
          text1: verification.reason || 'Call not verified',
          text2: `Wait ${verification.remainingSeconds || 0} more seconds`,
          position: 'top',
        });
        setIsVerifying(false);
        return;
      }

      // ✅ Call verified by backend! Proceed with save
      console.log('✅ Call verified! Duration:', verification.callDuration, 'seconds');
      setLoading(true);
      const payload = {
        action,
        actionResult: result,
        status,
        currentStatus: leadStatuses.find(x => x.value === status)?.label || '',
        nextAction,
        siteVisitDate: siteVisitDate ? formatDate(siteVisitDate) : null,
        followUpDate: formatDate(date),
        followUpTime: formatTime(time),
        remark: description?.trim() || '',
        comment: description?.trim() || '',
        callSessionId, // Send session ID for backend logging
      };

      const res = await saveLeadAction(leadData?._id, payload);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res?.data?.message || 'Lead Updated Successfully',
        position: 'top',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.log('SAVE ERROR =>', error?.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to save lead action',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ArrowHeader
        title="Lead Action"
        rightIcon="call-outline"
        onRightPress={makeCall}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dynamic Inputs Section */}
        <View style={styles.card}>
          <View style={styles.row}>
            {/* Action Dropdown */}
            <View style={styles.half}>
              <Text style={styles.label}>ACTION *</Text>
              {loadingActions ? (
                <SkeletonBox />
              ) : (
                <Dropdown
                  style={styles.dropdown}
                  data={actions}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Action"
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  value={action}
                  onChange={handleActionChange}
                  containerStyle={styles.dropdownContainer}
                  renderItem={item => (
                    <View style={styles.dropdownItemView}>
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </View>
                  )}
                />
              )}
            </View>

            {/* Action Result Dropdown */}
            <View style={styles.half}>
              <Text style={styles.label}>ACTION RESULT *</Text>
              {loadingResults ? (
                <DropdownLoader label="results" />
              ) : (
                <Dropdown
                  style={styles.dropdown}
                  data={actionResults}
                  labelField="label"
                  valueField="value"
                  placeholder={action ? 'Select Result' : 'Select Action First'}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  value={result}
                  onChange={handleResultChange}
                  disable={!action}
                  containerStyle={styles.dropdownContainer}
                  renderItem={item => (
                    <View style={styles.dropdownItemView}>
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            {/* Lead Status */}
            <View style={showSiteVisitDate ? styles.half : styles.full}>
              <Text style={styles.label}>LEAD STATUS *</Text>
              {loadingStatuses ? (
                <DropdownLoader label="statuses" />
              ) : (
                <Dropdown
                  style={styles.dropdown}
                  data={leadStatuses}
                  labelField="label"
                  valueField="value"
                  placeholder={result ? 'Select Status' : 'Select Result First'}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  value={status}
                  onChange={handleStatusChange}
                  disable={!result}
                  containerStyle={styles.dropdownContainer}
                  renderItem={item => (
                    <View style={styles.dropdownItemView}>
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </View>
                  )}
                />
              )}
            </View>

            {/* Site Visit Date Section */}
            {showSiteVisitDate && (
              <View style={styles.half}>
                <Text style={styles.label}>SITE VISIT DATE</Text>
                <TouchableOpacity
                  style={styles.dateTimeInput}
                  onPress={() => setShowSiteVisitPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateTimeText}>
                    {siteVisitDate
                      ? formatDateUI(siteVisitDate)
                      : 'Select Date'}
                  </Text>
                  <Icon name="calendar" size={20} color="#6C7BF2" />
                </TouchableOpacity>

                {showSiteVisitPicker && (
                  <DateTimePicker
                    value={siteVisitDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowSiteVisitPicker(false);
                      if (selectedDate) setSiteVisitDate(selectedDate);
                    }}
                  />
                )}
              </View>
            )}
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={styles.description}
            multiline
            placeholder="Enter detailed description..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Next Schedule Section */}

        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { marginBottom: hp(1.5) }]}>
            Next Schedule
          </Text>

          {/* Action Dropdown */}
          <View style={styles.row}>
            <View style={styles.full}>
              <Dropdown
                style={styles.dropdown}
                data={actions}
                labelField="label"
                valueField="value"
                placeholder="Select action"
                value={nextAction}
                onChange={item => setNextAction(item.value)}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainer}
                renderItem={item => (
                  <View
                    style={{
                      height: 40,
                      justifyContent: 'center',
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#1E293B',
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>

          {/* Date and Time */}
          <View style={styles.row}>
            {/* Date */}
            <View style={styles.half}>
              <Text style={styles.label}>DATE</Text>

              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowDate(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeText}>{date.toDateString()}</Text>

                <Icon name="calendar" size={20} color="#6C7BF2" />
              </TouchableOpacity>

              {showDate && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDate(false);

                    if (event.type === 'set' && selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Time */}
            <View style={styles.half}>
              <Text style={styles.label}>TIME</Text>

              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowTime(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeText}>
                  {time.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>

                <Icon name="clock-outline" size={20} color="#6C7BF2" />
              </TouchableOpacity>

              {showTime && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={(event, selectedTime) => {
                    setShowTime(false);

                    if (event.type === 'set' && selectedTime) {
                      setTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Client Information Card */}
        <View style={styles.clientCard}>
          <View style={styles.cardHeader}>
            <Icon name="account-circle" size={24} color="#6C7BF2" />
            <Text style={styles.cardTitle}>Client Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{leadData?.name || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{leadData?.phone || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{leadData?.email || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned To</Text>
            <Text style={styles.infoValue}>
              {leadData?.assignTo?.name || leadData?.assignTo?.fullName || '-'}
            </Text>
          </View>
        </View>

        {/* Communication Buttons */}
        <View style={styles.actionCard}>
          <TouchableOpacity
            style={styles.whatsappBtn}
            activeOpacity={0.8}
            onPress={openWhatsApp}
          >
            <Icon name="whatsapp" size={28} color="#fff" />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.8}
            onPress={openEmail}
          >
            <Icon name="email-outline" size={28} color="#fff" />
            <Text style={styles.actionBtnText}>Email</Text>
          </TouchableOpacity>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!action || !result || !status || !callSessionId) && { opacity: 0.5 },
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading || isVerifying || !action || !result || !status || !callSessionId}
        >
          {loading || isVerifying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : isCallActive ? (
            <>
              <Icon name="timer" size={22} color="#fff" />
              <Text style={styles.btnText}>Save Changes ({callTimeRemaining}s remaining)</Text>
            </>
          ) : !callSessionId ? (
            <>
              <Icon name="phone-outline" size={22} color="#fff" />
              <Text style={styles.btnText}>Click Call First</Text>
            </>
          ) : (
            <>
              <Icon name="content-save" size={22} color="#fff" />
              <Text style={styles.btnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeadActionScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { flex: 1, paddingHorizontal: wp(4) },
  scrollContent: { paddingBottom: hp(4), paddingTop: hp(1) },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5B8C',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hp(2),
    letterSpacing: 0.3,
  },
  full: { width: '100%' },
  dropdown: {
    height: hp(6),
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: wp(3.5),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    overflow: 'hidden',
  },
  dropdownItemView: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1E293B',
  },
  placeholderStyle: { fontSize: wp(3.6), color: '#94A3B8' },
  selectedTextStyle: { fontSize: wp(3.6), color: '#1E293B', fontWeight: '500' },
  dateTimeInput: {
    height: hp(6),
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: wp(3.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EDF2',
    marginBottom: hp(1.5),
  },
  dateTimeText: { fontSize: wp(3.6), color: '#1E293B', fontWeight: '500' },
  description: {
    height: hp(14),
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: wp(3.5),
    textAlignVertical: 'top',
    fontSize: wp(3.6),
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    padding: wp(4),
    borderRadius: 16,
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F4F9',
    paddingBottom: hp(1.2),
  },
  cardTitle: {
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: wp(2),
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: hp(0.7),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    width: wp(22),
    fontWeight: '600',
    color: '#64748B',
    fontSize: wp(3.4),
    letterSpacing: 0.3,
  },
  infoValue: {
    flex: 1,
    color: '#1E293B',
    fontSize: wp(3.4),
    fontWeight: '500',
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: hp(2),
  },
  whatsappBtn: {
    flex: 1,
    height: hp(6.5),
    backgroundColor: '#25D366',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emailBtn: {
    flex: 1,
    height: hp(6.5),
    backgroundColor: '#6C7BF2',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#6C7BF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp(4),
    letterSpacing: 0.5,
  },
  saveBtn: {
    height: hp(6.5),
    backgroundColor: '#6C7BF2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    gap: 10,
    shadowColor: '#6C7BF2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginTop: hp(1),
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: wp(4.2),
    letterSpacing: 0.8,
  },
  // ─── Dropdown loader ────────────────────────────────────────────────────────
  dropdownLoaderWrap: {
    height: hp(6),
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: wp(3.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    marginBottom: hp(1.5),
  },
  dropdownLoaderText: {
    fontSize: wp(3.4),
    color: '#94A3B8',
    fontWeight: '500',
  },
});
