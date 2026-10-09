import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReverseMarketplaceCardProps {
  onPostRequirement: () => void;
  onViewMyPosts: () => void;
  postCount?: number;
}

export function ReverseMarketplaceCard({
  onPostRequirement,
  onViewMyPosts,
  postCount = 1,
}: ReverseMarketplaceCardProps) {
  return (
    <View style={styles.cardContainer}>
      {/* Top Tag */}
      <View style={styles.tagRow}>
        <Ionicons name="megaphone-outline" size={15} color="#15803D" style={styles.tagIcon} />
        <Text style={styles.tagText}>REVERSE MARKETPLACE</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{"Can't find exact harvest volume?"}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Post custom produce quantities. Regional smallholders bid directly with field-cut timetables.
      </Text>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        {/* Post a Requirement Button */}
        <Pressable
          style={({ pressed }) => [styles.postBtn, pressed && styles.btnPressed]}
          onPress={onPostRequirement}
          accessibilityRole="button"
          accessibilityLabel="Post a Requirement">
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.postBtnText}>Post a Requirement</Text>
        </Pressable>

        {/* My Posts Button */}
        <Pressable
          style={({ pressed }) => [styles.myPostsBtn, pressed && styles.btnPressed]}
          onPress={onViewMyPosts}
          accessibilityRole="button"
          accessibilityLabel="My Posts">
          <Text style={styles.myPostsText}>My Posts</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{postCount}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#DCFCE7', // Light green tint as shown in screenshot
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tagIcon: {
    transform: [{ rotate: '-10deg' }],
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#14532D', // Deep forest green matching screenshot
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  myPostsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  myPostsText: {
    color: '#9A3412', // Warm brownish-orange tone
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#EA580C', // Bright orange circle badge
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  btnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
