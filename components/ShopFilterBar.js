import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {fonts, radius, space} from '../styles/tokens';
import {PRICE_FILTERS, ensureBrandIncluded, isSameBrand} from '../utils/shopFilters';

/**
 * Horizontal chip row for filtering shops by upcharge and oat milk brand.
 * Price chips and brand chips are each single-select toggles; tapping an
 * active chip clears it. The two filter types compose (brand AND price).
 */
const ShopFilterBar = ({
    brands,
    selectedBrand,
    onSelectBrand,
    selectedPriceId,
    onSelectPrice,
}) => {
    const {colors} = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);

    // Keep the active brand renderable even if it drops out of the
    // top-brands list, so the filter always has a visible, clearable chip
    const chipBrands = useMemo(
        () => ensureBrandIncluded(brands, selectedBrand),
        [brands, selectedBrand],
    );

    if (chipBrands.length === 0 && PRICE_FILTERS.length === 0) {
        return null;
    }

    const renderChip = (key, label, isSelected, onPress) => (
        <TouchableOpacity
            key={key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            accessibilityLabel={`Filter: ${label}`}
        >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {PRICE_FILTERS.map((filter) =>
                renderChip(
                    `price-${filter.id}`,
                    filter.label,
                    selectedPriceId === filter.id,
                    () => onSelectPrice(selectedPriceId === filter.id ? null : filter.id)
                )
            )}
            {chipBrands.map((brand) =>
                renderChip(
                    `brand-${brand}`,
                    brand,
                    isSameBrand(selectedBrand, brand),
                    () => onSelectBrand(isSameBrand(selectedBrand, brand) ? null : brand)
                )
            )}
        </ScrollView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        gap: space.xs,
    },
    chip: {
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipSelected: {
        backgroundColor: colors.accentSoft,
        borderColor: colors.accentBorder,
    },
    chipText: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
    },
    chipTextSelected: {
        color: colors.accent,
        fontFamily: fonts.semibold,
    },
});

export default ShopFilterBar;
