import React from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import MapView, { Marker } from "react-native-maps";
import FreeMapView from "./FreeMapView";
import { openInMaps, searchYelp } from "../utils/MapLinks";
import { getFormattedUpcharge } from "../utils/upchargeEmojis";
import { useTheme } from "../contexts/ThemeContext";
import { fonts, makeShadow, radius, space } from "../styles/tokens";

const PendingShopCard = ({
    item,
    onApprove,
    onReject,
    onAdjustPin,
    onEditDetails,
    onEditAll,
    isProcessing
}) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const markers = [
        {
            key: item.id,
            coordinate: {
                latitude: item.location.latitude,
                longitude: item.location.longitude,
            },
            title: item.name,
        },
    ];

    return (
        <View style={[styles.itemContainer, { backgroundColor: colors.cardBackground }]}>
            {/* Status Badge */}
            <View style={styles.statusBadge}>
                <FontAwesome6 name="clock" size={10} color={colors.warning} iconStyle="solid" />
                <Text style={styles.statusBadgeText}>PENDING REVIEW</Text>
            </View>

            {/* Settings/Cog Button */}
            {onEditAll && (
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => onEditAll(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit all details for ${item.name}`}
                >
                    <FontAwesome6 name="gear" size={16} color={colors.icon} iconStyle="solid" />
                </TouchableOpacity>
            )}

            {/* Header with Emoji and Shop Info */}
            <View style={styles.itemHeader}>
                <TouchableOpacity
                    style={styles.emojiContainer}
                    onPress={() => onEditDetails && onEditDetails(item)}
                    accessibilityRole="button"
                    accessibilityLabel="Edit shop emoji and oat milk"
                >
                    <Text style={styles.emojiLarge}>{item.emoji || "☕"}</Text>
                    <View style={styles.editBadge}>
                        <FontAwesome6 name="pencil" size={10} color={colors.onAccent} iconStyle="solid" />
                    </View>
                </TouchableOpacity>
                <View style={styles.itemTitleContainer}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.name}
                    </Text>
                    <TouchableOpacity
                        style={styles.infoRow}
                        onPress={() => onEditDetails && onEditDetails(item)}
                        accessibilityRole="button"
                        accessibilityLabel="Edit oat milk brand"
                    >
                        <FontAwesome6 name="mug-hot" size={12} color={colors.secondaryText} iconStyle="solid" />
                        <Text style={[styles.itemSubtitle, { color: colors.secondaryText }]}>
                            {item.oatMilk}
                        </Text>
                        <FontAwesome6 name="pencil" size={10} color={colors.secondaryText} iconStyle="solid" style={styles.editIcon} />
                    </TouchableOpacity>
                    <View style={styles.infoRow}>
                        <FontAwesome6 name="money-bill" size={12} color={colors.success} iconStyle="solid" />
                        <Text style={[styles.itemSubtitle, { color: colors.secondaryText }]}>
                            {getFormattedUpcharge(item.upCharge, item.isFree)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Metadata */}
            <View style={[styles.metadataContainer, { backgroundColor: colors.inputBackground }]}>
                <View style={styles.metadataRow}>
                    <FontAwesome6 name="calendar" size={12} color={colors.secondaryText} iconStyle="solid" />
                    <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                        Submitted: {item.createdAt
                            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                            : "Unknown"}
                    </Text>
                </View>
                <View style={styles.metadataRow}>
                    <FontAwesome6 name="user" size={12} color={colors.secondaryText} iconStyle="solid" />
                    <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                        User: {item.createdBy?.substring(0, 8)}...
                    </Text>
                </View>
            </View>

            {/* Map Section */}
            {item.location && (
                <View style={styles.mapContainer}>
                    {Platform.OS === "android" ? (
                        <FreeMapView
                            style={styles.map}
                            initialRegion={{
                                latitude: item.location.latitude,
                                longitude: item.location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            markers={markers}
                        />
                    ) : (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: item.location.latitude,
                                longitude: item.location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            <Marker
                                coordinate={{
                                    latitude: item.location.latitude,
                                    longitude: item.location.longitude,
                                }}
                                title={item.name}
                                description={`Oat Milk: ${item.oatMilk}`}
                            />
                        </MapView>
                    )}

                    <View style={styles.mapButtonsContainer}>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => openInMaps(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${item.name} location in maps`}
                        >
                            <FontAwesome6 name="location-arrow" size={14} color="#fff" iconStyle="solid" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => searchYelp(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Search ${item.name} on Yelp`}
                        >
                            <FontAwesome6 name="magnifying-glass" size={14} color="#fff" iconStyle="solid" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.mapButton, styles.adjustPinButton]}
                            onPress={() => onAdjustPin(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Adjust pin location for ${item.name}`}
                        >
                            <FontAwesome6 name="crosshairs" size={14} color="#fff" iconStyle="solid" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.approveButton, isProcessing && styles.disabledButton]}
                    onPress={() => onApprove(item)}
                    disabled={isProcessing}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${item.name} coffee shop submission`}
                    accessibilityHint="Double tap to approve this shop submission"
                >
                    <FontAwesome6
                        name={isProcessing ? "spinner" : "circle-check"}
                        size={16}
                        color={colors.onAccent}
                        iconStyle="solid"
                    />
                    <Text style={styles.approveButtonText}>
                        {isProcessing ? "Processing..." : "Approve"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.rejectButton, isProcessing && styles.disabledButton]}
                    onPress={() => onReject(item)}
                    disabled={isProcessing}
                    accessibilityRole="button"
                    accessibilityLabel={`Reject ${item.name} coffee shop submission`}
                    accessibilityHint="Double tap to reject this shop submission"
                >
                    <FontAwesome6 name="circle-xmark" size={16} color={colors.onAccent} iconStyle="solid" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    itemContainer: {
        marginVertical: space.xs,
        marginHorizontal: space.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...makeShadow(colors, "md"),
        overflow: "hidden",
    },
    statusBadge: {
        position: "absolute",
        top: space.sm,
        right: space.sm,
        backgroundColor: colors.warningSoft,
        paddingHorizontal: space.sm,
        paddingVertical: space.xxs + 2,
        borderRadius: radius.pill,
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        zIndex: 10,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    settingsButton: {
        position: "absolute",
        top: space.sm,
        left: space.sm,
        backgroundColor: colors.surfaceMuted,
        padding: space.sm,
        borderRadius: radius.pill,
        zIndex: 10,
        ...makeShadow(colors, "sm"),
        borderWidth: 1,
        borderColor: colors.border,
    },
    statusBadgeText: {
        color: colors.warning,
        fontSize: 10,
        fontFamily: fonts.bold,
        letterSpacing: 0.6,
    },
    itemHeader: {
        flexDirection: "row",
        padding: space.lg,
        paddingTop: space.xl,
        alignItems: "center",
    },
    emojiContainer: {
        width: 70,
        height: 70,
        backgroundColor: colors.accentSoft,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        marginRight: space.md,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        position: "relative",
    },
    editBadge: {
        position: "absolute",
        bottom: -4,
        right: -4,
        backgroundColor: colors.accent,
        borderRadius: radius.pill,
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.cardBackground,
    },
    editIcon: {
        marginLeft: space.xs,
    },
    emojiLarge: {
        fontSize: 36,
    },
    itemTitleContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        marginBottom: space.xs,
        letterSpacing: -0.3,
    },
    itemSubtitle: {
        fontSize: 14,
        fontFamily: fonts.medium,
        marginLeft: space.xs,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: space.xs,
        gap: space.xs,
    },
    metadataContainer: {
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.divider,
    },
    metadataRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
    },
    metadataText: {
        fontSize: 12,
        fontFamily: fonts.medium,
    },
    mapContainer: {
        width: "100%",
        height: 160,
        overflow: "hidden",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.divider,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapButtonsContainer: {
        position: "absolute",
        top: space.sm,
        right: space.sm,
        flexDirection: "row",
        gap: space.xs,
    },
    mapButton: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        padding: space.sm,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        ...makeShadow(colors, "sm"),
    },
    adjustPinButton: {
        backgroundColor: colors.warning,
    },
    buttonContainer: {
        flexDirection: "row",
        padding: space.md,
        gap: space.sm,
    },
    approveButton: {
        flex: 1,
        backgroundColor: colors.success,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: space.xs,
        ...makeShadow(colors, "sm"),
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.danger,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: space.xs,
        ...makeShadow(colors, "sm"),
    },
    disabledButton: {
        opacity: 0.5,
    },
    approveButtonText: {
        color: colors.onAccent,
        fontFamily: fonts.bold,
        fontSize: 16,
    },
    rejectButtonText: {
        color: colors.onAccent,
        fontFamily: fonts.bold,
        fontSize: 16,
    },
});

PendingShopCard.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        emoji: PropTypes.string,
        oatMilk: PropTypes.string.isRequired,
        upCharge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        isFree: PropTypes.bool,
        createdAt: PropTypes.object,
        createdBy: PropTypes.string,
        location: PropTypes.shape({
            latitude: PropTypes.number.isRequired,
            longitude: PropTypes.number.isRequired,
        }),
    }).isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    onAdjustPin: PropTypes.func.isRequired,
    onEditDetails: PropTypes.func,
    onEditAll: PropTypes.func,
    isProcessing: PropTypes.bool.isRequired,
};

export default React.memo(PendingShopCard);