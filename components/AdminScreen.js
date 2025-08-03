import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {addDoc, collection, deleteDoc, doc, onSnapshot, query,} from "firebase/firestore";
import {auth, db} from "../services/firebase";
import {openInMaps, searchYelp} from "../utils/MapLinks";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import {getIdTokenResult} from "firebase/auth";
import MapView, {Marker} from "react-native-maps";
import FreeMapView from "./FreeMapView";
import AdjustPinModal from "./AdjustPinModal";

const AdminScreen = ({onClose}) => {
    const [pendingShops, setPendingShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdjustPinModal, setShowAdjustPinModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);

    useEffect(() => {
        // Check if the current user is an admin and load pending shops if so
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const checkAdminAndLoad = async () => {
            try {
                const tokenResult = await getIdTokenResult(auth.currentUser);
                const isAdmin = !!tokenResult.claims.admin;
                setIsAdmin(isAdmin);

                if (!isAdmin) {
                    setLoading(false);
                    return;
                }

                // Fetch live updates to the pendingShops collection
                const q = query(collection(db, "pendingShops"));
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
            } catch (error) {
                console.error("Failed to fetch token:", error);
                setLoading(false);
            }
        };

        let unsubscribeFunction;

        const loadData = async () => {
            unsubscribeFunction = await checkAdminAndLoad();
        };

        // Use immediately invoked async function to properly handle the promise
        (async () => {
            try {
                await loadData();
            } catch (error) {
                console.error("Error in loadData:", error);
                setLoading(false);
            }
        })();

        // Return cleanup function
        return () => {
            if (unsubscribeFunction) {
                unsubscribeFunction();
            }
        };
    }, []);

    const handleApprove = async (shop) => {
        Alert.alert(
            "Approve Shop",
            `Are you sure you want to approve "${shop.name}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Approve",
                    style: "default",
                    onPress: async () => {
                        try {
                            // 1. Add to the coffee_shops collection
                            await addDoc(collection(db, "coffee_shops"), {
                                name: shop.name,
                                oatMilk: shop.oatMilk,
                                upCharge: shop.upCharge,
                                emoji: shop.emoji || "☕",
                                location: shop.location,
                                createdAt: shop.createdAt || new Date(),
                                approvedAt: new Date(),
                                approvedBy: auth.currentUser.uid,
                            });

                            // 2. Delete it from the pendingShops collection
                            await deleteDoc(doc(db, "pendingShops", shop.id));

                            Alert.alert(
                                "Success",
                                "Shop approved and published successfully",
                            );
                        } catch (error) {
                            console.error("Error approving shop:", error);
                            Alert.alert("Error", "Failed to approve shop");
                        }
                    },
                },
            ],
        );
    };

    const handleReject = (shopId) => {
        Alert.alert(
            "Reject Submission",
            "Are you sure you want to reject this shop submission?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "pendingShops", shopId));
                            Alert.alert("Success", "Shop submission rejected and deleted");
                        } catch (error) {
                            console.error("Error rejecting shop:", error);
                            Alert.alert("Error", "Failed to reject shop submission");
                        }
                    },
                },
            ],
        );
    };

    if (!isAdmin) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <FontAwesome6
                            name="xmark"
                            size={20}
                            color="#333"
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>Admin Panel</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <FontAwesome6
                        name="lock"
                        size={50}
                        color="#cc0000"
                        iconStyle="solid"
                    />
                    <Text style={styles.emptyText}>Access Denied</Text>
                    <Text style={styles.emptySubtext}>
                        You don't have admin privileges
                    </Text>
                </View>
            </View>
        );
    }

    // Handle shop location update
    const handleShopLocationUpdate = (updatedShop) => {
        // Update the shop in the local state
        const updatedShops = pendingShops.map((shop) =>
            shop.id === updatedShop.id ? updatedShop : shop,
        );
        setPendingShops(updatedShops);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid"/>
                </TouchableOpacity>
                <Text style={styles.title}>Admin Panel</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285F4"/>
                    <Text style={styles.loadingText}>Loading pending submissions...</Text>
                </View>
            ) : pendingShops.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome6
                        name="circle-check"
                        size={50}
                        color="#4CAF50"
                        iconStyle="solid"
                    />
                    <Text style={styles.emptyText}>No Pending Submissions</Text>
                    <Text style={styles.emptySubtext}>
                        All shop submissions have been reviewed
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
                                            color="#4CAF50"
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.detailText}>{item.oatMilk}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <FontAwesome6
                                            name="money-bill"
                                            size={12}
                                            color="#666"
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
                                                color="#4285F4"
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
                                        <TouchableOpacity
                                            style={styles.mapButton}
                                            onPress={() => {
                                                setSelectedShop(item);
                                                setShowAdjustPinModal(true);
                                            }}
                                        >
                                            <FontAwesome6
                                                name="location-crosshairs"
                                                size={14}
                                                color="#FF9500"
                                                iconStyle="solid"
                                            />
                                            <Text style={styles.mapButtonText}>Adjust Pin</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            <View style={styles.cardContent}>
                                <View style={styles.detailRow}>
                                    <FontAwesome6
                                        name="calendar"
                                        size={12}
                                        color="#666"
                                        iconStyle="solid"
                                    />
                                    <Text style={styles.detailText}>
                                        Submitted:{" "}
                                        {item.createdAt?.toDate().toLocaleDateString() || "Unknown"}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <FontAwesome6
                                        name="user"
                                        size={12}
                                        color="#666"
                                        iconStyle="solid"
                                    />
                                    <Text style={styles.detailText}>
                                        By: {item.createdBy?.substring(0, 8)}...
                                    </Text>
                                </View>
                                {item.location && (
                                    <View style={styles.detailRow}>
                                        <FontAwesome6
                                            name="location-dot"
                                            size={12}
                                            color="#666"
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.detailText}>
                                            Location: {item.location.latitude.toFixed(6)},{" "}
                                            {item.location.longitude.toFixed(6)}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.approveButton}
                                        onPress={() => handleApprove(item)}
                                    >
                                        <FontAwesome6
                                            name="check"
                                            size={14}
                                            color="#4CAF50"
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rejectButton}
                                        onPress={() => handleReject(item.id)}
                                    >
                                        <FontAwesome6
                                            name="xmark"
                                            size={14}
                                            color="#FF3B30"
                                            iconStyle="solid"
                                        />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Adjust Pin Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showAdjustPinModal}
                onRequestClose={() => setShowAdjustPinModal(false)}
            >
                {selectedShop && (
                    <AdjustPinModal
                        shop={selectedShop}
                        onClose={() => setShowAdjustPinModal(false)}
                        onSave={handleShopLocationUpdate}
                    />
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    mapContainer: {
        width: "100%",
        height: 220,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#f0f0f0",
        overflow: "hidden",
    },
    map: {
        width: "100%",
        height: 180,
    },
    mapButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 8,
        backgroundColor: "#f8f8f8",
    },
    mapButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    mapButtonText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 6,
    },
    emojiContainer: {
        width: 100,
        height: 100,
        backgroundColor: "#f8f8f8",
        justifyContent: "center",
        alignItems: "center",
    },
    emojiText: {
        fontSize: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#f8f8f8",
    },
    closeButton: {
        padding: 5,
        marginRight: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginTop: 20,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666",
        marginTop: 10,
        textAlign: "center",
    },
    listContainer: {
        padding: 16,
    },
    card: {
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        padding: 12,
    },
    cardHeaderInfo: {
        flex: 1,
        marginLeft: 12,
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
        backgroundColor: "#f0f0f0",
    },
    imageLoadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        alignItems: "center",
        justifyContent: "center",
    },
    statusBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#FF9500",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    cardContent: {
        flex: 1,
        padding: 16,
        paddingTop: 12,
    },
    shopName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
    },
    approveButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#E8F5E9",
        borderWidth: 1,
        borderColor: "#C8E6C9",
        marginRight: 8,
    },
    approveButtonText: {
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "600",
        marginLeft: 4,
    },
    rejectButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#FFF0F0",
        borderWidth: 1,
        borderColor: "#FFDDDD",
    },
    rejectButtonText: {
        fontSize: 12,
        color: "#FF3B30",
        fontWeight: "600",
        marginLeft: 4,
    },
});

export default AdminScreen;
