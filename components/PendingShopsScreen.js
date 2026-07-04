import React, {useEffect, useState} from "react";
import {ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import {collection, deleteDoc, doc, onSnapshot, query, where,} from "firebase/firestore";
import {auth, db} from "../services/firebase";
import {openInMaps, searchYelp} from "../utils/MapLinks";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import MapView, {Marker} from "react-native-maps";
import FreeMapView from "./FreeMapView";
import {useTheme} from "../contexts/ThemeContext";
import {fonts, makeShadow, radius, space} from "../styles/tokens";
import Constants from "expo-constants";

const PendingShopsScreen = ({onClose}) => {
    const {isDark, colors} = useTheme();
    const [pendingShops, setPendingShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        // Query pendingShops collection for shops created by the current user
        const q = query(
            collection(db, "pendingShops"),
            where("createdBy", "==", auth.currentUser.uid),
        );

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const shops = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPendingShops(shops);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching pending shops:", error);
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, []);

    const handleDelete = (shopId) => {
        Alert.alert(
            "Delete Submission",
            "Are you sure you want to delete this pending shop submission?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "pendingShops", shopId));
                            Alert.alert("Success", "Shop submission deleted successfully");
                        } catch (error) {
                            console.error("Error deleting shop:", error);
                            Alert.alert("Error", "Failed to delete shop submission");
                        }
                    },
                },
            ],
        );
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={20} color={colors.icon} iconStyle="solid"/>
                </TouchableOpacity>
                <Text style={styles.title}>My Pending Shops</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent}/>
                    <Text style={styles.loadingText}>Loading your submissions...</Text>
                </View>
            ) : pendingShops.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome6 name="store" size={50} color={colors.tertiaryText} iconStyle="solid"/>
                    <Text style={styles.emptyText}>
                        You don't have any pending shop submissions
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Submit a new shop to see it here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pendingShops}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({item}) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardImageContainer}>
                                    <View style={styles.emojiContainer}>
                                        <Text style={styles.emojiText}>{item.emoji || "☕"}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>Pending</Text>
                                    </View>
                                </View>
                                <View style={styles.cardHeaderInfo}>
                                    <Text style={styles.shopName}>{item.name}</Text>
                                    <View style={styles.detailRow}>
                                        <FontAwesome6
                                            name="seedling"
                                            size={12}
                                            color={colors.success}
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.detailText}>{item.oatMilk}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <FontAwesome6
                                            name="money-bill"
                                            size={12}
                                            color={colors.secondaryText}
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.detailText}>
                                            Upcharge: {item.upCharge}
                                        </Text>
                                    </View>
                                </View>
                            </View>

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
                                            markers={[
                                                {
                                                    key: item.id,
                                                    coordinate: {
                                                        latitude: item.location.latitude,
                                                        longitude: item.location.longitude,
                                                    },
                                                    title: item.name,
                                                },
                                            ]}
                                        />
                                    ) : (
                                        <MapView
                                            style={styles.map}
                                            mapType="standard"
                                            userInterfaceStyle={isDark ? "dark" : "light"}
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
                                            />
                                        </MapView>
                                    )}
                                    <View style={styles.mapButtonsContainer}>
                                        <TouchableOpacity
                                            style={styles.mapButton}
                                            onPress={() => openInMaps(item)}
                                        >
                                            <FontAwesome6
                                                name="map-location-dot"
                                                size={14}
                                                color={colors.accent}
                                                iconStyle="solid"
                                            />
                                            <Text style={styles.mapButtonText}>Open in Maps</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.mapButton}
                                            onPress={() => searchYelp(item)}
                                        >
                                            <FontAwesome6
                                                name="magnifying-glass"
                                                size={14}
                                                color="#D32323"
                                                iconStyle="solid"
                                            />
                                            <Text style={styles.mapButtonText}>Search on Yelp</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <View style={styles.cardContent}>
                                <View style={styles.detailRow}>
                                    <FontAwesome6
                                        name="calendar"
                                        size={12}
                                        color={colors.secondaryText}
                                        iconStyle="solid"
                                    />
                                    <Text style={styles.detailText}>
                                        Submitted:{" "}
                                        {item.createdAt?.toDate().toLocaleDateString() || "Unknown"}
                                    </Text>
                                </View>
                                {item.location && (
                                    <View style={styles.detailRow}>
                                        <FontAwesome6
                                            name="location-dot"
                                            size={12}
                                            color={colors.secondaryText}
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.detailText}>
                                            Location: {item.location.latitude.toFixed(6)},{" "}
                                            {item.location.longitude.toFixed(6)}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <FontAwesome6
                                        name="trash"
                                        size={14}
                                        color={colors.danger}
                                        iconStyle="solid"
                                    />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mapContainer: {
        width: "100%",
        height: 220,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    map: {
        width: "100%",
        height: 180,
    },
    mapButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: space.xs,
        backgroundColor: colors.secondaryBackground,
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: space.xs,
        paddingHorizontal: space.sm,
        borderRadius: radius.sm,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.border,
    },
    mapButtonText: {
        fontSize: 12,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginLeft: space.xs,
    },
    emojiContainer: {
        width: 100,
        height: 100,
        backgroundColor: colors.accentSoft,
        justifyContent: "center",
        alignItems: "center",
    },
    emojiText: {
        fontSize: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: space.lg,
        paddingTop: Constants.statusBarHeight + space.sm,
        paddingBottom: space.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        padding: space.xxs,
        marginRight: space.md,
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.display,
        color: colors.text,
        letterSpacing: -0.4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: space.sm,
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.secondaryText,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: space.xxl,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginTop: space.lg,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        marginTop: space.sm,
        textAlign: "center",
    },
    listContainer: {
        padding: space.md,
    },
    card: {
        flexDirection: "column",
        backgroundColor: colors.cardBackground,
        borderRadius: radius.lg,
        marginBottom: space.md,
        ...makeShadow(colors, "md"),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        padding: space.sm,
    },
    cardHeaderInfo: {
        flex: 1,
        marginLeft: space.sm,
        justifyContent: "center",
    },
    cardImageContainer: {
        position: "relative",
        width: 100,
        height: 100,
    },
    image: {
        width: 100,
        height: 100,
        backgroundColor: colors.secondaryBackground,
    },
    imageLoadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlayBackground,
        alignItems: "center",
        justifyContent: "center",
    },
    statusBadge: {
        position: "absolute",
        top: space.xs,
        right: space.xs,
        backgroundColor: colors.warningSoft,
        paddingHorizontal: space.xs,
        paddingVertical: space.xxs,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    statusText: {
        color: colors.warning,
        fontSize: 10,
        fontFamily: fonts.bold,
        letterSpacing: 0.4,
    },
    cardContent: {
        flex: 1,
        padding: space.md,
        paddingTop: space.sm,
    },
    shopName: {
        fontSize: 17,
        fontFamily: fonts.bold,
        color: colors.text,
        marginBottom: space.xs,
        letterSpacing: -0.2,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: space.xs,
    },
    detailText: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
        marginLeft: space.xs,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        marginTop: space.xs,
        paddingVertical: space.xs,
        paddingHorizontal: space.sm,
        borderRadius: radius.sm,
        backgroundColor: colors.dangerSoft,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    deleteButtonText: {
        fontSize: 12,
        color: colors.danger,
        fontFamily: fonts.semibold,
        marginLeft: space.xxs,
    },
});

export default PendingShopsScreen;
