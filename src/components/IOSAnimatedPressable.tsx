import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

interface IOSAnimatedPressableProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}

export const IOSAnimatedPressable: React.FC<IOSAnimatedPressableProps> = ({
  children,
  onPress,
  style,
  containerStyle,
  scaleTo = 0.96,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      damping: 15,
      mass: 0.8,
      stiffness: 250,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      mass: 0.8,
      stiffness: 200,
    }).start();
  };

  const flattened = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const extractedContainer: ViewStyle = {};
  if (flattened.flex !== undefined) extractedContainer.flex = flattened.flex;
  if (flattened.alignSelf !== undefined) extractedContainer.alignSelf = flattened.alignSelf;
  if (flattened.margin !== undefined) extractedContainer.margin = flattened.margin;
  if (flattened.marginTop !== undefined) extractedContainer.marginTop = flattened.marginTop;
  if (flattened.marginBottom !== undefined) extractedContainer.marginBottom = flattened.marginBottom;
  if (flattened.marginLeft !== undefined) extractedContainer.marginLeft = flattened.marginLeft;
  if (flattened.marginRight !== undefined) extractedContainer.marginRight = flattened.marginRight;
  if (flattened.width !== undefined) extractedContainer.width = flattened.width;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        extractedContainer,
        containerStyle,
      ]}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
