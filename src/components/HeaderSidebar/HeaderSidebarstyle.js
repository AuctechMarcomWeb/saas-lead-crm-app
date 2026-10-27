import { StyleSheet } from 'react-native';
import { wp, hp } from '../../utilies/Functon/Responsive';

const styles = StyleSheet.create({
  container: {
    padding: wp(4),
    paddingTop: hp(1),
    paddingBottom: hp(0.1),
    // borderBottomLeftRadius: wp(5),
    // borderBottomRightRadius: wp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginRight: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  greeting: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: wp(3.5),
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: wp(4.5),
    fontWeight: '700',
    marginTop: hp(0.3),
  },
  notificationButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  balanceInfo: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: wp(3),
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: wp(3),
    fontWeight: '500',
    marginBottom: hp(0.5),
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: wp(4),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginRight: wp(2),
  },
  addMoneyButton: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
