import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const HamburgerMenu = ({ onSubmitShop, onSettings }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  return (
    <>
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <FontAwesome6
          name="bars"
          size={20}
          color="white"
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
                color="#333"
                iconStyle="solid"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Submit Shop</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSettings}
            >
              <FontAwesome6
                name="gear"
                size={18}
                color="#333"
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
                color="#cc0000"
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

const styles = {
  hamburgerButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 100,
    marginLeft: 20,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 15,
    width: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutText: {
    color: '#cc0000',
  },
};

export default HamburgerMenu;
