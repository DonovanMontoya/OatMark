import React, {useEffect, useRef, useState} from "react";
import {Alert, Platform, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import MapView from "react-native-maps";
import FreeMapView from "./FreeMapView";
import {useTheme} from "../contexts/ThemeContext";
import {fonts, radius, space} from "../styles/tokens";

const AdjustPinModal = ({
                            shop,
                            onClose,
                            onSave,
                            collection = "pendingShops",
                        }) => {
    const {isDark, colors} = useTheme();
    // State variables
    const [mapCenter, setMapCenter] = useState(null);
    const [isMapDragging, setIsMapDragging] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Map reference
    const mapRef = useRef(null);

    // Initialize a map center with the shop's current location
    useEffect(() => {
        if (shop && shop.location) {
            setMapCenter({
                latitude: shop.location.latitude,
                longitude: shop.location.longitude,
            });
        }
    }, [shop]);

    // Handle map region change start
    const onRegionChangeStart = () => {
        setIsMapDragging(true);
    };

    // Handle map region change complete
    const onRegionChangeComplete = (region) => {
        setIsMapDragging(false);

        // Update map center
        setMapCenter({
            latitude: region.latitude,
            longitude: region.longitude,
        });
    };

    // Save the updated location
    const handleSave = async () => {
        if (!mapCenter) {
            Alert.alert("Error", "Unable to determine location");
            return;
        }

        setIsSaving(true);

        try {
            // Update the shop's location in the database
            const shopRef = doc(db, collection, shop.id);
            await updateDoc(shopRef, {
                location: {
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                },
            });

            // Create the updated shop object
            const updatedShop = {
                ...shop,
                location: {
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                },
            };

            // Call onSave callback with updated shop
            onSave(updatedShop);

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error updating shop location:", error);
            Alert.alert("Error", "Failed to update shop location");
        } finally {
            setIsSaving(false);
        }
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={20} color={colors.icon} iconStyle="solid"/>
                </TouchableOpacity>
                <Text style={styles.title}>Adjust Pin Location</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.shopName}>{shop?.name}</Text>

                <Text style={styles.instructions}>
                    Drag the map to adjust the pin location for this shop
                </Text>

                {mapCenter ? (
                    <View style={styles.mapContainer}>
                        <View style={styles.fixedPinContainer}>
                            <FontAwesome6
                                name="map-pin"
                                size={36}
                                color={colors.danger}
                                iconStyle="solid"
                                style={styles.fixedPin}
                            />
                        </View>
                        {Platform.OS === "android" ? (
                            <FreeMapView
                                ref={mapRef}
                                style={styles.map}
                                onRegionChangeComplete={onRegionChangeComplete}
                                onRegionChange={onRegionChangeStart}
                                initialRegion={{
                                    latitude: mapCenter.latitude,
                                    longitude: mapCenter.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            />
                        ) : (
                            <MapView
                                ref={mapRef}
                                style={styles.map}
                                mapType="standard"
                                userInterfaceStyle={isDark ? "dark" : "light"}
                                onRegionChangeComplete={onRegionChangeComplete}
                                onRegionChange={onRegionChangeStart}
                                initialRegion={{
                                    latitude: mapCenter.latitude,
                                    longitude: mapCenter.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            />
                        )}

                        <View style={styles.coordinatesContainer}>
                            <Text style={styles.coordinatesText}>
                                {isMapDragging
                                    ? "Dragging map..."
                                    : "Latitude: " +
                                    mapCenter.latitude.toFixed(6) +
                                    ", Longitude: " +
                                    mapCenter.longitude.toFixed(6)}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading map...</Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? "Saving..." : "Save Location"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        padding: 5,
        marginRight: 15,
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.display,
        color: colors.text,
        letterSpacing: -0.4,
    },
    content: {
        flex: 1,
        padding: space.lg,
    },
    shopName: {
        fontSize: 18,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginBottom: space.sm,
    },
    instructions: {
        fontSize: 14,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        marginBottom: space.lg,
        fontStyle: "italic",
    },
    mapContainer: {
        height: 400,
        borderRadius: radius.md,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: space.lg,
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    fixedPinContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        pointerEvents: "none", // Allow touches to pass through to the map
    },
    fixedPin: {
        marginBottom: 36, // Offset to account for the pin's anchor point
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    coordinatesContainer: {
        position: "absolute",
        bottom: space.sm,
        left: space.sm,
        right: space.sm,
        backgroundColor: colors.overlayBackground,
        paddingVertical: space.xs,
        paddingHorizontal: space.sm,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    coordinatesText: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.text,
        textAlign: "center",
    },
    loadingContainer: {
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.secondaryText,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: space.lg,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.surfaceMuted,
        paddingVertical: 16,
        borderRadius: radius.md,
        marginRight: space.sm,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.semibold,
    },
    saveButton: {
        flex: 2,
        backgroundColor: colors.accent,
        paddingVertical: 16,
        borderRadius: radius.md,
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: colors.surfaceMuted,
    },
    saveButtonText: {
        color: colors.onAccent,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
});

export default AdjustPinModal;
