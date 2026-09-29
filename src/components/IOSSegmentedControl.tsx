import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface IOSSegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  badgeCounts?: (number | undefined)[];
}

export const IOSSegmentedControl: React.FC<IOSSegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
  badgeCounts,
}) => {
  let isDark = false;
  try {
    const appContext = useApp();
    isDark = appContext?.themeMode === 'dark';
  } catch {
    isDark = false;
  }

  const [width, setWidth] = React.useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const itemWidth = width > 0 ? (width - 6) / options.length : 0;

  useEffect(() => {
    if (itemWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: selectedIndex * itemWidth,
        damping: 20,
        mass: 0.9,
        stiffness: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, itemWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[
        styles.container,
        isDark && {
          backgroundColor: '#1C1C1E',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      ]}
      onLayout={handleLayout}
    >
      {itemWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            isDark && {
              backgroundColor: '#2C2C2E',
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
            {
              width: itemWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
      )}
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const count = badgeCounts ? badgeCounts[index] : undefined;

        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.7}
            onPress={() => onChange(index)}
            style={styles.optionBtn}
          >
            <Text
              style={[
                styles.optionText,
                isSelected
                  ? [styles.optionTextSelected, isDark && { color: '#FFFFFF' }]
                  : [styles.optionTextUnselected, isDark && { color: '#9CA3AF' }],
              ]}
              numberOfLines={1}
            >
              {option}
            </Text>
            {count !== undefined && count > 0 && (
              <View
                style={[
                  styles.badge,
                  isDark && { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                  isSelected && styles.badgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isDark && { color: '#E5E7EB' },
                    isSelected && styles.badgeTextSelected,
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(230, 235, 238, 0.68)', // Apple frosted glass track
    borderRadius: 16,
    padding: 3,
    position: 'relative',
    height: 42,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)' as any,
  },
  activeIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: '#FFFFFF', // Apple floating pill
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    gap: 5,
  },
  optionText: {
    fontSize: 13,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.earthTextPrimary,
  },
  optionTextUnselected: {
    fontWeight: '500',
    color: colors.earthTextSecondary,
  },
  badge: {
    backgroundColor: 'rgba(60, 60, 67, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeSelected: {
    backgroundColor: colors.forestGreenPrimary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.earthTextSecondary,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
} as any);
