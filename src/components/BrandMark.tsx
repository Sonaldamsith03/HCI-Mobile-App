import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface BrandMarkProps {
  size?: number;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 80 }) => {
  const borderRadius = size * 0.25;

  return (
    <View style={[styles.shadowContainer, { width: size, height: size, borderRadius }]}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            backgroundColor: '#000000',
            borderWidth: 1,
            borderColor: '#2A2A2A',
          },
        ]}
      >
        <View style={styles.iconLayer}>
          <MaterialCommunityIcons name="sprout" size={size * 0.46} color="#06C167" />
          <Ionicons
            name="git-network-outline"
            size={size * 0.28}
            color="#FFFFFF"
            style={{ position: 'absolute', top: size * 0.08 }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconLayer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
