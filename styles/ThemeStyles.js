import { StyleSheet } from "react-native";

/**
 * Creates theme-aware styles for common components
 * @param {Object} colors - Theme colors from ThemeContext
 * @returns {Object} StyleSheet object with theme-aware styles
 */
export const createThemeStyles = (colors) => {
  return StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeAreaContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
    },

    // Card styles
    card: {
      flexDirection: "row",
      alignItems: "stretch",
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colors.isDark ? 0.3 : 0.12,
      shadowRadius: 16,
      elevation: 8,
      overflow: "hidden",
    },
    cardContent: {
      flex: 1,
      paddingVertical: 12,
      paddingRight: 16,
      justifyContent: "space-between",
    },

    // Text styles
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    text: {
      fontSize: 16,
      color: colors.text,
    },
    secondaryText: {
      fontSize: 14,
      color: colors.secondaryText,
    },

    // Input styles
    input: {
      width: "100%",
      height: 44,
      paddingHorizontal: 12,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },

    // Button styles
    primaryButton: {
      width: "100%",
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: "center",
    },
    secondaryButton: {
      width: "100%",
      backgroundColor: colors.isDark ? colors.cardBackground : "#f0f0f0",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },

    // List styles
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },

    // Map related styles
    map: {
      width: "100%",
      height: "50%",
    },
    locationButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.locationButton,
      padding: 10,
      borderRadius: 8,
      zIndex: 1,
    },

    // Overlay styles
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.modalBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      width: "80%",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },

    // Utility styles
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: 8,
    },
    spacer: {
      height: 16,
    },
  });
};

/**
 * Creates theme-aware styles for the HomeScreen component
 * @param {Object} colors - Theme colors from ThemeContext
 * @returns {Object} StyleSheet object with theme-aware styles for HomeScreen
 */
export const createHomeScreenStyles = (colors) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    map: {
      width: "100%",
      height: "50%",
    },
    label: {
      textAlign: "center",
      marginVertical: 5,
      fontSize: 18,
      color: colors.text,
    },
    flatListContainer: {
      paddingBottom: 20,
      paddingTop: 10,
    },
    card: {
      flexDirection: "row",
      alignItems: "stretch",
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.isDark ? "#000" : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colors.isDark ? 0.3 : 0.12,
      shadowRadius: 16,
      elevation: 8,
      overflow: "hidden",
    },
    cardImageContainer: {
      position: "relative",
      width: 80,
      height: 80,
      margin: 12,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.isDark ? colors.secondaryBackground : "#f0f0f0",
    },
    emojiContainer: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.isDark ? colors.secondaryBackground : "#f8f8f8",
      justifyContent: "center",
      alignItems: "center",
    },
    emojiText: {
      fontSize: 40,
    },
    imageOverlay: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    imageLoadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.isDark
        ? "rgba(30, 51, 86, 0.8)"
        : "rgba(255, 255, 255, 0.8)",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    cardContent: {
      flex: 1,
      paddingVertical: 12,
      paddingRight: 16,
      justifyContent: "space-between",
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    cardDetails: {
      gap: 4,
    },
    shopName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    oatMilkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    distanceText: {
      fontSize: 13,
      color: colors.secondaryText,
      fontWeight: "500",
    },
    upCharge: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.secondaryText,
      textAlign: "right",
      marginLeft: 10,
    },
    upchargeContainer: {
      backgroundColor: colors.isDark ? colors.secondaryBackground : "#f8f9fa",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    shopIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.isDark ? "rgba(74, 140, 255, 0.2)" : "#FFF8E1",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
      borderWidth: 2,
      borderColor: colors.isDark ? "#4A8CFF" : "#FFD54F",
      shadowColor: colors.isDark ? "#4A8CFF" : "#FFA000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    shopEmojiLarge: {
      fontSize: 28,
      textShadowColor: "rgba(0, 0, 0, 0.1)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    headerTextContainer: {
      flex: 1,
      justifyContent: "center",
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 2,
    },
    shopSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    actionButtonsContainer: {
      paddingHorizontal: 20,
      paddingBottom: 25,
    },
    secondaryButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
      gap: 15,
    },
    secondaryButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.isDark ? "rgba(74, 140, 255, 0.15)" : "#F8F9FA",
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.isDark ? "#4A8CFF" : "#E9ECEF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
      letterSpacing: 0.2,
    },
    favoriteButtonActive: {
      backgroundColor: colors.isDark ? "rgba(255, 107, 107, 0.2)" : "#FFE8E8",
      borderColor: colors.isDark ? "#FF6B6B" : "#FFB3B3",
      transform: [{ scale: 1.02 }],
    },
    favoriteButtonTextActive: {
      color: "#FF6B6B",
      fontWeight: "700",
    },
    locationButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.locationButton,
      padding: 10,
      borderRadius: 8,
      zIndex: 1,
    },
    selectedShopOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.overlayBackground,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 1000,
      borderRadius: 20,
      overflow: "hidden",
    },
    iosCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: colors.isDark
        ? "linear-gradient(135deg, rgba(30, 51, 86, 0.95), rgba(74, 140, 255, 0.1))"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(74, 140, 255, 0.05))",
      borderBottomWidth: 2,
      borderBottomColor: colors.isDark ? "#4A8CFF" : "#E8F4FD",
      shadowColor: colors.isDark ? "#4A8CFF" : "#007AFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    iosShopName: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.3,
      textShadowColor: colors.isDark
        ? "rgba(74, 140, 255, 0.3)"
        : "rgba(0, 122, 255, 0.1)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
      marginBottom: 2,
    },
    iosCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.isDark ? colors.cardBackground : "#F2F2F7",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iosDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 20,
      marginBottom: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    iosCardContent: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.isDark
        ? "rgba(30, 51, 86, 0.8)"
        : "rgba(255, 255, 255, 0.8)",
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    iosDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      backgroundColor: colors.isDark
        ? "rgba(22, 42, 69, 0.7)"
        : "rgba(249, 249, 251, 0.7)",
      padding: 12,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iosDetailText: {
      fontSize: 17,
      color: colors.text,
      marginLeft: 16,
      flex: 1,
    },
    iosDetailLabel: {
      fontWeight: "600",
      color: colors.secondaryText,
      letterSpacing: -0.2,
    },
    iosDirectionsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.isDark ? "#4A8CFF" : "#007AFF",
      paddingVertical: 18,
      borderRadius: 25,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 2,
      borderColor: colors.isDark ? "#74A3FF" : "#4A90E2",
      transform: [{ scale: 1 }],
    },
    iosButtonIcon: {
      marginRight: 12,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    iosDirectionsButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.5,
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    adminAdjustButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.isDark
        ? "rgba(255, 149, 0, 0.1)"
        : "rgba(255, 149, 0, 0.05)",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.isDark
        ? "rgba(255, 149, 0, 0.3)"
        : "rgba(255, 149, 0, 0.2)",
      opacity: 0.6,
      marginLeft: 8,
    },
    adminAdjustButtonText: {
      fontSize: 9,
      fontWeight: "500",
      color: "#666",
      marginLeft: 3,
      letterSpacing: 0.2,
    },
  });
};

