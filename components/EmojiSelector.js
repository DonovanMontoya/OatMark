import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const COFFEE_MILK_EMOJIS = [
    {emoji: '☕', label: 'Coffee'},
    {emoji: '🥛', label: 'Milk'},
    {emoji: '🥤', label: 'Cup with Straw'},
    {emoji: '🍵', label: 'Tea'},
    {emoji: '🧋', label: 'Bubble Tea'},
    {emoji: '🫖', label: 'Teapot'},
    {emoji: '🍼', label: 'Baby Bottle'},
    {emoji: '🥣', label: 'Bowl with Spoon'},
    {emoji: '🍶', label: 'Sake'},
    {emoji: '🏪', label: 'Convenience Store'},
    {emoji: '🏬', label: 'Department Store'},
    {emoji: '🏢', label: 'Office Building'},
    {emoji: '🌱', label: 'Seedling'},
    {emoji: '🌿', label: 'Herb'},
    {emoji: '🪴', label: 'Potted Plant'},
    {emoji: '🍃', label: 'Leaf Fluttering'},
];

const EmojiSelector = ({selectedEmoji, onSelectEmoji}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select an emoji for your shop</Text>
            <ScrollView
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
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
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 8,
    },
    selectedEmojiButton: {
        borderColor: '#4285F4',
        backgroundColor: '#EFF6FF',
    },
    emoji: {
        fontSize: 28,
        marginBottom: 5,
    },
    emojiLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    selectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    selectedLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 10,
    },
    selectedEmojiContainer: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedEmoji: {
        fontSize: 16,
        color: '#333',
    },
});

export default EmojiSelector;