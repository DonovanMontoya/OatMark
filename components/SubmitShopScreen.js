import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";

const SubmitShopScreen = ({ onClose }) => {
  const [shopName, setShopName] = useState("");
  const [oatMilk, setOatMilk] = useState("");
  const [upCharge, setUpCharge] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpChargeChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setUpCharge(numericValue);
  };

  const getWhimsicalUpchargeText = () => {
    if (isFree) return "🎉 FREE oat milk? You're living the dream! 🌟";
    if (!upCharge) return "💰 What's the damage for that creamy oat goodness?";

    const price = parseFloat(upCharge);
    if (price === 0) return "🆓 Zero dollars? That's music to my ears! 🎵";
    if (price < 0.5) return "🤑 That's a steal! Your wallet will thank you! 💚";
    if (price < 1.0) return "😊 Not too shabby for some oat-y goodness! ✨";
    if (price < 2.0)
      return "💸 Getting a bit pricey, but worth it for the oats! 🌾";
    return "😱 Whoa there! That's some premium oat milk! 🥛👑";
  };

  const handleSubmit = async () => {
    if (!shopName.trim() || !oatMilk.trim() || (!isFree && !upCharge.trim())) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to submit a shop");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      let locationPermission =
        await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== "granted") {
        Alert.alert(
          "Error",
          "Location permission is required to submit a shop",
        );
        setIsSubmitting(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      // Add shop to Firestore pendingShops collection
      const finalUpcharge = isFree
        ? "Free"
        : `$${parseFloat(upCharge).toFixed(2)}`;

      await addDoc(collection(db, "pendingShops"), {
        name: shopName.trim(),
        oatMilk: oatMilk.trim(),
        upCharge: finalUpcharge,
        image:
          imageUrl.trim() || "https://via.placeholder.com/60x60?text=Coffee",
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        status: "pending"
      });

      Alert.alert("Success!", "Coffee shop submitted for review!", [
        { text: "OK", onPress: onClose },
      ]);

      // Reset form
      setShopName("");
      setOatMilk("");
      setUpCharge("");
      setImageUrl("");
      setIsFree(false);
    } catch (error) {
      console.error("Error submitting shop:", error);
      Alert.alert("Error", "Failed to submit coffee shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid" />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Coffee Shop</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Enter coffee shop name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Oat Milk Brand/Type *</Text>
          <TextInput
            style={styles.input}
            value={oatMilk}
            onChangeText={setOatMilk}
            placeholder="e.g., Oatly, Minor Figures, House-made"
            placeholderTextColor="#999"
          />
        </View>

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

          <Text style={styles.whimsicalText}>{getWhimsicalUpchargeText()}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#999"
            keyboardType="url"
          />
        </View>

        <Text style={styles.note}>
          * Location will be automatically set to your current position
        </Text>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Shop"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
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
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginVertical: 15,
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
  note: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginVertical: 10,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
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
  whimsicalText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
};

export default SubmitShopScreen;