/**
 * Creates theme-aware styles for the HamburgerMenu component
 * @param {Object} colors - Theme colors from ThemeContext
 * @returns {Object} StyleSheet object with theme-aware styles for HamburgerMenu
 */
export const createHamburgerMenuStyles = (colors) => {
  return StyleSheet.create({
    hamburgerButton: {
      position: "absolute",
      top: 50,
      left: 20,
      backgroundColor: colors.locationButton,
      padding: 12,
      borderRadius: 8,
      zIndex: 1000,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.modalBackground,
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
    menuContainer: {
      backgroundColor: colors.menuBackground,
      marginTop: 100,
      marginLeft: 20,
      borderRadius: 12,
      paddingVertical: 8,
      minWidth: 180,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logoutMenuItem: {
      borderBottomWidth: 0,
    },
    menuIcon: {
      marginRight: 15,
      width: 20,
    },
    menuText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    logoutText: {
      color: colors.danger,
    },
  });
};

/**
 * Creates theme-aware styles for the LoginPage component
 * @param {Object} colors - Theme colors from ThemeContext
 * @returns {Object} StyleSheet object with theme-aware styles for LoginPage
 */
export const createLoginPageStyles = (colors) => {
  return StyleSheet.create({
    authContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    authLogo: {
      width: 120,
      height: 120,
      marginBottom: 20,
      resizeMode: "contain",
    },
    authTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
    },
    authSubtitle: {
      fontSize: 16,
      color: colors.secondaryText,
      marginBottom: 20,
    },
    input: {
      width: "100%",
      height: 44,
      paddingHorizontal: 12,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },
    authButton: {
      width: "100%",
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: "center",
    },
    authButtonSecondary: {
      width: "100%",
      backgroundColor: colors.isDark ? colors.cardBackground : "#999",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: "center",
    },
    authButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
  });
};
