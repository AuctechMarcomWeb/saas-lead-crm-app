import { StyleSheet } from 'react-native';

const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 10,
    paddingTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#e0e7ff',
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 10,
  },
  dateFilter: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 10,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chart: {
    borderRadius: 8,
  },
  chartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chartLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  chartValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 10,
  },
  funnelContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sourcesContainer: {
    flex: 0.6,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 15,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sourceHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  quickFilters: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButton: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#1e293b',
  },
  exportButton: {
    padding: 10,
    marginTop: 10,
  },
  exportButtonText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  filterStats: {
    marginTop: 15,
  },
  filterStatItem: {
    marginBottom: 10,
  },
  filterStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 3,
  },
  filterStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  performersSection: {
    padding: 20,
    paddingTop: 0,
  },
  teamSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
});

export default dashboardStyles;