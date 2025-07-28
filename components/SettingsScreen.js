import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import Constants from "expo-constants";
import { useTheme } from "../contexts/ThemeContext";

const SettingsScreen = ({ onClose }) => {
  // Get theme context
  const { isDark, toggleTheme, colors } = useTheme();
  
  // noinspection JSUnusedLocalSymbols
  const [notifications, setNotifications] = useState(true);
  // noinspection JSUnusedLocalSymbols
  const [locationSharing, setLocationSharing] = useState(true);
  // Local state for dark mode toggle
  const [darkMode, setDarkMode] = useState(isDark);
  
  // Sync local state with theme context
  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark]);
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    toggleTheme();
  };

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
      "App Information:",
      "Version " +
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

  // Generate styles based on the current theme
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color={colors.icon} iconStyle="solid" />
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
                color={colors.icon}
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: "#767577", true: colors.primary }}
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
                color={colors.icon}
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Profile</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={colors.tertiaryText}
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="right-from-bracket"
                size={18}
                color={colors.danger}
                iconStyle="solid"
              />
              <Text style={[styles.settingText, { color: colors.danger }]}>
                Logout
              </Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={colors.tertiaryText}
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
                color={colors.icon}
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={colors.tertiaryText}
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="shield-halved"
                size={18}
                color={colors.icon}
                iconStyle="solid"
              />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={colors.tertiaryText}
              iconStyle="solid"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <FontAwesome6
                name="circle-info"
                size={18}
                color={colors.icon}
                iconStyle="solid"
              />
              <Text style={styles.settingText}>About</Text>
            </View>
            <FontAwesome6
              name="chevron-right"
              size={16}
              color={colors.tertiaryText}
              iconStyle="solid"
            />
          </TouchableOpacity>
          <Text style={styles.theSmallText}>
            OatMark Helps You Find Coffee Shops That Fit Your Vibe
          </Text>
          <Text style={styles.theSmallText}>{ "Version: " + Constants.expoConfig.version }</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Create dynamic styles based on the theme
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 5,
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
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
    color: colors.text,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 15,
  },
  theSmallText: {
    fontSize: 13,
    color: colors.text,
    alignSelf: "center",
    textAlign: "center",
  },
});

export default SettingsScreen;
