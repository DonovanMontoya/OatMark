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

// ---------------------------------------------------------------------------
// "Oat & Espresso" palette
//
// The brand is an oat-milk carton inked in espresso on warm cream (see the
// app icon). The UI follows suit: cream paper, espresso ink, a roasted
// caramel accent, and a leaf green that nods to the oat sprig. Dark mode is a
// "dark roast" — deep warm browns instead of cold midnight blue.
//
// Every key from the original theme is preserved so existing styles keep
// working; the additions are semantic tokens (accent, surface, favorite,
// warning, …) that screens used to hardcode.
// ---------------------------------------------------------------------------
const lightTheme = {
  // Backgrounds — layered creams from canvas → elevated surface
  background: '#F4EDDD',          // warm oat canvas
  secondaryBackground: '#ECE3CF', // grouped sections
  cardBackground: '#FBF7EE',      // cards lift off the canvas
  surface: '#FBF7EE',             // alias for elevated surfaces
  surfaceMuted: '#EFE6D4',        // chips, inputs, wells
  inputBackground: '#F3EBD9',

  // Text — espresso ink on cream
  text: '#2A211A',
  secondaryText: '#6E6152',
  tertiaryText: '#9C8F7C',
  textSecondary: '#6E6152',       // alias (some screens referenced this name)

  // Lines
  border: '#E4D9C2',
  divider: '#E8DFCB',
  icon: '#5A4D3F',

  // Brand / interactive
  primary: '#A85F28',             // roasted caramel — primary actions
  accent: '#A85F28',
  accentSoft: 'rgba(168, 95, 40, 0.12)',
  accentBorder: 'rgba(168, 95, 40, 0.35)',
  onAccent: '#FFF8EC',            // text/icons on the accent

  success: '#5B8A3C',             // leaf green (the oat sprig)
  successSoft: 'rgba(91, 138, 60, 0.14)',
  danger: '#B23B2E',              // warm brick
  dangerSoft: 'rgba(178, 59, 46, 0.12)',
  warning: '#D8902F',             // honey amber — alerts, admin, offline
  warningSoft: 'rgba(216, 144, 47, 0.16)',
  favorite: '#CF5C46',            // terracotta heart
  favoriteSoft: 'rgba(207, 92, 70, 0.14)',

  // Specific component backgrounds
  menuBackground: '#FBF7EE',
  overlayBackground: 'rgba(251, 247, 238, 0.98)',
  modalBackground: 'rgba(42, 33, 26, 0.45)',

  // Effects
  shadow: '#5A3D1E',              // warm shadow, not cold black

  // Map related
  locationButton: '#2A211A',
  locationButtonText: '#FFF8EC',
};

const darkTheme = {
  // Backgrounds — dark roast browns
  background: '#1A1410',
  secondaryBackground: '#221A14',
  cardBackground: '#2A201A',
  surface: '#2A201A',
  surfaceMuted: '#332720',
  inputBackground: '#332720',

  // Text — cream on espresso
  text: '#F2E9D8',
  secondaryText: '#BCAC97',
  tertiaryText: '#8C7D6B',
  textSecondary: '#BCAC97',

  // Lines
  border: '#3B2E24',
  divider: '#3B2E24',
  icon: '#BCAC97',

  // Brand / interactive — brighter caramel pops on the dark roast
  primary: '#E0944A',
  accent: '#E0944A',
  accentSoft: 'rgba(224, 148, 74, 0.16)',
  accentBorder: 'rgba(224, 148, 74, 0.40)',
  onAccent: '#241710',            // dark ink reads better on bright caramel

  success: '#7FB158',
  successSoft: 'rgba(127, 177, 88, 0.18)',
  danger: '#E5705F',
  dangerSoft: 'rgba(229, 112, 95, 0.16)',
  warning: '#E8A23C',
  warningSoft: 'rgba(232, 162, 60, 0.18)',
  favorite: '#E07B62',
  favoriteSoft: 'rgba(224, 123, 98, 0.20)',

  // Specific component backgrounds
  menuBackground: '#2A201A',
  overlayBackground: 'rgba(26, 20, 16, 0.98)',
  modalBackground: 'rgba(0, 0, 0, 0.6)',

  // Effects
  shadow: '#000000',

  // Map related
  locationButton: '#E0944A',
  locationButtonText: '#241710',
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
