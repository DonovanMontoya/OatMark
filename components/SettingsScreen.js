import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import Constants from "expo-constants";

const SettingsScreen = ({ onClose }) => {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            console.log("Logged out!");
          } catch (err) {
            console.error("Logout error", err);
          }
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      "About OatMark",
      "OatMark helps you find coffee shops with oat milk options. Version " +
        Constants.expoConfig.version,
      [{ text: "OK" }],
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your location data is used only to show nearby coffee shops and is not stored permanently.",
      [{ text: "OK" }],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/*<View style={styles.settingItem}>*/}
          {/*  <View style={styles.settingLeft}>*/}
          {/*    <FontAwesome6*/}
          {/*      name="bell"*/}
          {/*      size={18}*/}
          {/*      color="#333"*/}
          {/*      iconStyle="solid"*/}
          {/*    />*/}
          {/*    <Text style={styles.settingText}>Notifications</Text>*/}
          {/*  </View>*/}
          {/*  <Switch*/}
          {/*    value={notifications}*/}
          {/*    onValueChange={setNotifications}*/}
          {/*    trackColor={{ false: "#767577", true: "#4285F4" }}*/}
          {/*    thumbColor="#fff"*/}
          {/*  />*/}
          {/*</View>*/}

          {/*<View style={styles.settingItem}>*/}
          {/*  <View style={styles.settingLeft}>*/}
          {/*    <FontAwesome6*/}
          {/*      name="location-dot"*/}
          {/*      size={18}*/}
          {/*      color="#333"*/}
          {/*      iconStyle="solid"*/}
          {/*    />*/}
          {/*    <Text style={styles.settingText}>Location Sharing</Text>*/}
          {/*  </View>*/}
          {/*  <Switch*/}
          {/*    value={locationSharing}*/}
          {/*    onValueChange={setLocationSharing}*/}
          {/*    trackColor={{ false: "#767577", true: "#4285F4" }}*/}
          {/*    thumbColor="#fff"*/}
          {/*  />*/}
          {/*</View>*/}

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="moon"
                size={18}
                color="#333"
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#767577", true: "#4285F4" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="user"
                size={18}
                color="#333"
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Profile</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color="#ccc"
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="right-from-bracket"
                size={18}
                color="#cc0000"
                iconStyle="solid"
              />
              <Text style={[styles.settingText, { color: "#cc0000" }]}>
                Logout
              </Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color="#ccc"
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="circle-question"
                size={18}
                color="#333"
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color="#ccc"
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="shield-halved"
                size={18}
                color="#333"
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color="#ccc"
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="circle-info"
                size={18}
                color="#333"
                iconStyle="solid"
              />
              <Text style={styles.settingText}>About</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color="#ccc"
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
};

export default SettingsScreen;
