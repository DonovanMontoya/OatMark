import React from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import MapView, { Marker } from "react-native-maps";
import FreeMapView from "./FreeMapView";
import { openInMaps, searchYelp } from "../utils/MapLinks";
import { getFormattedUpcharge } from "../utils/upchargeEmojis";
import { useTheme } from "../contexts/ThemeContext";

const PendingShopCard = ({
    item,
    onApprove,
    onReject,
    onAdjustPin,
    isProcessing
}) => {
    const { colors } = useTheme();

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
                <FontAwesome6 name="clock" size={10} color="#fff" iconStyle="solid" />
                <Text style={styles.statusBadgeText}>PENDING REVIEW</Text>
            </View>

            {/* Header with Emoji and Shop Info */}
            <View style={styles.itemHeader}>
                <View style={styles.emojiContainer}>
                    <Text style={styles.emojiLarge}>{item.emoji || "☕"}</Text>
                </View>
                <View style={styles.itemTitleContainer}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.name}
                    </Text>
                    <View style={styles.infoRow}>
                        <FontAwesome6 name="mug-hot" size={12} color={colors.secondaryText} iconStyle="solid" />
                        <Text style={[styles.itemSubtitle, { color: colors.secondaryText }]}>
                            {item.oatMilk}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <FontAwesome6 name="money-bill" size={12} color="#4CAF50" iconStyle="solid" />
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
                        color="#fff"
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
                    <FontAwesome6 name="circle-xmark" size={16} color="#fff" iconStyle="solid" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        overflow: "hidden",
    },
    statusBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#FF9500",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    statusBadgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    itemHeader: {
        flexDirection: "row",
        padding: 20,
        paddingTop: 24,
        alignItems: "center",
    },
    emojiContainer: {
        width: 70,
        height: 70,
        backgroundColor: "#F5F5F5",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    emojiLarge: {
        fontSize: 36,
    },
    itemTitleContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    itemSubtitle: {
        fontSize: 14,
        marginLeft: 6,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 6,
    },
    metadataContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    metadataRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    metadataText: {
        fontSize: 12,
        fontWeight: "500",
    },
    mapContainer: {
        width: "100%",
        height: 160,
        overflow: "hidden",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapButtonsContainer: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        gap: 10,
    },
    mapButton: {
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        padding: 10,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    adjustPinButton: {
        backgroundColor: "#FF9500",
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    approveButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#4CAF50",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#FF3B30",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        shadowColor: "#FF3B30",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    approveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    rejectButtonText: {
        color: "#fff",
        fontWeight: "700",
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
    isProcessing: PropTypes.bool.isRequired,
};

export default React.memo(PendingShopCard);