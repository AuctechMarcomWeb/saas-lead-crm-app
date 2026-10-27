import { StyleSheet } from "react-native";
import { wp, hp } from "../../utilies/Functon/Responsive";
import colors from "../../theme/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // black background
  },

  notificationCard: {
    flexDirection: "row",
    backgroundColor: colors.surface, // dark card
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    padding: wp(4),
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: colors.goldMuted,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
  },

  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
    backgroundColor: colors.primaryBg, // soft gold tint
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: wp(4),
    fontWeight: "600",
    color: colors.textPrimary, // white text
  },

  readText: {
    color: colors.textMuted,
    opacity: 0.6,
  },

  message: {
    fontSize: wp(3.5),
    color: colors.textSecondary, // lighter white
    marginTop: hp(0.5),
  },

  subtitle: {
    fontSize: wp(3),
    color: colors.textMuted,
    marginTop: hp(0.3),
  },

  time: {
    fontSize: wp(3),
    color: colors.textMuted,
    marginTop: hp(0.8),
  },

  // Unread dot indicator
  unreadDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: "#FF6B9D",
    marginLeft: wp(2),
  },

  // Delete button
  deleteButton: {
    marginLeft: wp(2),
    padding: wp(2),
  },

  // Mark All button
  markAllButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    paddingVertical: hp(1.5),
    borderRadius: wp(2.5),
    alignItems: "center",
  },

  markAllButtonText: {
    color: "#FFF",
    fontSize: wp(3.5),
    fontWeight: "600",
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: wp(3.5),
    marginTop: hp(2),
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: wp(4),
    marginTop: hp(2),
  },

  // Optional badge for unread notifications
  unreadBadge: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: colors.primary, // gold
    position: "absolute",
    right: wp(2),
    top: wp(2),
  },

  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modalContainer: {
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: colors.surface,
    borderRadius: wp(4),
    overflow: "hidden",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },

  closeButton: {
    position: "absolute",
    top: wp(4),
    right: wp(4),
    zIndex: 1001,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: wp(5),
    padding: wp(2),
  },

  modalContent: {
    padding: wp(5),
    paddingTop: wp(8),
  },

  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: hp(1),
  },

  modalMessage: {
    fontSize: wp(3.5),
    color: colors.textSecondary,
    marginBottom: hp(1.5),
    lineHeight: hp(2.2),
  },

  leadDetailsBox: {
    backgroundColor: colors.background,
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B9D",
  },

  leadName: {
    fontSize: wp(4),
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: hp(0.8),
  },

  leadInfo: {
    fontSize: wp(3.5),
    color: colors.textSecondary,
    marginVertical: hp(0.4),
  },

  modalButtonsContainer: {
    flexDirection: "row",
    gap: wp(3),
    marginTop: hp(2),
  },

  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.3),
    borderRadius: wp(2.5),
    gap: wp(2),
  },

  historyBtn: {
    backgroundColor: "#2196F3",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "600",
  },
});
