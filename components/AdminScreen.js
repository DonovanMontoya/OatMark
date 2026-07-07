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
import {handleError, showDestructiveConfirmation} from "../utils/ErrorUtils";
import {isValidLocation, validateShopName, validateOatMilk, validateUpcharge, validateEmoji} from "../utils/ValidationUtils";
import {useAdminStatus} from "../hooks/useAdminStatus";
import AdjustPinModal from "./AdjustPinModal";
import EditShopDetailsModal from "./EditShopDetailsModal";
import PendingShopCard from "./PendingShopCard";
import {createThemeStyles} from "../styles/ThemeStyles";
import {useTheme} from "../contexts/ThemeContext";
import {fonts, makeShadow, radius, space} from "../styles/tokens";
import Constants from "expo-constants";

const AdminScreen = ({onClose}) => {
    const [pendingShops, setPendingShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const {isAdmin, isLoading: adminLoading} = useAdminStatus();
    const {colors} = useTheme();
    const commonStyles = createThemeStyles(colors);
    const styles = getStyles(colors);
    const [showAdjustPinModal, setShowAdjustPinModal] = useState(false);
    const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
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
                        // Handle undefined upCharge and check if it's marked as free
                        // Check both shop.isFree property and if upCharge value is "Free"
                        const upChargeStr = shop.upCharge != null ? String(shop.upCharge) : '';
                        const isFree = shop.isFree || upChargeStr.toLowerCase().trim() === 'free';
                        const upchargeValidation = validateUpcharge(upChargeStr, isFree);
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
                                    name: nameValidation.sanitized,
                                    oatMilk: oatMilkValidation.sanitized,
                                    upCharge: upchargeValidation.sanitized,
                                    emoji: emojiValidation.sanitized,
                                    location: shop.location,
                                    createdAt: shop.createdAt || new Date(),
                                    approvedAt: new Date(),
                                    approvedBy: auth.currentUser.uid,
                                    // Approval is a human verification, so the shop
                                    // enters the map with a genuine freshness stamp
                                    lastConfirmedAt: new Date(),
                                };
                                transaction.set(newShopRef, shopData);

                                // Delete from pending shops
                                const pendingShopRef = doc(db, "pendingShops", shop.id);
                                transaction.delete(pendingShopRef);
                            });
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
                            color={colors.text}
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>Admin Panel</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <FontAwesome6
                        name="lock"
                        size={50}
                        color={colors.danger}
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

    // Handle shop details update (oat milk and emoji)
    const handleShopDetailsUpdate = (updatedShop) => {
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
                        <FontAwesome6 name="shield-halved" size={20} color={colors.warning} iconStyle="solid"/>
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
                    <FontAwesome6 name="clock" size={14} color={colors.warning} iconStyle="solid"/>
                    <Text style={[styles.countText, { color: colors.text }]}>
                        {pendingShops.length} {pendingShops.length === 1 ? 'submission' : 'submissions'} awaiting review
                    </Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.warning}/>
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
                            color={colors.success}
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
                            onEditDetails={(shop) => {
                                setSelectedShop(shop);
                                setShowEditDetailsModal(true);
                            }}
                            onEditAll={(shop) => {
                                setSelectedShop(shop);
                                setShowEditDetailsModal(true);
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

            {/* Edit Shop Details Modal */}
            {selectedShop && (
                <EditShopDetailsModal
                    shop={selectedShop}
                    visible={showEditDetailsModal}
                    onClose={() => setShowEditDetailsModal(false)}
                    onSave={handleShopDetailsUpdate}
                />
            )}
        </View>
    );
};

AdminScreen.propTypes = {
    onClose: PropTypes.func.isRequired,
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: space.lg,
        paddingTop: Constants.statusBarHeight + space.sm,
        paddingBottom: space.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        ...makeShadow(colors, "sm"),
    },
    closeButton: {
        padding: space.xs,
        marginRight: space.sm,
    },
    headerContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.warningSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.display,
        color: colors.text,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
    },
    countBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: space.sm,
        gap: space.xs,
        backgroundColor: colors.warningSoft,
        borderBottomWidth: 1,
        borderBottomColor: colors.warning,
    },
    countText: {
        fontSize: 14,
        fontFamily: fonts.semibold,
        color: colors.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: space.md,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: space.xxl,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: radius.pill,
        backgroundColor: colors.successSoft,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: space.lg,
    },
    emptyText: {
        fontSize: 24,
        fontFamily: fonts.display,
        color: colors.text,
        marginBottom: space.xs,
        textAlign: "center",
        letterSpacing: -0.4,
    },
    emptySubtext: {
        fontSize: 15,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        marginTop: space.xs,
        textAlign: "center",
        lineHeight: 22,
    },
    emptyDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        marginTop: space.xl,
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.sm,
    },
    emptyDetailText: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
    },
    listContainer: {
        paddingVertical: space.xs,
    },
});

export default AdminScreen;
