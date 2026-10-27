import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LeadCard = ({ lead, index, onPress }) => {
  const navigation = useNavigation();
  
  // ========== STATE FOR MODALS ==========
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [queryModalVisible, setQueryModalVisible] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  // ========== SAFE FIELD EXTRACTION ==========
  const safeString = (value) => {
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  // ========== MAP API FIELDS TO DISPLAY ==========
  const leadId = lead.leadCode || lead['Lead ID'] || lead.lead_id || `LD${String(index + 1).padStart(6, '0')}`;
  const name = lead.name || lead.Name || lead['Full Name'] || `Lead ${index + 1}`;

  // Platform - handle both string and object
  const platform = typeof lead.platform === 'object'
    ? lead.platform?.PlatformName || lead.platform?.title || '-'
    : lead.platform || lead.Platform || lead['Source'] || '-';

  // Action - handle both string and object
  const action = typeof lead.action === 'object'
    ? lead.action?.title || lead.action?.name || '-'
    : lead.action || lead.Action || '-';

  // Status - handle both string and object
  const status = typeof lead.status === 'object'
    ? lead.status?.title || lead.status?.name || 'New'
    : lead.status || lead.Status || lead['Lead Status'] || 'New';

  // Assigned To - handle both string and object
  const assignedTo = typeof lead.assignTo === 'object'
    ? lead.assignTo?.name || lead.assignTo?.email || 'BDM-1'
    : lead.assignTo || lead['Assign To'] || lead['assign_to'] || 'BDM-1';

  const phone = lead.phone || lead.Phone || lead['Mobile'] || lead['Contact'] || '-';
  const remark = lead.remark || lead.Remark || lead.Query || lead.query || lead['Comments'] || '-';
  const leadDate = lead.leadDate || lead.Date || lead['Created Date'] || new Date().toLocaleDateString();

  // ========== FORMAT DATE ==========
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString();
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

  // ========== GET STATUS COLOR ==========
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'fresh' || s === 'fresh lead') return '#22C55E';
    if (s.includes('followup') || s.includes('follow up')) return '#F59E0B';
    if (s === 'pending') return '#EF4444';
    if (s === 'qualified') return '#8B5CF6';
    if (s === 'open') return '#3B82F6';
    if (s === 'scraped') return '#64748B';
    if (s.includes('meeting') || s.includes('schedule')) return '#06B6D4';
    return '#6B7280';
  };

  // ========== GET STATUS BACKGROUND ==========
  const getStatusBackground = (status) => {
    const color = getStatusColor(status);
    return color + '15';
  };

  // ========== MENU HANDLERS ==========
  const openMenu = (item) => {
    setSelectedItem(item);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedItem(null);
  };

  const handleMenuOption = (option) => {
    if (!selectedItem) return;
    closeMenu();
    
    switch (option) {
      case 'query':
        setSelectedDescription(selectedItem.remark || selectedItem.Remark || selectedItem.Query || 'No Description');
        setQueryModalVisible(true);
        break;
      case 'activity':
        navigation.navigate('LeadActivityDetails', {
          leadId: selectedItem._id,
          title: 'Last Activity',
        });
        break;
      case 'action':
        navigation.navigate('LeadActionScreen', { leadData: selectedItem });
        break;
      default:
        break;
    }
  };

  // ========== RENDER ==========
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => onPress?.(lead)}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Ionicons name="document-text-outline" size={16} color="#4F46E5" />
          <Text style={styles.leadId}>{safeString(leadId)}</Text>
        </View>
        <View style={styles.rightHeaderContainer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
            <Text style={styles.leadDate}>{formatDate(leadDate)}</Text>
          </View>
          {/* Three Dots Menu */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => openMenu(lead)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameContainer}>
        <Ionicons name="person-outline" size={18} color="#0F172A" />
        <Text style={styles.nameText}>{safeString(name)}</Text>
      </View>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <View style={styles.fieldRow}>
          <Ionicons name="phone-portrait-outline" size={14} color="#94A3B8" style={styles.fieldIcon} />
          <Text style={styles.fieldLabel}>PLATFORM</Text>
          <Text style={styles.fieldValue}>{safeString(platform)}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="cube-outline" size={14} color="#94A3B8" style={styles.fieldIcon} />
          <Text style={styles.fieldLabel}>ACTION</Text>
          <Text style={styles.fieldValue}>{safeString(action)}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="briefcase-outline" size={14} color="#94A3B8" style={styles.fieldIcon} />
          <Text style={styles.fieldLabel}>ASSIGN TO</Text>
          <Text style={styles.fieldValue}>{safeString(assignedTo)}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Ionicons name="call-outline" size={14} color="#94A3B8" style={styles.fieldIcon} />
          <Text style={styles.fieldLabel}>PHONE</Text>
          <Text style={styles.fieldValue}>{safeString(phone)}</Text>
        </View>

        {/* Query Container */}
        <View style={styles.queryContainer}>
          <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" style={styles.queryIcon} />
          <Text style={styles.queryLabel}>QUERY:</Text>
          <Text style={styles.queryText} numberOfLines={2}>
            {safeString(remark)}
          </Text>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={[styles.statusContainer, { backgroundColor: getStatusBackground(status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              ● {safeString(status)}
            </Text>
          </View>
        </View>
      </View>

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
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#1E293B" />
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
              <Text style={styles.menuItemText}>Upadte Action</Text>
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
            <Text style={styles.modalText}>{selectedDescription}</Text>
            <TouchableOpacity 
              onPress={() => setQueryModalVisible(false)} 
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

// ========== STYLES ==========
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 6,
  },
  rightHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  leadDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  menuButton: {
    padding: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  cardBody: {
    marginLeft: 0,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  fieldIcon: {
    marginRight: 6,
    width: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    width: 85,
  },
  fieldValue: {
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
  },
  queryContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  queryIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  queryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    width: 60,
  },
  queryText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    fontStyle: 'italic',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Menu Styles
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
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginHorizontal: 16,
  },
  // Modal Styles
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LeadCard;