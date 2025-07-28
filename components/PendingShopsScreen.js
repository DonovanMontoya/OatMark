import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";

const PendingShopsScreen = ({ onClose }) => {
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
      where("createdBy", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shops = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingShops(shops);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending shops:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleDelete = (shopId) => {
    Alert.alert(
      "Delete Submission",
      "Are you sure you want to delete this pending shop submission?",
      [
        { text: "Cancel", style: "cancel" },
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
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid" />
        </TouchableOpacity>
        <Text style={styles.title}>My Pending Shops</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading your submissions...</Text>
        </View>
      ) : pendingShops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="store" size={50} color="#ccc" iconStyle="solid" />
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardImageContainer}>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emojiText}>{item.emoji || "☕"}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Pending</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
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
                <View style={styles.detailRow}>
                  <FontAwesome6
                    name="calendar"
                    size={12}
                    color="#666"
                    iconStyle="solid"
                  />
                  <Text style={styles.detailText}>
                    Submitted: {item.createdAt?.toDate().toLocaleDateString() || "Unknown"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <FontAwesome6
                    name="trash"
                    size={14}
                    color="#FF3B30"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
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
    padding: 12,
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
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFDDDD",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default PendingShopsScreen;