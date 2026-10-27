import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import {
  getPlatforms,
  getStatuses,
} from '../../api/LeadApiService/LeadApiService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LeadFilter = ({ onApplyFilter, onRefresh, refreshing = false }) => {
  const [showFilter, setShowFilter] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // ========== API OPTIONS STATE ==========
  const [platformOptions, setPlatformOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // ========== FILTER STATE ==========
  const [searchText, setSearchText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [phoneNo, setphoneNo] = useState('');

  // ========== TEMP STATE FOR MODAL ==========
  const [tempPlatform, setTempPlatform] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [tempphone, setTempphone] = useState('');

  // ========== FETCH OPTIONS FROM API ==========
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setLoadingOptions(true);

      // ---------- Platforms ----------
      const platformResponse = await getPlatforms();
      console.log('📱 Platform Response:', platformResponse?.data);

      if (platformResponse?.data?.data) {
        const platforms = platformResponse.data.data;
        console.log('📱 Platforms Array:', platforms);

        const formattedPlatforms = [
          { label: 'All', value: null },
          ...platforms.map(p => ({
            label: p.PlatformName || p.title || p.name || 'Unknown',
            value: p.PlatformId || p._id || p.id || String(p),
          })),
        ];

        console.log('📱 Formatted Platforms:', formattedPlatforms);
        setPlatformOptions(formattedPlatforms);
      } else {
        setPlatformOptions([{ label: 'All', value: null }]);
      }

      // ---------- Status ----------
      const statusResponse = await getStatuses();
      console.log('📊 Status Response:', statusResponse?.data);

      if (statusResponse?.data?.data?.data) {
        const statuses = statusResponse.data.data.data;
        console.log('📊 Statuses Array:', statuses);

        const uniqueTitles = [
          ...new Set(statuses.map(item => item.title)),
        ];

        const formattedStatuses = [
          { label: 'All', value: null },
          ...uniqueTitles.map(title => ({
            label: title,
            value: title,
          })),
        ];

        console.log('📊 Formatted Statuses:', formattedStatuses);
        setStatusOptions(formattedStatuses);
      } else {
        setStatusOptions([{ label: 'All', value: null }]);
      }

    } catch (error) {
      console.log('❌ Error fetching filter options:', error);
      setPlatformOptions([{ label: 'All', value: null }]);
      setStatusOptions([{ label: 'All', value: null }]);
    } finally {
      setLoadingOptions(false);
    }
  };

  // ========== ANIMATION ==========
  const animateModal = show => {
    Animated.timing(slideAnim, {
      toValue: show ? 0 : SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ========== OPEN MODAL ==========
  const openModal = () => {
    setTempPlatform(selectedPlatform);
    setTempStatus(selectedStatus);
    setTempphone(phoneNo);
    setShowFilter(true);
    animateModal(true);
  };

  // ========== APPLY FILTERS ==========
  const applyFilters = () => {
    setSelectedPlatform(tempPlatform);
    setSelectedStatus(tempStatus);
    setphoneNo(tempphone);

    const payload = {
      searchText: searchText.trim(),
      platform: tempPlatform,
      status: tempStatus,
      phone: tempphone.trim(),
    };

    console.log('📊 APPLY FILTERS PAYLOAD =>', payload);
    onApplyFilter?.(payload);
    closeModal();
  };

  // ========== CLEAR FILTERS ==========
  const clearFilters = () => {
    setTempPlatform(null);
    setTempStatus(null);
    setTempphone('');
    setSelectedPlatform(null);
    setSelectedStatus(null);
    setphoneNo('');
    setSearchText('');

    onApplyFilter?.({
      searchText: '',
      platform: null,
      status: null,
      phone: null,
    });

    closeModal();
  };

  // ========== HANDLE SEARCH ==========
  const handleSearchChange = text => {
    setSearchText(text);
    onApplyFilter?.({
      searchText: text.trim(),
      platform: selectedPlatform,
      status: selectedStatus,
      phone: phoneNo.trim(),
    });
  };

  // ========== CLOSE MODAL ==========
  const closeModal = () => {
    animateModal(false);
    setTimeout(() => setShowFilter(false), 300);
  };

  // ========== RENDER DROPDOWN ==========
  const renderDropdown = (data, value, placeholder, setter) => {
    console.log(`📋 Rendering ${placeholder}:`, { data, value });

    return (
      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.dropdownItemContainer}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={loadingOptions ? 'Loading...' : placeholder}
        value={value}
        onChange={item => {
          console.log(`🔄 ${placeholder} selected:`, item);
          setter(item.value);
        }}
        search
        searchPlaceholder="Search..."
        searchInputStyle={styles.searchInputStyle}
        maxHeight={200}
        activeColor="#EEF2FF"
        statusBarIsTranslucent={true}
        renderItem={item => (
          <View style={styles.dropdownItemView}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
          </View>
        )}
        renderLeftIcon={() => (
          <Icon
            name="chevron-down"
            size={20}
            color="#94A3B8"
            style={{ marginRight: 8 }}
          />
        )}
      />
    );
  };

  // ========== ACTIVE FILTER COUNT ==========
  const activeFilterCount = [selectedPlatform, selectedStatus, phoneNo].filter(
    Boolean,
  ).length;

  return (
    <>
      {/* Top Bar */}
      <View style={styles.topBarContainer}>
        <View style={styles.searchWrapper}>
          <Icon
            name="magnify"
            size={20}
            color="#94A3B8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.globalSearchInput}
            placeholder="Search ..."
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={handleSearchChange}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                onApplyFilter?.({
                  searchText: '',
                  platform: selectedPlatform,
                  status: selectedStatus,
                  phone: phoneNo.trim(),
                });
              }}
              style={styles.clearSearchBtn}
            >
              <Icon name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            onRefresh?.();
            fetchFilterOptions();
          }}
          style={styles.refreshButton}
          activeOpacity={0.8}
          disabled={refreshing}
        >
          <Icon
            name="refresh"
            size={22}
            color={refreshing ? '#94A3B8' : '#4F46E5'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openModal}
          style={styles.filterIconButton}
          activeOpacity={0.8}
        >
          <Icon name="filter-variant" size={22} color="#FFFFFF" />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.keyboardView}
                >
                  {/* Header */}
                  <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                      <Text style={styles.modalTitle}>Filter Leads</Text>
                      <View style={styles.filterChip}>
                        <Text style={styles.filterChipText}>
                          {activeFilterCount} filters
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={closeModal}
                      style={styles.closeButton}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Platform */}
                    <View style={styles.filterGroup}>
                      <Text style={styles.label}>Platform</Text>
                      {renderDropdown(
                        platformOptions,
                        tempPlatform,
                        'Select Platform',
                        setTempPlatform,
                      )}
                    </View>

                    {/* Lead Status */}
                    <View style={styles.filterGroup}>
                      <Text style={styles.label}>Lead Status</Text>
                      {renderDropdown(
                        statusOptions,
                        tempStatus,
                        'Select Status',
                        setTempStatus,
                      )}
                    </View>

                    {/* phone Number */}
                    {/* <View style={styles.filterGroup}>
                      <Text style={styles.label}>phone Number</Text>
                      <View style={styles.phoneInputWrapper}>
                        <Icon
                          name="phone"
                          size={20}
                          color="#94A3B8"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="Enter phone number"
                          placeholderTextColor="#94A3B8"
                          keyboardType="phone-pad"
                          maxLength={10}
                          value={tempphone}
                          onChangeText={setTempphone}
                        />
                      </View>
                    </View> */}
                  </ScrollView>

                  {/* Bottom Actions */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      onPress={clearFilters}
                      style={[styles.btn, styles.btnClear]}
                      activeOpacity={0.8}
                    >
                      <Icon name="refresh" size={20} color="#64748B" />
                      <Text style={[styles.btnText, styles.btnClearText]}>
                        Clear All
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={applyFilters}
                      style={[styles.btn, styles.btnShow]}
                      activeOpacity={0.8}
                    >
                      <Icon name="check" size={20} color="#FFFFFF" />
                      <Text style={styles.btnText}>Apply Filters</Text>
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  globalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    minHeight: '60%',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  filterGroup: {
    marginTop: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  itemTextStyle: {
    fontSize: 14,
    color: '#0F172A',
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // ✅ YEH DONO STYLES ADD KARO
  dropdownItemContainer: {
    paddingVertical: 0,
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
  searchInputStyle: {
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  inputIcon: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnShow: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnClear: {
    backgroundColor: '#F1F5F9',
  },
  btnClearText: {
    color: '#64748B',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default LeadFilter;