import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
const lightTheme = {
  // Background colors
  background: '#FFFFFF',
  secondaryBackground: '#F9F9FB',
  cardBackground: '#FFFFFF',
  inputBackground: '#f9f9f9',
  
  // Text colors
  text: '#1a1a1a',
  secondaryText: '#666666',
  tertiaryText: '#999999',
  
  // UI element colors
  border: '#f0f0f0',
  divider: '#E5E5EA',
  icon: '#333333',
  
  // Interactive elements
  primary: '#4285F4',
  success: '#4CAF50',
  danger: '#cc0000',
  
  // Specific component backgrounds
  menuBackground: '#FFFFFF',
  overlayBackground: 'rgba(255, 255, 255, 0.98)',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  
  // Map related
  locationButton: '#333333',
  locationButtonText: '#FFFFFF',
};

const darkTheme = {
  // Background colors - using midnight blue tones
  background: '#0F1A2E',
  secondaryBackground: '#162A45',
  cardBackground: '#1E3356',
  inputBackground: '#2A4166',
  
  // Text colors - lighter for dark mode
  text: '#F0F0F0',
  secondaryText: '#CCCCCC',
  tertiaryText: '#AAAAAA',
  
  // UI element colors
  border: '#2A4166',
  divider: '#2A4166',
  icon: '#CCCCCC',
  
  // Interactive elements - brighter for dark mode
  primary: '#5C9DFF',
  success: '#6BCB70',
  danger: '#FF5252',
  
  // Specific component backgrounds
  menuBackground: '#1E3356',
  overlayBackground: 'rgba(15, 26, 46, 0.98)',
  modalBackground: 'rgba(0, 0, 0, 0.7)',
  
  // Map related
  locationButton: '#5C9DFF',
  locationButtonText: '#FFFFFF',
};

// Create the context
const ThemeContext = createContext({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
});

// Create the provider component
export const ThemeProvider = ({ children }) => {
  // Get the device color scheme
  const deviceColorScheme = useColorScheme();

  // Initialize theme based on device preference
  const [isDark, setIsDark] = useState(deviceColorScheme === 'dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          // No saved preference, use device preference
          setIsDark(deviceColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsDark(deviceColorScheme === 'dark');
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    // Save preference to AsyncStorage
    try {
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine current theme colors
  const colors = isDark ? darkTheme : lightTheme;

  // Memoize context value to avoid unnecessary re-renders
  const themeContextValue = useMemo(
    () => ({ isDark, colors, toggleTheme }),
    [isDark, colors]
  );

  // Don't render children until theme is loaded to avoid flashing
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
