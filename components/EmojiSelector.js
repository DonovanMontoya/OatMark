import React, {useEffect, useRef, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {fonts, radius, space} from '../styles/tokens';

export const COFFEE_MILK_EMOJIS = [
    {emoji: '☕', label: 'Coffee'},
    {emoji: '🍵', label: 'Tea'},
    {emoji: '🍸', label: 'Cocktail'},
    {emoji: '🥐', label: 'Croissant'},
    {emoji: '🥯', label: 'Bagel'},
    {emoji: '🍩', label: 'Donut'},
    {emoji: '🧁', label: 'Cupcake'},
    {emoji: '🍰', label: 'Cake'},
    {emoji: '🥧', label: 'Pie'},
    {emoji: '🍪', label: 'Cookie'},
    {emoji: '🥖', label: 'Baguette'},
    {emoji: '🍞', label: 'Bread'},
    {emoji: '🥨', label: 'Pretzel'},
    {emoji: '🥪', label: 'Sandwich'},
    {emoji: '🥗', label: 'Salad'},
    {emoji: '🪴', label: 'Potted Plant'},
    {emoji: '🥛', label: 'Milk'},
    {emoji: '🥤', label: 'Cup with Straw'},
    {emoji: '🧋', label: 'Bubble Tea'},
    {emoji: '🫖', label: 'Teapot'},
    {emoji: '✌️', label: 'Peace'},
    {emoji: '🦆', label: 'Duck'},
    {emoji: '🍼', label: 'Baby Bottle'},
    {emoji: '🥣', label: 'Bowl with Spoon'},
    {emoji: '🍶', label: 'Sake'},
    {emoji: '🏪', label: 'Convenience Store'},
    {emoji: '🏬', label: 'Department Store'},
    {emoji: '🏢', label: 'Office Building'},
    {emoji: '🌱', label: 'Seedling'},
    {emoji: '🌿', label: 'Herb'},
];

/**
 * Gets a random emoji from the available emojis
 * @returns {string} A random emoji
 */
export const getRandomEmoji = () => {
    const randomIndex = Math.floor(Math.random() * COFFEE_MILK_EMOJIS.length);
    return COFFEE_MILK_EMOJIS[randomIndex].emoji;
};

const EmojiSelector = ({selectedEmoji, onSelectEmoji}) => {
    const {colors} = useTheme();
    const styles = useMemo(() => getStyles(colors), [colors]);
    const scrollViewRef = useRef(null);
    const EMOJI_BUTTON_WIDTH = 70;
    const EMOJI_BUTTON_MARGIN = 12;
    const EMOJI_BUTTON_TOTAL_WIDTH = EMOJI_BUTTON_WIDTH + EMOJI_BUTTON_MARGIN;

    // Scroll to selected emoji when component mounts or selectedEmoji changes
    useEffect(() => {
        if (selectedEmoji && scrollViewRef.current) {
            const emojiIndex = COFFEE_MILK_EMOJIS.findIndex(item => item.emoji === selectedEmoji);
            if (emojiIndex !== -1) {
                // Calculate scroll position to center the selected emoji
                // Subtract half the screen width to center it (approximate)
                const scrollPosition = emojiIndex * EMOJI_BUTTON_TOTAL_WIDTH - 150;
                
                // Use setTimeout to ensure the ScrollView is laid out before scrolling
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                        x: Math.max(0, scrollPosition),
                        animated: true,
                    });
                }, 100);
            }
        }
    }, [selectedEmoji]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select an emoji for your shop</Text>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.emojiScrollContainer}
            >
                {COFFEE_MILK_EMOJIS.map((item) => (
                    <TouchableOpacity
                        key={item.emoji}
                        style={[
                            styles.emojiButton,
                            selectedEmoji === item.emoji && styles.selectedEmojiButton
                        ]}
                        onPress={() => onSelectEmoji(item.emoji)}
                    >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <Text style={styles.emojiLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.selectedContainer}>
                <Text style={styles.selectedLabel}>Selected:</Text>
                <View style={styles.selectedEmojiContainer}>
                    <Text style={styles.selectedEmoji}>
                        {selectedEmoji || 'Select an emoji'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        marginBottom: space.lg,
    },
    title: {
        fontSize: 16,
        fontFamily: fonts.semibold,
        color: colors.text,
        marginBottom: space.sm,
    },
    emojiScrollContainer: {
        paddingVertical: space.sm,
    },
    emojiButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: space.sm,
        width: 70,
        height: 90,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
        padding: space.xs,
    },
    selectedEmojiButton: {
        borderColor: colors.accent,
        borderWidth: 2,
        backgroundColor: colors.accentSoft,
    },
    emoji: {
        fontSize: 28,
        marginBottom: space.xxs,
    },
    emojiLabel: {
        fontSize: 10,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
        textAlign: 'center',
    },
    selectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: space.md,
    },
    selectedLabel: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.secondaryText,
        marginRight: space.sm,
    },
    selectedEmojiContainer: {
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceMuted,
        borderWidth: 1,
        borderColor: colors.border,
    },
    selectedEmoji: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: colors.text,
    },
});

export default EmojiSelector;
