import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * BeanRating Component
 * Displays coffee bean ratings (out of 5 beans)
 *
 * @param {number} rating - Current rating value (0-5)
 * @param {function} onRate - Callback when user taps a bean (interactive mode)
 * @param {boolean} interactive - Whether beans are tappable
 * @param {number} size - Size of the bean emoji (default: 24)
 * @param {boolean} showCount - Show rating count next to beans
 * @param {number} count - Number of ratings
 */
const BeanRating = ({
  rating = 0,
  onRate = null,
  interactive = false,
  size = 24,
  showCount = false,
  count = 0
}) => {
  const { theme } = useTheme();
  const maxRating = 5;

  // Round rating to nearest 0.5 for display
  const displayRating = Math.round(rating * 2) / 2;

  const handlePress = (index) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  const renderBean = (index) => {
    const beanValue = index + 1;
    const isFilled = beanValue <= Math.floor(displayRating);
    const isHalf = beanValue === Math.ceil(displayRating) && displayRating % 1 !== 0;

    // Use coffee bean emoji - filled or empty
    const beanEmoji = isFilled || isHalf ? '🫘' : '○';

    const Wrapper = interactive ? TouchableOpacity : View;
    const wrapperProps = interactive ? {
      onPress: () => handlePress(index),
      activeOpacity: 0.6
    } : {};

    return (
      <Wrapper key={index} {...wrapperProps}>
        <Text style={[
          styles.bean,
          { fontSize: size },
          isFilled && styles.filledBean,
          !isFilled && { color: theme.colors.textSecondary }
        ]}>
          {beanEmoji}
        </Text>
      </Wrapper>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.beansContainer}>
        {[...Array(maxRating)].map((_, index) => renderBean(index))}
      </View>
      {showCount && count > 0 && (
        <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
          ({count})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beansContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bean: {
    marginHorizontal: 2,
  },
  filledBean: {
    // Filled beans use default color
  },
  countText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default BeanRating;
