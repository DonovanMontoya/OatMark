import React, {useState} from "react";
import {Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from "react-native";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import {deleteUser, signOut} from "firebase/auth";
import {deleteDoc, doc} from "firebase/firestore";
import {auth, db} from "../services/firebase";
import Constants from "expo-constants";
import {useTheme} from "../contexts/ThemeContext";
import {useUnits} from "../contexts/UnitsContext";
import {fonts, radius, space} from "../styles/tokens";
import {handleError, showDestructiveConfirmation} from "../utils/ErrorUtils";

const SUPPORT_EMAIL = "donovan.montoya1@gmail.com";

// Firebase requires a recent sign-in for sensitive operations like account
// deletion (roughly a 5-minute window). Checking up front lets us bail out
// BEFORE any destructive side effects instead of discovering it halfway.
const RECENT_LOGIN_WINDOW_MS = 5 * 60 * 1000;

const requiresRecentLogin = (user) => {
    const lastSignIn = Date.parse(user?.metadata?.lastSignInTime ?? "");
    return !Number.isFinite(lastSignIn) || Date.now() - lastSignIn > RECENT_LOGIN_WINDOW_MS;
};

const SettingsScreen = ({onClose}) => {
    // Get theme context
    const {themePreference, setThemePreference, colors} = useTheme();
    const {unit, setUnit} = useUnits();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleThemePreferenceChange = (preference) => {
        setThemePreference(preference);
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {text: "Cancel", style: "cancel"},
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await signOut(auth);
                    } catch (err) {
                        console.error("Logout error", err);
                    }
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        const user = auth.currentUser;
        if (!user || isDeleting) return;

        // Gate on recent reauth BEFORE any destructive step, so the common
        // stale-session case exits with no side effects
        if (requiresRecentLogin(user)) {
            Alert.alert(
                "Please log in again",
                "For security, deleting your account requires a recent login. " +
                "Log out, log back in, then try deleting again.",
            );
            return;
        }

        showDestructiveConfirmation(
            "Delete Account",
            "This permanently deletes your account and saved favorites. " +
            "Shops you submitted stay on the map for the community. " +
            "This cannot be undone.",
            async () => {
                setIsDeleting(true);
                try {
                    // Remove the user's data doc first — after deleteUser the
                    // request is unauthenticated and rules would deny it.
                    // deleteDoc succeeds on a missing doc, so any failure here
                    // is real (offline, permissions) and aborts the deletion
                    // with both account and data intact.
                    await deleteDoc(doc(db, "users", user.uid));
                    await deleteUser(user);
                    // Auth listener flips the app back to the login screen
                } catch (error) {
                    if (error?.code === "auth/requires-recent-login") {
                        Alert.alert(
                            "Please log in again",
                            "For security, deleting your account requires a recent login. " +
                            "Log out, log back in, then try deleting again. " +
                            "You may need to re-save your favorites.",
                        );
                    } else {
                        handleError(error, "Failed to delete your account. Please try again.");
                    }
                } finally {
                    setIsDeleting(false);
                }
            },
            null,
            "Delete",
        );
    };

    const handleHelp = () => {
        const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("OatMark Support")}`;
        Linking.openURL(url).catch(() => {
            Alert.alert("Help & Support", `Email us at ${SUPPORT_EMAIL}`);
        });
    };

    const handleAbout = () => {
        Alert.alert(
            "App Information:",
            "Version " +
            Constants.expoConfig.version,
            [{text: "OK"}],
        );
    };

    const handlePrivacy = () => {
        Alert.alert(
            "Privacy Policy",
            "Your live location is used to show nearby shops and is not tracked in the background. " +
            "When you submit a shop or confirm its info, your account id and the shop's location " +
            "are stored with that contribution. You can delete your account at any time from this screen.",
            [{text: "OK"}],
        );
    };

    // Generate styles based on the current theme
    const styles = getStyles(colors);

    const themeOptions = [
        {key: "light", label: "Light", icon: "sun"},
        {key: "dark", label: "Dark", icon: "moon"},
        {key: "auto", label: "Auto", icon: "circle-half-stroke"},
    ];

    const unitOptions = [
        {key: "km", label: "Kilometers"},
        {key: "mi", label: "Miles"},
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <FontAwesome6 name="xmark" size={20} color={colors.icon} iconStyle="solid"/>
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <FontAwesome6
                                name="moon"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                            />
                            <Text style={styles.settingText}>Theme</Text>
                        </View>
                    </View>

                    <View style={styles.themeOptionsRow}>
                        {themeOptions.map(({key, label, icon}) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.themeOption,
                                    themePreference === key && styles.themeOptionSelected,
                                ]}
                                onPress={() => handleThemePreferenceChange(key)}
                            >
                                <FontAwesome6
                                    name={icon}
                                    size={16}
                                    color={themePreference === key ? colors.primary : colors.icon}
                                    iconStyle="solid"
                                />
                                <Text
                                    style={[
                                        styles.themeOptionText,
                                        {color: themePreference === key ? colors.primary : colors.text},
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.themeHelperText}>
                        Auto follows your device appearance and switches between light and dark
                        automatically.
                    </Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <FontAwesome6
                                name="ruler"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                            />
                            <Text style={styles.settingText}>Distance units</Text>
                        </View>
                    </View>

                    <View style={styles.themeOptionsRow}>
                        {unitOptions.map(({key, label}) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.themeOption,
                                    unit === key && styles.themeOptionSelected,
                                ]}
                                onPress={() => setUnit(key)}
                            >
                                <Text
                                    style={[
                                        styles.themeOptionText,
                                        {color: unit === key ? colors.primary : colors.text},
                                    ]}
                                >
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <FontAwesome6
                                name="user"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                            />
                            <Text style={styles.settingText} numberOfLines={1}>
                                {auth.currentUser?.email || "Signed in"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                        <View style={styles.settingLeft}>
                            <FontAwesome6
                                name="right-from-bracket"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                            />
                            <Text style={styles.settingText}>Logout</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        <View style={styles.settingLeft}>
                            <FontAwesome6
                                name="trash-can"
                                size={18}
                                color={colors.danger}
                                iconStyle="solid"
                            />
                            <Text style={[styles.settingText, {color: colors.danger}]}>
                                {isDeleting ? "Deleting Account…" : "Delete Account"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>

                    <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
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
                    <Text style={styles.theSmallText}>{"Version: " + Constants.expoConfig.version}</Text>
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
        paddingHorizontal: space.lg,
        paddingTop: Constants.statusBarHeight + space.sm,
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
    },
    section: {
        marginTop: space.xxl,
        paddingHorizontal: space.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.tertiaryText,
        marginBottom: space.sm,
        textTransform: "uppercase",
        letterSpacing: 1.2,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.text,
        marginLeft: space.md,
    },
    themeOptionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: space.sm,
        gap: space.xs,
    },
    themeOption: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: space.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.cardBackground,
    },
    themeOptionSelected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
    },
    themeOptionText: {
        fontSize: 14,
        fontFamily: fonts.semibold,
        marginLeft: space.xs,
    },
    theSmallText: {
        fontSize: 13,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        paddingTop: space.sm,
        alignSelf: "center",
        textAlign: "center",
    },
    themeHelperText: {
        fontSize: 13,
        fontFamily: fonts.body,
        color: colors.secondaryText,
        marginTop: space.sm,
        lineHeight: 18,
        marginBottom: space.sm,
    },
});

export default SettingsScreen;
