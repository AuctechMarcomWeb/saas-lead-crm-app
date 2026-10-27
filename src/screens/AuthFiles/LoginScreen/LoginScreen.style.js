import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';
import { wp, hp } from '../../../utilies/Functon/Responsive';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },

  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('3%'),
  },

  // Header and branding
  header: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },

  logoContainer: {
    width: wp('27%'),
    height: wp('27%'),
    maxWidth: 112,
    maxHeight: 112,
    borderRadius: wp('7%'),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: hp('2%'),
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  logo: {
    width: '84%',
    height: '84%',
  },

  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primaryBg,
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 30,
    marginBottom: hp('1.5%'),
    gap: wp('1.5%'),
  },

  brandBadgeText: {
    fontSize: RFValue(10),
    fontWeight: '800',
    color: colors.cursorColor,
    letterSpacing: 1,
  },

  heading: {
    fontSize: RFValue(27),
    fontWeight: '800',
    color: colors.TitleColor,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: RFValue(13),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: hp('1%'),
    lineHeight: RFValue(20),
  },

  subtitleAccent: {
    fontSize: RFValue(13),
    color: colors.cursorColor,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: hp('0.3%'),
  },

  // Form card
  formContainer: {
    width: '100%',
    backgroundColor: colors.cardColor,
    borderRadius: wp('5%'),
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('3%'),
    borderWidth: 1,
    borderColor: colors.neutral.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  formTitle: {
    fontSize: RFValue(19),
    fontWeight: '800',
    color: colors.TitleColor,
    marginBottom: hp('0.7%'),
  },

  formSubtitle: {
    fontSize: RFValue(12),
    color: colors.textSecondary,
    lineHeight: RFValue(19),
    marginBottom: hp('3%'),
  },

  // Input fields
  fieldContainer: {
    width: '100%',
    marginBottom: hp('1%'),
  },

  label: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: colors.lableColor,
    marginBottom: hp('1%'),
  },

  required: {
    color: colors.requiredColor,
  },

  inputContainer: {
    minHeight: hp('7%'),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: wp('3.5%'),
    paddingHorizontal: wp('4%'),
  },

  inputError: {
    borderColor: colors.requiredColor,
    backgroundColor: colors.dangerBg,
  },

  inputIcon: {
    marginRight: wp('3%'),
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: hp('6.8%'),
    fontSize: RFValue(14),
    color: colors.textPrimary,
    paddingVertical: 0,
  },

  eyeButton: {
    width: wp('10%'),
    height: hp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp('1%'),
  },

  errorText: {
    color: colors.requiredColor,
    fontSize: RFValue(11),
    marginTop: hp('0.7%'),
    marginLeft: wp('1%'),
    lineHeight: RFValue(16),
  },

  // Security note
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('1.5%'),
    marginTop: hp('0.5%'),
    marginBottom: hp('2.5%'),
    gap: wp('2.5%'),
  },

  securityText: {
    flex: 1,
    fontSize: RFValue(10),
    color: colors.SecondTitleColor,
    lineHeight: RFValue(16),
  },

  // Sign in button
  button: {
    minHeight: hp('7%'),
    backgroundColor: colors.backgroundbtn,
    borderRadius: wp('3.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    gap: wp('3%'),
    marginTop: hp('0.5%'),
    shadowColor: colors.backgroundbtnDardk,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },

  buttonText: {
    color: colors.white,
    fontSize: RFValue(15),
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Footer
  footerNote: {
    fontSize: RFValue(10),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: hp('2.5%'),
    lineHeight: RFValue(16),
  },

  // Retained styles for other authentication screens
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },

  illustrationContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: hp('3%'),
    paddingTop: hp('5%'),
  },

  illustration: {
    width: wp('70%'),
    height: hp('20%'),
  },

  title: {
    fontSize: RFValue(28),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: hp('0.5%'),
    textAlign: 'center',
  },

  subtitleLegacy: {
    fontSize: RFValue(14),
    color: colors.textSecondary,
    marginBottom: hp('4%'),
    textAlign: 'center',
  },

  form: {
    width: '100%',
  },

  iconContainer: {
    width: wp('6%'),
    alignItems: 'center',
    marginRight: wp('3%'),
  },

  icon: {
    fontSize: RFValue(16),
    color: colors.textSecondary,
  },

  eyeIcon: {
    padding: wp('2%'),
  },

  eyeText: {
    fontSize: RFValue(16),
    color: colors.textSecondary,
  },

  inputContainerFocused: {
    borderColor: colors.inputBorderFocus,
    backgroundColor: colors.white,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
    paddingHorizontal: wp('2%'),
  },

  otpInput: {
    width: wp('11%'),
    height: hp('7%'),
    backgroundColor: colors.white,
    borderRadius: wp('3%'),
    borderWidth: 2,
    borderColor: colors.inputBorder,
    textAlign: 'center',
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  otpInputFocused: {
    borderColor: colors.cursorColor,
    backgroundColor: colors.white,
  },

  otpInputFilled: {
    borderColor: colors.cursorColor,
    backgroundColor: colors.primaryBg,
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },

  resendText: {
    fontSize: RFValue(13),
    color: colors.textSecondary,
  },

  resendLink: {
    fontSize: RFValue(13),
    color: colors.primary,
    fontWeight: '600',
    marginLeft: wp('1%'),
  },

  resendLinkDisabled: {
    color: colors.textMuted,
  },

  changeIdentifierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('2.5%'),
    paddingVertical: hp('1%'),
  },

  changeIdentifierText: {
    fontSize: RFValue(13),
    color: colors.textSecondary,
    marginLeft: wp('1%'),
  },

  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('4%'),
    marginTop: -hp('1%'),
  },

  rememberMeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('1%'),
    borderWidth: 2,
    borderColor: colors.inputBorder,
    marginRight: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxIcon: {
    fontSize: RFValue(12),
    color: colors.white,
  },

  rememberMeText: {
    fontSize: RFValue(13),
    color: colors.textSecondary,
  },

  forgotPasswordText: {
    fontSize: RFValue(13),
    color: colors.primary,
    fontWeight: '600',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('2%'),
    flexWrap: 'wrap',
  },

  signupText: {
    fontSize: RFValue(13),
    color: colors.textSecondary,
  },

  signupLink: {
    fontSize: RFValue(13),
    color: colors.primary,
    fontWeight: '700',
    marginLeft: wp('1%'),
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('3%'),
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inputBorder,
  },

  dividerText: {
    marginHorizontal: wp('4%'),
    fontSize: RFValue(12),
    color: colors.textMuted,
    fontWeight: '600',
  },

  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp('4%'),
    marginBottom: hp('3%'),
  },

  socialButton: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  socialIcon: {
    fontSize: RFValue(20),
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: RFValue(15),
    marginLeft: wp('2%'),
  },

  termsContainer: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
  },

  termsText: {
    fontSize: RFValue(11),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: RFValue(16),
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default styles;
