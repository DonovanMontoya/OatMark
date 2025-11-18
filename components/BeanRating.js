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

    const beanEmoji = '🫘';

    const Wrapper = interactive ? TouchableOpacity : View;
    const wrapperProps = interactive ? {
      onPress: () => handlePress(index),
      activeOpacity: 0.6
    } : {};

    // For half beans, layer a faded bean with a half-clipped filled bean on top
    if (isHalf) {
      return (
        <Wrapper key={index} {...wrapperProps}>
          <View style={styles.beanWrapper}>
            {/* Background faded bean */}
            <Text style={[styles.bean, { fontSize: size, opacity: 0.25 }]}>
              {beanEmoji}
            </Text>
            {/* Half-filled bean overlay */}
            <View style={[styles.halfBeanOverlay, { width: size * 0.5 }]}>
              <Text style={[styles.bean, styles.halfBean, { fontSize: size }]}>
                {beanEmoji}
              </Text>
            </View>
          </View>
        </Wrapper>
      );
    }

    // Regular filled or empty bean
    const opacity = isFilled ? 1.0 : 0.25;

    return (
      <Wrapper key={index} {...wrapperProps}>
        <Text style={[
          styles.bean,
          { fontSize: size, opacity }
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
  beanWrapper: {
    position: 'relative',
  },
  halfBeanOverlay: {
    position: 'absolute',
    left: 2,
    top: 0,
    overflow: 'hidden',
  },
  halfBean: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  countText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default BeanRating;
