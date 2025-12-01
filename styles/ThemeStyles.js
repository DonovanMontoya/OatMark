import {StyleSheet} from "react-native";

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
        whiteContainer: {
            flex: 1,
            backgroundColor: "white",
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
            shadowOffset: {width: 0, height: 6},
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
            shadowOffset: {width: 0, height: 10},
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
        mapWrapper: {
            width: "100%",
            height: "50%",
            position: "relative",
        },
        map: {
            width: "100%",
            height: "100%",
        },
        label: {
            textAlign: "center",
            marginVertical: 5,
            fontSize: 18,
            color: colors.text,
        },
        offlineBanner: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FF9500",
            paddingVertical: 8,
            paddingHorizontal: 16,
            marginHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
        offlineIcon: {
            marginRight: 8,
        },
        offlineBannerText: {
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: "600",
        },
        flatListContainer: {
            paddingBottom: 20,
            paddingTop: 10,
        },
        loadMoreButton: {
            alignSelf: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginTop: 8,
            marginBottom: 24,
        },
        loadMoreText: {
            color: colors.primary,
            fontWeight: "700",
            fontSize: 15,
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
            shadowOffset: {width: 0, height: 6},
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
        oatMilk: {
            color: colors.isDark ? "#FFFFFF" : colors.text,
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
            shadowOffset: {width: 0, height: 1},
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
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
        },
        shopEmojiLarge: {
            fontSize: 28,
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: {width: 1, height: 1},
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
        closeButtonTop: {
            position: "absolute",
            top: 50,
            left: 20,
            zIndex: 20,
        },
        closeButtonBackground: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.isDark
                ? "rgba(30, 30, 30, 0.8)"
                : "rgba(255, 255, 255, 0.95)",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10,
            backdropFilter: "blur(10px)",
            borderWidth: 1,
            borderColor: colors.isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.05)",
            // Add a subtle hover/press effect with transform
            transform: [{scale: 1}],
        },
        adminFloatingButton: {
            position: "absolute",
            top: 50,
            right: 20,
            zIndex: 20,
        },
        adminFloatingBackground: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.isDark
                ? "rgba(30, 30, 30, 0.8)"
                : "rgba(255, 255, 255, 0.95)",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#FF9500",
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 10,
            backdropFilter: "blur(10px)",
            borderWidth: 2,
            borderColor: colors.isDark
                ? "rgba(255, 149, 0, 0.6)"
                : "rgba(255, 149, 0, 0.5)",
            // Add a subtle glow effect for the admin button
            // Note: This is simulated with multiple shadows since RN doesn't support box-shadow spread
            // The actual glow effect will be more visible in the app
            transform: [{scale: 1}],
        },
        // shopInfoCard and shopInfoContent styles removed - merged into bottomSection
        bottomSection: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20, // Higher than shopInfoCard's z-index (15)
            backgroundColor: colors.isDark
                ? "rgba(30, 51, 86, 0.98)"
                : "rgba(255, 255, 255, 0.98)",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: -10},
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 24,
            backdropFilter: "blur(20px)",
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.isDark
                ? "rgba(74, 140, 255, 0.3)"
                : "rgba(0, 122, 255, 0.1)",
        },
        bottomContent: {
            paddingHorizontal: 24,
            paddingTop: 36, // Increased from 28 to create more space
            paddingBottom: 44,
        },
        shopNameSection: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
        },
        bottomEmojiContainer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.isDark
                ? "rgba(74, 140, 255, 0.2)"
                : "rgba(255, 255, 255, 0.95)",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 15,
            shadowColor: colors.isDark ? "#4A8CFF" : "#000",
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
            borderWidth: 2,
            borderColor: colors.isDark ? "#4A8CFF" : "#007AFF",
        },
        bottomEmoji: {
            fontSize: 24,
            textShadowColor: "rgba(0, 0, 0, 0.1)",
            textShadowOffset: {width: 1, height: 1},
            textShadowRadius: 2,
        },
        shopNameTextContainer: {
            flex: 1,
        },
        bottomShopName: {
            fontSize: 26,
            fontWeight: "800",
            color: colors.text,
            marginBottom: 4,
            letterSpacing: -0.5,
            // Add text shadow for better readability in both light and dark modes
            textShadowColor: colors.isDark
                ? "rgba(0, 0, 0, 0.3)"
                : "rgba(255, 255, 255, 0.5)",
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 2,
        },
        bottomSubtitle: {
            fontSize: 15,
            color: colors.secondaryText,
            fontWeight: "500",
            letterSpacing: 0.2,
            opacity: 0.9,
        },
        quickStats: {
            flexDirection: "row",
            backgroundColor: colors.isDark
                ? "rgba(74, 140, 255, 0.1)"
                : "rgba(247, 250, 252, 1)",
            borderRadius: 20,
            padding: 20,
            marginTop: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.isDark ? "#4A8CFF" : "#E2E8F0",
        },
        statItem: {
            flex: 1,
            alignItems: "center",
        },
        statIcon: {
            width: 20,
            height: 20,
            marginBottom: 8,
            tintColor: colors.isDark ? "#4CAF50" : "#2E7D32",
        },
        statLabel: {
            fontSize: 12,
            color: colors.secondaryText,
            fontWeight: "500",
            marginBottom: 4,
            textAlign: "center",
        },
        statValue: {
            fontSize: 14,
            color: colors.text,
            fontWeight: "700",
            textAlign: "center",
        },
        statDivider: {
            width: 1,
            backgroundColor: colors.isDark ? "#4A8CFF" : "#E2E8F0",
            marginHorizontal: 15,
        },
        actionButtons: {
            gap: 12,
            marginTop: 20,
        },
        primaryActionButton: {
            backgroundColor: colors.isDark ? "#4A8CFF" : "#007AFF",
            paddingVertical: 14,
            borderRadius: 18,
            shadowColor: colors.isDark ? "#4A8CFF" : "#007AFF",
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 6,
        },
        primaryButtonText: {
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: "700",
            marginHorizontal: 10,
            textShadowColor: "rgba(0, 0, 0, 0.2)",
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 2,
        },
        secondaryActions: {
            flexDirection: "row",
            gap: 10,
            marginTop: 8,
        },
        secondaryActionButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.isDark
                ? "rgba(74, 140, 255, 0.1)"
                : "rgba(247, 250, 252, 1)",
            paddingVertical: 10,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.isDark ? "#4A8CFF" : "#E2E8F0",
        },
        favoriteActive: {
            backgroundColor: colors.isDark
                ? "rgba(255, 107, 107, 0.2)"
                : "rgba(255, 235, 235, 1)",
            borderColor: "#FF6B6B",
        },
        secondaryButtonText: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.secondaryText,
            marginLeft: 6,
            letterSpacing: 0.2,
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
            backgroundColor: "transparent",
            zIndex: 1000,
            overflow: "hidden",
        },
        overlayMapContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "70%",
            zIndex: 1,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            overflow: "hidden",
            shadowColor: colors.isDark ? "#4A8CFF" : "#007AFF",
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
        },
        overlayMap: {
            width: "100%",
            height: "100%",
        },
        mapBorderOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 2,
            borderColor: colors.isDark
                ? "rgba(74, 140, 255, 0.4)"
                : "rgba(0, 122, 255, 0.3)",
            borderRadius: 0,
            pointerEvents: "none",
        },
        mapOverlayGradient: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            backgroundColor: "transparent",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            pointerEvents: "none",
            // Note: We can't use actual gradients in plain RN styles
            // This creates a layered effect that simulates a gradient
            shadowColor: colors.isDark ? "#1E3356" : "#FFFFFF",
            shadowOffset: {width: 0, height: -30},
            shadowOpacity: colors.isDark ? 0.95 : 0.9,
            shadowRadius: 30,
            elevation: 10,
            // Add a subtle border at the bottom for definition
            borderBottomWidth: 1,
            borderBottomColor: colors.isDark
                ? "rgba(74, 140, 255, 0.3)"
                : "rgba(0, 122, 255, 0.2)",
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
            shadowOffset: {width: 0, height: 2},
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
            shadowOffset: {width: 0, height: 4},
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
        authButtonDisabled: {
            opacity: 0.6,
        },
        errorText: {
            width: "100%",
            color: "#FF3B30",
            fontSize: 14,
            marginBottom: 12,
            paddingHorizontal: 4,
            textAlign: "left",
        },

        // Common modal styles
        modalHeader: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 20,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            flex: 1,
            textAlign: "center",
        },
        modalCloseButton: {
            position: "absolute",
            right: 20,
        },

        // Common map styles
        mapContainer: {
            width: "100%",
            height: 220,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#f0f0f0",
        },
    });
};
