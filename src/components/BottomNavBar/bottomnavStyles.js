import colors from '../../theme/colors';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingBottom: 0 
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  screenText: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark background
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
  },

  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },

  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },

  tabIcon: {

  },

  tabText: {
    fontSize: 6,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default styles;