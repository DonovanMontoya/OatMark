import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
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
  themePreference: 'auto',
  setThemePreference: () => {},
  toggleTheme: () => {},
});

// Create the provider component
export const ThemeProvider = ({ children }) => {
  // Get the device color scheme
  const deviceColorScheme = useColorScheme();

  // Initialize theme based on device preference
  const [isDark, setIsDark] = useState(deviceColorScheme === 'dark');
  const [themePreference, setThemePreferenceState] = useState('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        const allowedPreferences = ['light', 'dark', 'auto'];
        const initialPreference =
          savedTheme && allowedPreferences.includes(savedTheme)
            ? savedTheme
            : 'auto';

        setThemePreferenceState(initialPreference);
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setThemePreferenceState('auto');
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, []);

  // Apply theme based on preference and device setting
  useEffect(() => {
    if (themePreference === 'auto') {
      setIsDark(deviceColorScheme === 'dark');
    } else {
      setIsDark(themePreference === 'dark');
    }
  }, [deviceColorScheme, themePreference]);

  // Persist and update the theme preference
  const setThemePreference = useCallback(async (preference) => {
    setThemePreferenceState(preference);

    try {
      await AsyncStorage.setItem('theme_preference', preference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  // Toggle theme function (switches between light and dark manual modes)
  const toggleTheme = useCallback(async () => {
    const newPreference = isDark ? 'light' : 'dark';
    await setThemePreference(newPreference);
  }, [isDark, setThemePreference]);

  // Determine current theme colors and add isDark flag
  const colors = {
    ...(isDark ? darkTheme : lightTheme),
    isDark, // Add isDark to colors object so styles can access it
  };

  // Memoize context value to avoid unnecessary re-renders
  const themeContextValue = useMemo(
    () => ({ isDark, colors, themePreference, setThemePreference, toggleTheme }),
    [colors, isDark, themePreference, setThemePreference, toggleTheme]
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
