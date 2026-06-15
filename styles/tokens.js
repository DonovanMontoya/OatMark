/**
 * Design tokens shared across the app.
 *
 * These are theme-independent primitives (the "Oat & Espresso" system):
 * a consistent radius scale, spacing scale, type ramp, and shadow presets.
 * Colors live in ThemeContext; everything that defines *shape*, *rhythm*,
 * and *type* lives here so the whole UI stays in lockstep.
 */

// Corner radius scale — soft, paper-like rounding throughout.
export const radius = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 999,
};

// Spacing scale (8pt-ish rhythm with a 4 step for fine work).
export const space = {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 44,
};

/**
 * Font families. These strings must match the keys loaded via `useFonts`
 * in App.js. Fraunces is the warm, editorial display face (headings,
 * shop names, the wordmark); Hanken Grotesk is the friendly humanist body.
 */
export const fonts = {
    // Display (Fraunces)
    display: 'Fraunces_700Bold',
    displayBlack: 'Fraunces_900Black',
    displaySemi: 'Fraunces_600SemiBold',
    displayMedium: 'Fraunces_500Medium',
    // Body (Hanken Grotesk)
    body: 'HankenGrotesk_400Regular',
    medium: 'HankenGrotesk_500Medium',
    semibold: 'HankenGrotesk_600SemiBold',
    bold: 'HankenGrotesk_700Bold',
    extrabold: 'HankenGrotesk_800ExtraBold',
};

// The map passed to useFonts (kept here so App.js stays declarative).
export { default as fontAssets } from './fontAssets';

/**
 * Build a layered, theme-aware shadow. Warm shadow in light mode so cards
 * feel like paper on a table rather than floating in cold space.
 * @param {Object} colors theme colors (needs `isDark` + `shadow`)
 * @param {'sm'|'md'|'lg'|'xl'} level elevation level
 */
export const makeShadow = (colors, level = 'md') => {
    const presets = {
        sm: {h: 2, r: 6, oLight: 0.08, oDark: 0.25, e: 2},
        md: {h: 6, r: 16, oLight: 0.1, oDark: 0.32, e: 6},
        lg: {h: 10, r: 24, oLight: 0.14, oDark: 0.42, e: 12},
        xl: {h: 16, r: 32, oLight: 0.18, oDark: 0.5, e: 20},
    };
    const p = presets[level] || presets.md;
    return {
        shadowColor: colors.shadow || '#000',
        shadowOffset: {width: 0, height: p.h},
        shadowOpacity: colors.isDark ? p.oDark : p.oLight,
        shadowRadius: p.r,
        elevation: p.e,
    };
};
