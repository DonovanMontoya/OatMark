import React from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import PlatformMap from "./PlatformMap";
import { openInMaps, searchYelp } from "../utils/MapLinks";
import { getFormattedUpcharge } from "../utils/upchargeEmojis";
import { useTheme } from "../contexts/ThemeContext";
import { createThemeStyles } from "../styles/ThemeStyles";

const PendingShopCard = ({ 
    item, 
    onApprove, 
    onReject, 
    onAdjustPin, 
    isProcessing 
}) => {
    const { colors } = useTheme();
    const commonStyles = createThemeStyles(colors);

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
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <View style={styles.itemTitleContainer}>
                    <Text style={styles.itemTitle}>
                        {item.emoji} {item.name}
                    </Text>
                    <Text style={styles.itemSubtitle}>
                        {item.oatMilk} - {getFormattedUpcharge(item.upCharge, item.isFree)}
                    </Text>
                </View>
            </View>

            <View style={styles.itemContent}>
                <Text style={styles.itemDetail}>
                    <Text style={styles.itemDetailLabel}>Submitted:</Text>{" "}
                    {item.createdAt
                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
                        : "Unknown"}
                </Text>
                <Text style={styles.itemDetail}>
                    <Text style={styles.itemDetailLabel}>By:</Text>{" "}
                    {item.createdBy?.substring(0, 8)}...
                </Text>
            </View>

            {item.location && (
                <View style={commonStyles.mapContainer}>
                    <PlatformMap
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
                    
                    <View style={styles.mapButtonsContainer}>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => openInMaps(item.location.latitude, item.location.longitude)}
                            accessibilityRole="button"
                            accessibilityLabel={`Open ${item.name} location in maps`}
                        >
                            <FontAwesome6 name="location-arrow" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mapButton}
                            onPress={() => searchYelp(item.name, item.location.latitude, item.location.longitude)}
                            accessibilityRole="button"
                            accessibilityLabel={`Search ${item.name} on Yelp`}
                        >
                            <FontAwesome6 name="magnifying-glass" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.mapButton, styles.adjustPinButton]}
                            onPress={() => onAdjustPin(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`Adjust pin location for ${item.name}`}
                        >
                            <FontAwesome6 name="crosshairs" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.approveButton, isProcessing && styles.disabledButton]}
                    onPress={() => onApprove(item)}
                    disabled={isProcessing}
                    accessibilityRole="button"
                    accessibilityLabel={`Approve ${item.name} coffee shop submission`}
                    accessibilityHint="Double tap to approve this shop submission"
                >
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
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: "#fff",
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    itemTitleContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 14,
        color: "#666",
    },
    itemContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    itemDetail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    itemDetailLabel: {
        fontWeight: "600",
        color: "#333",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapButtonsContainer: {
        position: "absolute",
        top: 10,
        right: 10,
        flexDirection: "row",
        gap: 8,
    },
    mapButton: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 8,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
    },
    adjustPinButton: {
        backgroundColor: "rgba(255, 149, 0, 0.9)",
    },
    buttonContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    approveButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#f44336",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.6,
    },
    approveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    rejectButtonText: {
        color: "#fff",
        fontWeight: "600",
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