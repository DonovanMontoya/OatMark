import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {collection, deleteDoc, doc, onSnapshot, query, runTransaction} from "firebase/firestore";
import {auth, db} from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import {handleError, showSuccess, showDestructiveConfirmation} from "../utils/ErrorUtils";
import {isValidLocation, validateShopName, validateOatMilk, validateUpcharge, validateEmoji} from "../utils/ValidationUtils";
import {useAdminStatus} from "../hooks/useAdminStatus";
import AdjustPinModal from "./AdjustPinModal";
import PendingShopCard from "./PendingShopCard";
import {createThemeStyles} from "../styles/ThemeStyles";
import {useTheme} from "../contexts/ThemeContext";

const AdminScreen = ({onClose}) => {
    const [pendingShops, setPendingShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const {isAdmin, isLoading: adminLoading} = useAdminStatus();
    const {colors} = useTheme();
    const commonStyles = createThemeStyles(colors);
    const [showAdjustPinModal, setShowAdjustPinModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [processingItems, setProcessingItems] = useState(new Set());

    useEffect(() => {
        if (adminLoading) return;
        
        if (!auth.currentUser || !isAdmin) {
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
                handleError(error, "Failed to load pending submissions", true, { 
                    action: "fetching pending shops" 
                });
                setLoading(false);
            },
        );

        return () => unsubscribe();
    }, [adminLoading, isAdmin]);

    const handleApprove = async (shop) => {
        // Prevent double approval by checking if already processing
        if (processingItems.has(shop.id)) {
            return;
        }

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
                        // Comprehensive validation before approval
                        const nameValidation = validateShopName(shop.name);
                        const oatMilkValidation = validateOatMilk(shop.oatMilk);
                        const upchargeValidation = validateUpcharge(shop.upCharge);
                        const emojiValidation = validateEmoji(shop.emoji);

                        if (!nameValidation.isValid) {
                            handleError(
                                { message: "Invalid shop name" }, 
                                `Shop name validation failed: ${nameValidation.error}`
                            );
                            return;
                        }

                        if (!oatMilkValidation.isValid) {
                            handleError(
                                { message: "Invalid oat milk brand" }, 
                                `Oat milk validation failed: ${oatMilkValidation.error}`
                            );
                            return;
                        }

                        if (!upchargeValidation.isValid) {
                            handleError(
                                { message: "Invalid upcharge" }, 
                                `Upcharge validation failed: ${upchargeValidation.error}`
                            );
                            return;
                        }

                        if (!emojiValidation.isValid) {
                            handleError(
                                { message: "Invalid emoji" }, 
                                `Emoji validation failed: ${emojiValidation.error}`
                            );
                            return;
                        }

                        if (!isValidLocation(shop.location)) {
                            handleError(
                                { message: "Invalid location data" }, 
                                "Shop location is invalid and cannot be approved"
                            );
                            return;
                        }

                        // Mark the item as processing to prevent double approval and show the loading state
                        setProcessingItems(prev => new Set([...prev, shop.id]));

                        // Optimistic update - immediately remove from UI
                        setPendingShops(prev => prev.filter(item => item.id !== shop.id));

                        try {
                            // Use transaction to ensure atomic operation
                            await runTransaction(db, async (transaction) => {
                                // Create a new shop document
                                const newShopRef = doc(collection(db, "coffee_shops"));
                                const shopData = {
                                    name: shop.name.trim(),
                                    oatMilk: shop.oatMilk.trim(),
                                    upCharge: shop.upCharge,
                                    emoji: shop.emoji || "☕",
                                    location: shop.location,
                                    createdAt: shop.createdAt || new Date(),
                                    approvedAt: new Date(),
                                    approvedBy: auth.currentUser.uid,
                                };
                                transaction.set(newShopRef, shopData);

                                // Delete from pending shops
                                const pendingShopRef = doc(db, "pendingShops", shop.id);
                                transaction.delete(pendingShopRef);
                            });

                            showSuccess(
                                "Success",
                                `"${shop.name}" approved and published successfully`
                            );
                        } catch (error) {
                            // Revert optimistic update on error
                            setPendingShops(prev => [shop, ...prev]);
                            
                            handleError(
                                error, 
                                "Failed to approve shop. Please try again.", 
                                true, 
                                { action: "approving shop", shopId: shop.id }
                            );
                        } finally {
                            // Remove from a processing set
                            setProcessingItems(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(shop.id);
                                return newSet;
                            });
                        }
                    },
                },
            ],
        );
    };

    const handleReject = (shop) => {
        // Prevent double rejection by checking if already processing
        if (processingItems.has(shop.id)) {
            return;
        }

        showDestructiveConfirmation(
            "Reject Submission",
            "Are you sure you want to reject this shop submission? This action cannot be undone.",
            async () => {
                // Mark item as processing
                setProcessingItems(prev => new Set([...prev, shop.id]));

                // Optimistic update - immediately remove from UI
                setPendingShops(prev => prev.filter(item => item.id !== shop.id));

                try {
                    await deleteDoc(doc(db, "pendingShops", shop.id));
                    showSuccess("Success", `"${shop.name}" submission rejected and deleted`);
                } catch (error) {
                    // Revert optimistic update on error
                    setPendingShops(prev => [shop, ...prev]);
                    
                    handleError(
                        error, 
                        "Failed to reject shop submission. Please try again.", 
                        true, 
                        { action: "rejecting shop", shopId: shop.id }
                    );
                } finally {
                    // Remove from a processing set
                    setProcessingItems(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(shop.id);
                        return newSet;
                    });
                }
            },
            null,
            "Reject"
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
        <View style={[commonStyles.whiteContainer, { backgroundColor: colors.background }]}>
            {/* Enhanced Header */}
            <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={22} color={colors.text} iconStyle="solid"/>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={styles.iconBadge}>
                        <FontAwesome6 name="shield-halved" size={20} color="#FF9500" iconStyle="solid"/>
                    </View>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
                        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                            Review Pending Submissions
                        </Text>
                    </View>
                </View>
            </View>

            {/* Pending Count Badge */}
            {!loading && pendingShops.length > 0 && (
                <View style={styles.countBanner}>
                    <FontAwesome6 name="clock" size={14} color="#FF9500" iconStyle="solid"/>
                    <Text style={[styles.countText, { color: colors.text }]}>
                        {pendingShops.length} {pendingShops.length === 1 ? 'submission' : 'submissions'} awaiting review
                    </Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF9500"/>
                    <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                        {adminLoading ? "Verifying admin access..." : "Loading pending submissions..."}
                    </Text>
                </View>
            ) : pendingShops.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <FontAwesome6
                            name="circle-check"
                            size={60}
                            color="#4CAF50"
                            iconStyle="solid"
                        />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text }]}>All Caught Up!</Text>
                    <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                        There are no pending shop submissions to review at this time.
                    </Text>
                    <View style={styles.emptyDetail}>
                        <FontAwesome6 name="circle-info" size={14} color={colors.secondaryText} iconStyle="solid"/>
                        <Text style={[styles.emptyDetailText, { color: colors.secondaryText }]}>
                            New submissions will appear here automatically
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={pendingShops}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => (
                        <PendingShopCard
                            item={item}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onAdjustPin={(shop) => {
                                setSelectedShop(shop);
                                setShowAdjustPinModal(true);
                            }}
                            isProcessing={processingItems.has(item.id)}
                        />
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

AdminScreen.propTypes = {
    onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    closeButton: {
        padding: 8,
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255, 149, 0, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
        fontWeight: "500",
    },
    countBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 8,
        backgroundColor: "rgba(255, 149, 0, 0.08)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 149, 0, 0.2)",
    },
    countText: {
        fontSize: 14,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: "500",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 15,
        marginTop: 8,
        textAlign: "center",
        lineHeight: 22,
    },
    emptyDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "rgba(0, 0, 0, 0.03)",
        borderRadius: 8,
    },
    emptyDetailText: {
        fontSize: 13,
        fontWeight: "500",
    },
    listContainer: {
        paddingVertical: 8,
    },
    // Legacy styles kept for compatibility
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
    disabledButton: {
        opacity: 0.6,
        backgroundColor: "#f5f5f5",
    },
    disabledButtonText: {
        color: "#999",
    },
});

export default AdminScreen;
