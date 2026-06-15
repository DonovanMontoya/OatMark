import React, {useEffect, useState} from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {getIdTokenResult, signOut} from 'firebase/auth';
import {auth} from '../services/firebase';
import {useTheme} from '../contexts/ThemeContext';
import {createHamburgerMenuStyles} from '../styles/ThemeStyles';


const HamburgerMenu = ({onSubmitShop, onSettings, onPendingShops, onAdminPanel}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Get theme context
    const {colors} = useTheme();

    // Create theme-aware styles
    const styles = createHamburgerMenuStyles(colors);

    useEffect(() => {
        const checkAdmin = async () => {
            if (auth.currentUser) {
                try {
                    const tokenResult = await getIdTokenResult(auth.currentUser);
                    setIsAdmin(!!tokenResult.claims.admin);
                } catch (error) {
                    console.error('Failed to fetch token:', error);
                }
            }
        };
        checkAdmin();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Logged out!');
            setIsMenuVisible(false);
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    const handleSubmitShop = () => {
        setIsMenuVisible(false);
        if (onSubmitShop) {
            onSubmitShop();
        }
    };

    const handleSettings = () => {
        setIsMenuVisible(false);
        if (onSettings) {
            onSettings();
        }
    };

    const handlePendingShops = () => {
        setIsMenuVisible(false);
        if (onPendingShops) {
            onPendingShops();
        }
    };

    const handleAdminPanel = () => {
        setIsMenuVisible(false);
        if (onAdminPanel) {
            onAdminPanel();
        }
    };

    return (
        <>
            <TouchableOpacity
                style={styles.hamburgerButton}
                onPress={() => setIsMenuVisible(true)}
            >
                <FontAwesome6
                    name="bars"
                    size={20}
                    color={colors.locationButtonText}
                    iconStyle="solid"
                />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={() => setIsMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setIsMenuVisible(false)}
                >
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleSubmitShop}
                        >
                            <FontAwesome6
                                name="plus"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                                style={styles.menuIcon}
                            />
                            <Text style={styles.menuText}>Submit Shop</Text>
                        </TouchableOpacity>

                        {auth.currentUser && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handlePendingShops}
                            >
                                <FontAwesome6
                                    name="clock"
                                    size={18}
                                    color={colors.warning}
                                    iconStyle="solid"
                                    style={styles.menuIcon}
                                />
                                <Text style={styles.menuText}>My Pending Shops</Text>
                            </TouchableOpacity>
                        )}

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleAdminPanel}
                            >
                                <FontAwesome6
                                    name="shield"
                                    size={18}
                                    color={colors.primary}
                                    iconStyle="solid"
                                    style={styles.menuIcon}
                                />
                                <Text style={styles.menuText}>Admin Panel</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleSettings}
                        >
                            <FontAwesome6
                                name="gear"
                                size={18}
                                color={colors.icon}
                                iconStyle="solid"
                                style={styles.menuIcon}
                            />
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuItem, styles.logoutMenuItem]}
                            onPress={handleLogout}
                        >
                            <FontAwesome6
                                name="right-from-bracket"
                                size={18}
                                color={colors.danger}
                                iconStyle="solid"
                                style={styles.menuIcon}
                            />
                            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default HamburgerMenu;
