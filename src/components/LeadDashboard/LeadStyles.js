import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // 👈 space-between ki jagah flex-start
    paddingHorizontal: wp(2.5),
    paddingTop: hp(1),
    paddingBottom: hp(0.5),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: wp(2.7), // 👈 cards ke beech mein space dene ke liye
  },

  statCard: {
    width: '31%', // 👈 width thodi kam kari taki 3 cards fit ho jayein
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    marginBottom: hp(0.2),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // 👈 ACTIVE CARD STYLE
  activeCard: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  statCount: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#111827',
    lineHeight: wp(5.5),
  },

  statTitle: {
    marginTop: 2,
    fontSize: wp(2.6),
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  // 👈 ACTIVE TEXT STYLE
  activeText: {
    color: '#4F46E5',
  },

  iconRow: {
    marginBottom: hp(0.3),
  },

  icon: {
    fontSize: wp(5),
  },

  // Card styles (if needed)
  card: {
    backgroundColor: '#fff',
    marginHorizontal: wp(3),
    marginBottom: hp(1.5),
    borderRadius: 12,
    padding: wp(4),
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leadId: {
    fontSize: wp(4),
    fontWeight: '700',
  },

  status: {
    color: '#16A34A',
    fontWeight: '600',
  },

  info: {
    marginTop: hp(1),
    fontSize: wp(3.7),
  },

  btn: {
    marginTop: hp(1.5),
    backgroundColor: '#4865D9',
    paddingVertical: hp(1.2),
    borderRadius: 8,
  },

  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});