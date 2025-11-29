import React, {useEffect, useState} from "react";
import {Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "../services/firebase";
import {getCommonBrands} from "../services/brandCache";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import EmojiSelector from "./EmojiSelector";
import {validateShopName, validateOatMilk, validateUpcharge, validateEmoji} from "../utils/ValidationUtils";

const EditShopDetailsModal = ({
    shop,
    visible,
    onClose,
    onSave,
}) => {
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
            const brands = await getCommonBrands();
            setCommonBrands(brands);
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
                        <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid"/>
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
                            placeholderTextColor="#999"
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
                            placeholderTextColor="#999"
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
                                        placeholderTextColor="#999"
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
        borderBottomColor: "#f0f0f0",
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
    content: {
        flex: 1,
        padding: 20,
    },
    shopName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        height: 44,
        paddingHorizontal: 12,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    brandButtonsContainer: {
        marginTop: 10,
    },
    brandButtonsLabel: {
        fontSize: 12,
        color: "#666",
        marginBottom: 8,
        fontWeight: "500",
    },
    brandButtonsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -4,
    },
    brandButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: "#f0f0f0",
        borderWidth: 1,
        borderColor: "#ddd",
        marginHorizontal: 4,
        marginBottom: 8,
    },
    brandButtonActive: {
        backgroundColor: "#E3F2FD",
        borderColor: "#4285F4",
    },
    brandButtonText: {
        fontSize: 13,
        color: "#666",
        fontWeight: "500",
    },
    brandButtonTextActive: {
        color: "#4285F4",
        fontWeight: "600",
    },
    upchargeContainer: {
        marginBottom: 10,
    },
    freeButton: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 15,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    freeButtonActive: {
        backgroundColor: "#e8f5e8",
        borderColor: "#4CAF50",
    },
    freeButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    freeButtonTextActive: {
        color: "#4CAF50",
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    dollarSign: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4285F4",
        marginRight: 5,
    },
    priceInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 0,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingVertical: 15,
        borderRadius: 8,
        marginRight: 10,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 2,
        backgroundColor: "#4285F4",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: "#ccc",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default EditShopDetailsModal;

