import React, { useState, useEffect } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import EmojiSelector from "./EmojiSelector";
import { validateShopName, validateOatMilk, validateUpcharge, validateEmoji } from "../utils/ValidationUtils";
import { handleError, showSuccess } from "../utils/ErrorUtils";
import { useTheme } from "../contexts/ThemeContext";

const ManageShopModal = ({ shop, visible, onClose, onShopUpdated }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Form state
    const [shopName, setShopName] = useState("");
    const [oatMilk, setOatMilk] = useState("");
    const [upCharge, setUpCharge] = useState("");
    const [selectedEmoji, setSelectedEmoji] = useState("☕");
    const [isSaving, setIsSaving] = useState(false);

    // Initialize form with shop data
    useEffect(() => {
        if (shop) {
            setShopName(shop.name || "");
            setOatMilk(shop.oatMilk || "");
            setUpCharge(shop.upCharge || "");
            setSelectedEmoji(shop.emoji || "☕");
        }
    }, [shop]);

    const handleSave = async () => {
        if (!shop) return;

        // Validate inputs
        const shopNameValidation = validateShopName(shopName);
        const oatMilkValidation = validateOatMilk(oatMilk);
        const normalizedUpCharge = `${upCharge ?? ""}`.trim();
        const isFreeUpcharge = normalizedUpCharge.toLowerCase() === "free";
        const upchargeValidation = validateUpcharge(normalizedUpCharge, isFreeUpcharge);
        const emojiValidation = validateEmoji(selectedEmoji);

        if (!shopNameValidation.isValid) {
            Alert.alert("Invalid Shop Name", shopNameValidation.error);
            return;
        }

        if (!oatMilkValidation.isValid) {
            Alert.alert("Invalid Oat Milk Info", oatMilkValidation.error);
            return;
        }

        if (!upchargeValidation.isValid) {
            Alert.alert("Invalid Upcharge", upchargeValidation.error);
            return;
        }

        if (!emojiValidation.isValid) {
            Alert.alert("Invalid Emoji", emojiValidation.error);
            return;
        }

        setIsSaving(true);

        try {
            // Prepare updated shop data
            const updatedShopData = {
                name: shopNameValidation.sanitized,
                oatMilk: oatMilkValidation.sanitized,
                upCharge: upchargeValidation.sanitized,
                emoji: emojiValidation.sanitized,
                updatedAt: new Date(),
            };

            // Update shop in Firestore
            const shopRef = doc(db, "coffee_shops", shop.id);
            await updateDoc(shopRef, updatedShopData);

            // Create updated shop object for callback
            const updatedShop = {
                ...shop,
                ...updatedShopData,
            };

            // Call callback to update parent component
            onShopUpdated(updatedShop);

            showSuccess("Success!", "Shop updated successfully!");
            onClose();
        } catch (error) {
            handleError(error, "Failed to update shop. Please try again.", true, { 
                action: "updating shop", 
                shopId: shop.id 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        if (shop) {
            setShopName(shop.name || "");
            setOatMilk(shop.oatMilk || "");
            setUpCharge(shop.upCharge || "");
            setSelectedEmoji(shop.emoji || "☕");
        }
        onClose();
    };

    if (!visible || !shop) return null;

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={20} color={colors.primaryText} iconStyle="solid" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Shop</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color={colors.primaryText} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Shop Details</Text>
                    
                    {/* Shop Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Shop Name</Text>
                        <TextInput
                            style={styles.textInput}
                            value={shopName}
                            onChangeText={setShopName}
                            placeholder="Enter shop name"
                            placeholderTextColor={colors.secondaryText}
                            maxLength={50}
                        />
                    </View>

                    {/* Oat Milk Info */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Oat Milk Brand/Info</Text>
                        <TextInput
                            style={styles.textInput}
                            value={oatMilk}
                            onChangeText={setOatMilk}
                            placeholder="e.g., Oatly, Minor Figures, Califia"
                            placeholderTextColor={colors.secondaryText}
                            maxLength={100}
                        />
                    </View>

                    {/* Upcharge */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Oat Milk Upcharge</Text>
                        <TextInput
                            style={styles.textInput}
                            value={upCharge}
                            onChangeText={setUpCharge}
                            placeholder="e.g., $0.50, Free, $1.00"
                            placeholderTextColor={colors.secondaryText}
                            maxLength={20}
                        />
                    </View>

                    {/* Emoji Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Shop Emoji</Text>
                        <EmojiSelector
                            selectedEmoji={selectedEmoji}
                            onSelectEmoji={setSelectedEmoji}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.primaryText,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: colors.primaryText,
        fontWeight: "600",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.primaryText,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.primaryText,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.primaryText,
        backgroundColor: colors.cardBackground,
    },
});

export default ManageShopModal;
