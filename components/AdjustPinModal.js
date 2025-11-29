import React, {useEffect, useRef, useState} from "react";
import {Alert, Platform, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import {generateGeohash} from "../utils/GeoHashUtils";
import MapView from "react-native-maps";
import FreeMapView from "./FreeMapView";
import {useTheme} from "../contexts/ThemeContext";

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
            // Calculate new geohash for updated location
            const newGeohash = generateGeohash(mapCenter.latitude, mapCenter.longitude);

            // Update the shop's location in the database
            const shopRef = doc(db, collection, shop.id);
            await updateDoc(shopRef, {
                location: {
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                },
                geohash: newGeohash,
            });

            // Create the updated shop object
            const updatedShop = {
                ...shop,
                location: {
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                },
                geohash: newGeohash,
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
                                color="#FF3B30"
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
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    shopName: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 10,
    },
    instructions: {
        fontSize: 14,
        color: colors.secondaryText,
        marginBottom: 20,
        fontStyle: "italic",
    },
    mapContainer: {
        height: 400,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
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
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    coordinatesContainer: {
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: colors.isDark ? "rgba(15, 26, 46, 0.9)" : "rgba(255, 255, 255, 0.9)",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    coordinatesText: {
        fontSize: 12,
        color: colors.text,
        textAlign: "center",
    },
    loadingContainer: {
        height: 400,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    loadingText: {
        fontSize: 16,
        color: colors.secondaryText,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.secondaryBackground,
        paddingVertical: 15,
        borderRadius: 8,
        marginRight: 10,
        alignItems: "center",
    },
    cancelButtonText: {
        color: colors.secondaryText,
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 2,
        backgroundColor: colors.primary,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: colors.isDark ? colors.secondaryBackground : "#ccc",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AdjustPinModal;
