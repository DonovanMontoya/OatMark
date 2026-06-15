import React, {useEffect, useState} from "react";
import {Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {collection, doc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import EmojiSelector from "./EmojiSelector";
import {validateShopName, validateOatMilk, validateUpcharge, validateEmoji} from "../utils/ValidationUtils";
import {useTheme} from "../contexts/ThemeContext";
import {fonts, makeShadow, radius, space} from "../styles/tokens";

const EditShopDetailsModal = ({
    shop,
    visible,
    onClose,
    onSave,
}) => {
    const {colors} = useTheme();
    const styles = getStyles(colors);
    const [shopName, setShopName] = useState("");
    const [oatMilk, setOatMilk] = useState("");
    const [upCharge, setUpCharge] = useState("");
    const [isFree, setIsFree] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState("☕");
    const [isSaving, setIsSaving] = useState(false);
    const [commonBrands, setCommonBrands] = useState([]);

    // Initialize form with shop data
    useEffect(() => {
        if (shop) {
            setShopName(shop.name || "");
            setOatMilk(shop.oatMilk || "");
            setUpCharge(shop.upCharge || "");
            setIsFree(shop.isFree || false);
            setSelectedEmoji(shop.emoji || "☕");
        }
    }, [shop]);

    // Fetch common oat milk brands from the database
    useEffect(() => {
        const fetchCommonBrands = async () => {
            try {
                const shopsSnapshot = await getDocs(collection(db, "coffee_shops"));
                const brandCounts = {};
                
                shopsSnapshot.forEach((doc) => {
                    const oatMilk = doc.data().oatMilk;
                    if (oatMilk && typeof oatMilk === 'string') {
                        const brand = oatMilk.trim();
                        if (brand) {
                            brandCounts[brand] = (brandCounts[brand] || 0) + 1;
                        }
                    }
                });

                // Get top 6 most common brands, sorted by count
                const sortedBrands = Object.entries(brandCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([brand]) => brand);

                setCommonBrands(sortedBrands);
            } catch (error) {
                console.error("Error fetching common brands:", error);
                // Set some default common brands as fallback
                setCommonBrands(["Oatly", "Minor Figures", "Califia Farms", "Oatly Barista", "Chobani", "Planet Oat"]);
            }
        };

        fetchCommonBrands();
    }, []);

    // Handle upcharge change
    const handleUpChargeChange = (value) => {
        // Remove any non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9.]/g, "");
        setUpCharge(numericValue);
    };

    // Save the updated details
    const handleSave = async () => {
        if (!shop) return;

        // Validate inputs
        const nameValidation = validateShopName(shopName);
        const oatMilkValidation = validateOatMilk(oatMilk);
        const normalizedUpCharge = `${upCharge ?? ""}`.trim();
        const isFreeUpcharge = isFree || normalizedUpCharge.toLowerCase() === "free";
        const upchargeValidation = validateUpcharge(normalizedUpCharge, isFreeUpcharge);
        const emojiValidation = validateEmoji(selectedEmoji);

        if (!nameValidation.isValid) {
            Alert.alert("Invalid Shop Name", nameValidation.error);
            return;
        }

        if (!oatMilkValidation.isValid) {
            Alert.alert("Invalid Oat Milk", oatMilkValidation.error);
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
            // Update the shop's details in the database
            const shopRef = doc(db, "pendingShops", shop.id);
            await updateDoc(shopRef, {
                name: nameValidation.sanitized,
                oatMilk: oatMilkValidation.sanitized,
                upCharge: upchargeValidation.sanitized,
                emoji: emojiValidation.sanitized,
                isFree: isFreeUpcharge,
            });

            // Create the updated shop object
            const updatedShop = {
                ...shop,
                name: nameValidation.sanitized,
                oatMilk: oatMilkValidation.sanitized,
                upCharge: upchargeValidation.sanitized,
                emoji: emojiValidation.sanitized,
                isFree: isFreeUpcharge,
            };

            // Call onSave callback with updated shop
            onSave(updatedShop);

            // Close the modal
            onClose();
        } catch (error) {
            console.error("Error updating shop details:", error);
            Alert.alert("Error", "Failed to update shop details");
        } finally {
            setIsSaving(false);
        }
    };

    if (!shop || !visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <FontAwesome6 name="xmark" size={20} color={colors.icon} iconStyle="solid"/>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Shop Details</Text>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Shop Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shop Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={shopName}
                            onChangeText={setShopName}
                            placeholder="Enter shop name"
                            placeholderTextColor={colors.tertiaryText}
                        />
                    </View>

                    {/* Oat Milk Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Oat Milk Brand/Type *</Text>
                        <TextInput
                            style={styles.input}
                            value={oatMilk}
                            onChangeText={setOatMilk}
                            placeholder="e.g., Oatly, Minor Figures, House-made"
                            placeholderTextColor={colors.tertiaryText}
                        />
                        {commonBrands.length > 0 && (
                            <View style={styles.brandButtonsContainer}>
                                <Text style={styles.brandButtonsLabel}>Quick select:</Text>
                                <View style={styles.brandButtonsRow}>
                                    {commonBrands.map((brand) => (
                                        <TouchableOpacity
                                            key={brand}
                                            style={[
                                                styles.brandButton,
                                                oatMilk === brand && styles.brandButtonActive
                                            ]}
                                            onPress={() => setOatMilk(brand)}
                                        >
                                            <Text
                                                style={[
                                                    styles.brandButtonText,
                                                    oatMilk === brand && styles.brandButtonTextActive
                                                ]}
                                            >
                                                {brand}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Upcharge */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Upcharge * 🥛</Text>
                        <View style={styles.upchargeContainer}>
                            <TouchableOpacity
                                style={[styles.freeButton, isFree && styles.freeButtonActive]}
                                onPress={() => {
                                    setIsFree(!isFree);
                                    setUpCharge("");
                                }}
                            >
                                <Text
                                    style={[
                                        styles.freeButtonText,
                                        isFree && styles.freeButtonTextActive,
                                    ]}
                                >
                                    🎉 It's FREE!
                                </Text>
                            </TouchableOpacity>

                            {!isFree && (
                                <View style={styles.priceInputContainer}>
                                    <Text style={styles.dollarSign}>$</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={upCharge}
                                        onChangeText={handleUpChargeChange}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.tertiaryText}
                                        keyboardType="decimal-pad"
                                        maxLength={6}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Emoji Selector */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Shop Emoji</Text>
                        <EmojiSelector
                            selectedEmoji={selectedEmoji}
                            onSelectEmoji={setSelectedEmoji}
                        />
                    </View>
                </ScrollView>

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
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
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
        paddingHorizontal: space.lg,
        paddingTop: 50,
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
    content: {
        flex: 1,
        padding: space.lg,
    },
    shopName: {
        fontSize: 18,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginBottom: space.lg,
    },
    inputGroup: {
        marginBottom: space.lg,
    },
    label: {
        fontSize: 16,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginBottom: space.xs,
    },
    input: {
        height: 50,
        paddingHorizontal: space.md,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.sm,
        fontSize: 16,
        fontFamily: fonts.body,
        backgroundColor: colors.inputBackground,
        color: colors.text,
    },
    brandButtonsContainer: {
        marginTop: space.sm,
    },
    brandButtonsLabel: {
        fontSize: 12,
        color: colors.secondaryText,
        marginBottom: space.xs,
        fontFamily: fonts.medium,
    },
    brandButtonsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -space.xxs,
    },
    brandButton: {
        paddingVertical: space.xs,
        paddingHorizontal: space.sm,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: space.xxs,
        marginBottom: space.xs,
    },
    brandButtonActive: {
        backgroundColor: colors.accentSoft,
        borderColor: colors.accent,
    },
    brandButtonText: {
        fontSize: 13,
        color: colors.secondaryText,
        fontFamily: fonts.medium,
    },
    brandButtonTextActive: {
        color: colors.accent,
        fontFamily: fonts.semibold,
    },
    upchargeContainer: {
        marginBottom: space.sm,
    },
    freeButton: {
        backgroundColor: colors.surfaceMuted,
        paddingVertical: space.sm,
        paddingHorizontal: space.lg,
        borderRadius: radius.pill,
        marginBottom: space.md,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    freeButtonActive: {
        backgroundColor: colors.successSoft,
        borderColor: colors.success,
    },
    freeButtonText: {
        fontSize: 16,
        fontFamily: fonts.semibold,
        color: colors.secondaryText,
    },
    freeButtonTextActive: {
        color: colors.success,
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: space.md,
        height: 50,
    },
    dollarSign: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.accent,
        marginRight: space.xxs,
    },
    priceInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.body,
        color: colors.text,
        paddingVertical: 0,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: space.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
        ...makeShadow(colors, "sm"),
    },
    saveButtonDisabled: {
        backgroundColor: colors.surfaceMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: colors.onAccent,
        fontSize: 16,
        fontFamily: fonts.bold,
    },
});

export default EditShopDetailsModal;

