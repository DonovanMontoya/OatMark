import {StyleSheet} from "react-native";
import {fonts, makeShadow, radius, space} from "./tokens";

// Always-dark ink for text sitting on the amber "warning" surface (the offline
// banner is amber in both themes, so its text can't be theme-dependent).
const ON_WARNING = "#3B2A12";

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
            backgroundColor: colors.background,
        },
        safeAreaContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        contentContainer: {
            padding: space.md,
        },

        // Card styles
        card: {
            flexDirection: "row",
            alignItems: "stretch",
            marginHorizontal: space.md,
            marginVertical: space.xs,
            backgroundColor: colors.cardBackground,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            ...makeShadow(colors, "md"),
            overflow: "hidden",
        },
        cardContent: {
            flex: 1,
            paddingVertical: space.sm,
            paddingRight: space.md,
            justifyContent: "space-between",
        },

        // Text styles
        title: {
            fontSize: 26,
            fontFamily: fonts.display,
            color: colors.text,
            marginBottom: space.md,
            letterSpacing: -0.4,
        },
        subtitle: {
            fontSize: 18,
            fontFamily: fonts.semibold,
            color: colors.text,
            marginBottom: space.xs,
        },
        text: {
            fontSize: 16,
            fontFamily: fonts.body,
            color: colors.text,
        },
        secondaryText: {
            fontSize: 14,
            fontFamily: fonts.body,
            color: colors.secondaryText,
        },

        // Input styles
        input: {
            width: "100%",
            height: 50,
            paddingHorizontal: space.md,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.sm,
            marginBottom: space.sm,
            fontSize: 16,
            fontFamily: fonts.body,
            backgroundColor: colors.inputBackground,
            color: colors.text,
        },

        // Button styles
        primaryButton: {
            width: "100%",
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: radius.md,
            marginBottom: space.xs,
            alignItems: "center",
            ...makeShadow(colors, "sm"),
        },
        secondaryButton: {
            width: "100%",
            backgroundColor: colors.surfaceMuted,
            paddingVertical: 15,
            borderRadius: radius.md,
            marginBottom: space.xs,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonText: {
            color: colors.onAccent,
            fontFamily: fonts.bold,
            fontSize: 16,
        },
        secondaryButtonText: {
            color: colors.text,
            fontFamily: fonts.semibold,
            fontSize: 16,
        },

        // List styles
        listItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: space.sm,
            paddingHorizontal: space.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        listItemText: {
            fontSize: 16,
            fontFamily: fonts.body,
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
            bottom: space.lg,
            right: space.lg,
            backgroundColor: colors.locationButton,
            padding: space.sm,
            borderRadius: radius.sm,
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
            borderRadius: radius.lg,
            padding: space.lg,
            ...makeShadow(colors, "xl"),
        },

        // Utility styles
        divider: {
            height: 1,
            backgroundColor: colors.divider,
            marginVertical: space.xs,
        },
        spacer: {
            height: space.md,
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
            marginTop: space.md,
            marginBottom: space.xs,
            fontSize: 20,
            fontFamily: fonts.displaySemi,
            letterSpacing: -0.3,
            color: colors.text,
        },
        offlineBanner: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.warning,
            paddingVertical: space.xs,
            paddingHorizontal: space.md,
            marginHorizontal: space.md,
            marginBottom: space.xs,
            borderRadius: radius.pill,
            ...makeShadow(colors, "sm"),
        },
        offlineIcon: {
            marginRight: space.xs,
        },
        offlineBannerText: {
            color: ON_WARNING,
            fontSize: 13,
            fontFamily: fonts.bold,
            letterSpacing: 0.2,
        },
        flatListContainer: {
            paddingBottom: space.lg,
            paddingTop: space.xs,
        },
        filterEmptyState: {
            alignItems: "center",
            paddingVertical: space.xl,
            paddingHorizontal: space.md,
        },
        filterEmptyText: {
            fontSize: 15,
            fontFamily: fonts.medium,
            color: colors.secondaryText,
            marginBottom: space.sm,
        },
        filterClearButton: {
            paddingVertical: space.xs,
            paddingHorizontal: space.md,
            borderRadius: radius.pill,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.accentBorder,
        },
        filterClearButtonText: {
            fontSize: 14,
            fontFamily: fonts.semibold,
            color: colors.accent,
        },
        freshnessBadge: {
            fontSize: 12,
            fontFamily: fonts.semibold,
        },
        communityRow: {
            marginBottom: space.md,
        },
        communityStatusText: {
            fontSize: 13,
            fontFamily: fonts.semibold,
            marginBottom: space.xs,
        },
        communityActions: {
            flexDirection: "row",
            gap: space.xs,
        },
        communityButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: space.xxs + 2,
            paddingVertical: space.xs,
            paddingHorizontal: space.sm,
            borderRadius: radius.pill,
            backgroundColor: colors.surfaceMuted,
            borderWidth: 1,
            borderColor: colors.border,
        },
        communityButtonDisabled: {
            opacity: 0.5,
        },
        communityButtonText: {
            fontSize: 13,
            fontFamily: fonts.semibold,
            color: colors.text,
        },
        loadMoreButton: {
            alignSelf: "center",
            paddingVertical: space.sm,
            paddingHorizontal: space.md,
            marginTop: space.xs,
            marginBottom: space.xl,
        },
        loadMoreButtonDisabled: {
            opacity: 0.5,
        },
        loadMoreText: {
            color: colors.accent,
            fontFamily: fonts.bold,
            fontSize: 15,
        },
        card: {
            flexDirection: "row",
            alignItems: "stretch",
            marginHorizontal: space.md,
            marginVertical: space.xs,
            backgroundColor: colors.cardBackground,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            ...makeShadow(colors, "md"),
            overflow: "hidden",
        },
        cardImageContainer: {
            position: "relative",
            width: 76,
            height: 76,
            margin: space.sm,
        },
        image: {
            width: 76,
            height: 76,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceMuted,
        },
        emojiContainer: {
            width: 76,
            height: 76,
            borderRadius: radius.md,
            backgroundColor: colors.accentSoft,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.accentBorder,
        },
        emojiText: {
            fontSize: 38,
        },
        imageOverlay: {
            position: "absolute",
            bottom: -4,
            right: -4,
            backgroundColor: colors.accent,
            borderRadius: radius.pill,
            width: 26,
            height: 26,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: colors.cardBackground,
        },
        imageLoadingOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.isDark
                ? "rgba(42, 32, 26, 0.8)"
                : "rgba(251, 247, 238, 0.8)",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: radius.md,
        },
        cardContent: {
            flex: 1,
            paddingVertical: space.sm,
            paddingRight: space.md,
            justifyContent: "space-between",
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: space.xs,
        },
        cardDetails: {
            gap: space.xxs,
        },
        shopName: {
            fontSize: 18,
            fontFamily: fonts.bold,
            color: colors.text,
            flex: 1,
            marginRight: space.xs,
            letterSpacing: -0.2,
        },
        oatMilkRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: space.xs,
        },
        oatMilk: {
            fontFamily: fonts.medium,
            fontSize: 14,
            color: colors.text,
        },
        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: space.xs,
        },
        distanceText: {
            fontSize: 13,
            fontFamily: fonts.medium,
            color: colors.secondaryText,
        },
        upCharge: {
            fontSize: 15,
            fontFamily: fonts.semibold,
            color: colors.secondaryText,
            textAlign: "right",
            marginLeft: space.sm,
        },
        upchargeContainer: {
            backgroundColor: colors.surfaceMuted,
            paddingHorizontal: space.sm,
            paddingVertical: space.xxs + 2,
            borderRadius: radius.pill,
            alignSelf: "flex-start",
            borderWidth: 1,
            borderColor: colors.border,
        },
        upchargeEmojiText: {
            fontSize: 13,
            fontFamily: fonts.semibold,
        },
        shopIconContainer: {
            width: 50,
            height: 50,
            borderRadius: radius.pill,
            backgroundColor: colors.accentSoft,
            justifyContent: "center",
            alignItems: "center",
            marginRight: space.md,
            borderWidth: 2,
            borderColor: colors.accentBorder,
            ...makeShadow(colors, "sm"),
        },
        shopEmojiLarge: {
            fontSize: 28,
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
            fontFamily: fonts.medium,
            color: colors.secondaryText,
            letterSpacing: 0.3,
        },
        closeButtonTop: {
            position: "absolute",
            top: 50,
            left: space.lg,
            zIndex: 20,
        },
        closeButtonBackground: {
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.overlayBackground,
            justifyContent: "center",
            alignItems: "center",
            ...makeShadow(colors, "md"),
            borderWidth: 1,
            borderColor: colors.border,
        },
        adminFloatingButton: {
            position: "absolute",
            top: 50,
            right: space.lg,
            zIndex: 20,
        },
        adminFloatingBackground: {
            width: 44,
            height: 44,
            borderRadius: radius.pill,
            backgroundColor: colors.overlayBackground,
            justifyContent: "center",
            alignItems: "center",
            ...makeShadow(colors, "md"),
            borderWidth: 2,
            borderColor: colors.warning,
        },
        bottomSection: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: colors.overlayBackground,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            shadowColor: colors.shadow,
            shadowOffset: {width: 0, height: -10},
            shadowOpacity: colors.isDark ? 0.5 : 0.16,
            shadowRadius: 28,
            elevation: 24,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border,
        },
        bottomContent: {
            paddingHorizontal: space.xl,
            paddingTop: space.xxl,
            paddingBottom: space.xxxl,
        },
        shopNameSection: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: space.lg,
        },
        bottomEmojiContainer: {
            width: 54,
            height: 54,
            borderRadius: radius.pill,
            backgroundColor: colors.accentSoft,
            justifyContent: "center",
            alignItems: "center",
            marginRight: space.md,
            borderWidth: 2,
            borderColor: colors.accentBorder,
        },
        bottomEmoji: {
            fontSize: 26,
        },
        shopNameTextContainer: {
            flex: 1,
        },
        bottomShopName: {
            fontSize: 28,
            fontFamily: fonts.display,
            color: colors.text,
            marginBottom: 2,
            letterSpacing: -0.6,
        },
        bottomSubtitle: {
            fontSize: 14,
            fontFamily: fonts.medium,
            color: colors.secondaryText,
            letterSpacing: 0.2,
        },
        quickStats: {
            flexDirection: "row",
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.lg,
            padding: space.lg,
            marginTop: space.md,
            marginBottom: space.xl,
            borderWidth: 1,
            borderColor: colors.border,
        },
        statItem: {
            flex: 1,
            alignItems: "center",
        },
        statIcon: {
            width: 20,
            height: 20,
            marginBottom: space.xs,
            tintColor: colors.success,
        },
        statLabel: {
            fontSize: 12,
            fontFamily: fonts.medium,
            color: colors.secondaryText,
            marginBottom: space.xxs,
            textAlign: "center",
            letterSpacing: 0.2,
        },
        statValue: {
            fontSize: 14,
            fontFamily: fonts.bold,
            color: colors.text,
            textAlign: "center",
        },
        statDivider: {
            width: 1,
            backgroundColor: colors.divider,
            marginHorizontal: space.md,
        },
        actionButtons: {
            gap: space.sm,
            marginTop: space.lg,
        },
        primaryActionButton: {
            backgroundColor: colors.accent,
            paddingVertical: 16,
            borderRadius: radius.md,
            ...makeShadow(colors, "md"),
        },
        primaryButtonText: {
            color: colors.onAccent,
            fontSize: 15,
            fontFamily: fonts.bold,
            marginHorizontal: space.xs,
            letterSpacing: 0.2,
        },
        secondaryActions: {
            flexDirection: "row",
            gap: space.xs,
            marginTop: space.xs,
        },
        secondaryActionButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.surfaceMuted,
            paddingVertical: space.sm,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        favoriteActive: {
            backgroundColor: colors.favoriteSoft,
            borderColor: colors.favorite,
        },
        secondaryButtonText: {
            fontSize: 12,
            fontFamily: fonts.semibold,
            color: colors.secondaryText,
            marginLeft: space.xs,
            letterSpacing: 0.2,
        },
        locationButton: {
            position: "absolute",
            bottom: space.lg,
            right: space.lg,
            backgroundColor: colors.locationButton,
            width: 48,
            height: 48,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            ...makeShadow(colors, "md"),
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
            borderBottomLeftRadius: radius.xl,
            borderBottomRightRadius: radius.xl,
            overflow: "hidden",
            ...makeShadow(colors, "lg"),
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
            borderWidth: 1,
            borderColor: colors.accentBorder,
            pointerEvents: "none",
        },
        mapOverlayGradient: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 180,
            backgroundColor: "transparent",
            borderBottomLeftRadius: radius.xl,
            borderBottomRightRadius: radius.xl,
            pointerEvents: "none",
            shadowColor: colors.isDark ? colors.background : colors.overlayBackground,
            shadowOffset: {width: 0, height: -30},
            shadowOpacity: colors.isDark ? 0.95 : 0.9,
            shadowRadius: 30,
            elevation: 10,
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
            left: space.lg,
            backgroundColor: colors.locationButton,
            width: 46,
            height: 46,
            borderRadius: radius.pill,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            ...makeShadow(colors, "md"),
        },
        overlay: {
            flex: 1,
            backgroundColor: colors.modalBackground,
            justifyContent: "flex-start",
            alignItems: "flex-start",
        },
        menuContainer: {
            backgroundColor: colors.menuBackground,
            marginTop: 104,
            marginLeft: space.lg,
            borderRadius: radius.lg,
            paddingVertical: space.xs,
            minWidth: 210,
            borderWidth: 1,
            borderColor: colors.border,
            ...makeShadow(colors, "lg"),
        },
        menuItem: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: space.lg,
            paddingVertical: space.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
        },
        logoutMenuItem: {
            borderBottomWidth: 0,
        },
        menuIcon: {
            marginRight: space.md,
            width: 22,
            textAlign: "center",
        },
        menuText: {
            fontSize: 16,
            fontFamily: fonts.semibold,
            color: colors.text,
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
            paddingHorizontal: space.xl,
            backgroundColor: colors.background,
        },
        authLogo: {
            width: 116,
            height: 116,
            marginBottom: space.lg,
            borderRadius: radius.xl,
            resizeMode: "contain",
        },
        authTitle: {
            fontSize: 34,
            fontFamily: fonts.display,
            marginBottom: space.xs,
            color: colors.text,
            letterSpacing: -0.8,
            textAlign: "center",
        },
        authSubtitle: {
            fontSize: 16,
            fontFamily: fonts.body,
            color: colors.secondaryText,
            marginBottom: space.xl,
            textAlign: "center",
        },
        input: {
            width: "100%",
            height: 52,
            paddingHorizontal: space.md,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.sm,
            marginBottom: space.sm,
            fontSize: 16,
            fontFamily: fonts.body,
            backgroundColor: colors.inputBackground,
            color: colors.text,
        },
        authButton: {
            width: "100%",
            backgroundColor: colors.accent,
            paddingVertical: 16,
            borderRadius: radius.md,
            marginBottom: space.sm,
            alignItems: "center",
            ...makeShadow(colors, "sm"),
        },
        authButtonSecondary: {
            width: "100%",
            backgroundColor: colors.surfaceMuted,
            paddingVertical: 16,
            borderRadius: radius.md,
            marginBottom: space.sm,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
        },
        authButtonText: {
            color: colors.onAccent,
            fontFamily: fonts.bold,
            fontSize: 16,
        },
        authButtonSecondaryText: {
            color: colors.text,
            fontFamily: fonts.bold,
            fontSize: 16,
        },
        authButtonDisabled: {
            opacity: 0.6,
        },
        errorText: {
            width: "100%",
            color: colors.danger,
            fontSize: 14,
            fontFamily: fonts.medium,
            marginBottom: space.sm,
            paddingHorizontal: space.xxs,
            textAlign: "left",
        },

        // Common modal styles
        modalHeader: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: space.lg,
            paddingTop: 50,
            paddingBottom: space.lg,
        },
        modalTitle: {
            fontSize: 20,
            fontFamily: fonts.display,
            color: colors.text,
            flex: 1,
            textAlign: "center",
        },
        modalCloseButton: {
            position: "absolute",
            right: space.lg,
        },

        // Common map styles
        mapContainer: {
            width: "100%",
            height: 220,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
        },
    });
};
