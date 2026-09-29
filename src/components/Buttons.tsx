import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { IOSAnimatedPressable } from './IOSAnimatedPressable';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ForestPrimaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  return (
    <IOSAnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      style={[
        styles.baseButton,
        styles.primaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </View>
      )}
    </IOSAnimatedPressable>
  );
};

export const HarvestAccentButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  return (
    <IOSAnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.97}
      style={[
        styles.baseButton,
        styles.accentButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.accentText, textStyle]}>{title}</Text>
        </View>
      )}
    </IOSAnimatedPressable>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  return (
    <IOSAnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={0.98}
      style={[
        styles.baseButton,
        styles.secondaryButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
        </View>
      )}
    </IOSAnimatedPressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 40,
    borderRadius: 20, // Apple continuous pill
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 6,
  },
  primaryButton: {
    backgroundColor: '#1C1C1E', // Apple Dark Solid
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)', // Specular highlight
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  accentButton: {
    backgroundColor: colors.forestGreenPrimary, // Apple Luminous Emerald
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    shadowColor: colors.forestGreenPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 3,
  },
  accentText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: -0.2,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)', // Apple Frosted Glass
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    backdropFilter: 'blur(16px)' as any,
  },
  secondaryText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.45,
  },
} as any);
