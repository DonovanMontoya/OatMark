import React, {useEffect, useRef, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

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
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 10,
    },
    emojiScrollContainer: {
        paddingVertical: 10,
    },
    emojiButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        width: 70,
        height: 90,
        borderRadius: 12,
        backgroundColor: colors.isDark ? colors.secondaryBackground : '#f8f8f8',
        borderWidth: 1,
        borderColor: colors.border,
        padding: 8,
    },
    selectedEmojiButton: {
        borderColor: colors.primary,
        backgroundColor: colors.isDark ? 'rgba(92, 157, 255, 0.2)' : '#EFF6FF',
    },
    emoji: {
        fontSize: 28,
        marginBottom: 5,
    },
    emojiLabel: {
        fontSize: 10,
        color: colors.secondaryText,
        textAlign: 'center',
    },
    selectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    selectedLabel: {
        fontSize: 14,
        color: colors.secondaryText,
        marginRight: 10,
    },
    selectedEmojiContainer: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.isDark ? colors.secondaryBackground : '#f0f0f0',
        borderWidth: 1,
        borderColor: colors.border,
    },
    selectedEmoji: {
        fontSize: 16,
        color: colors.text,
    },
});

export default EmojiSelector;
