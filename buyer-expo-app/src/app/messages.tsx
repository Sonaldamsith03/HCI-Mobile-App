import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar } from '@/components/BottomNavBar';
import { FloatingCartBar, FarmToast } from '@/components/FloatingCartBar';

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar: any;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'meadowview-homestead',
    name: 'Meadowview Homestead',
    role: 'Saman & Niluka Perera • Plot 4',
    avatar: require('@/assets/images/farmby/farm_family.jpg'),
    lastMessage: 'Your batch of artisanal strawberries & baby veg is ready for farmgate pickup!',
    time: '7:42 AM',
    unreadCount: 1,
  },
  {
    id: 'maliths-family-farm',
    name: "Malith's Family Farm",
    role: 'Malith Bandara • Green Valley',
    avatar: require('@/assets/images/farmby/hero_peppers_tomatoes.jpg'),
    lastMessage: 'Peppers and vine tomatoes picked at 5:30 AM with morning dew intact! Crated now.',
    time: '6:15 AM',
    unreadCount: 1,
  },
  {
    id: 'green-acres-eco',
    name: 'Green Acres Eco',
    role: 'Kumari Silva • Riverbend',
    avatar: require('@/assets/images/farmby/rainbow_chard.jpg'),
    lastMessage: 'Yes, our Tuesday dawn cut of rainbow chard is confirmed for your order.',
    time: 'Yesterday',
    unreadCount: 0,
  },
  {
    id: 'oakridge-farm',
    name: 'Oakridge Farm',
    role: 'Rohan Jayasinghe • Oakridge Slope',
    avatar: require('@/assets/images/farmby/vine_tomatoes.jpg'),
    lastMessage: 'Offer accepted for 10 kg heirloom tomatoes. Courier assigned.',
    time: 'Oct 7',
    unreadCount: 0,
  },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FarmToast />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Direct Farmer Messages</Text>
          <Text style={styles.headerSubtitle}>Direct chat with small-scale farm growers</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>2 new</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {CONVERSATIONS.map((conv) => (
            <Pressable
              key={conv.id}
              style={({ pressed }) => [styles.convCard, pressed && styles.pressed]}
              onPress={() => router.push(`/chat/${conv.id}` as any)}>
              <View style={styles.avatarWrapper}>
                <Image source={conv.avatar} style={styles.avatar} contentFit="cover" />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.convDetails}>
                <View style={styles.convTopRow}>
                  <Text style={styles.convName}>{conv.name}</Text>
                  <Text style={styles.convTime}>{conv.time}</Text>
                </View>

                <Text style={styles.convRole}>{conv.role}</Text>
                <Text
                  style={[
                    styles.lastMessage,
                    conv.unreadCount > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}>
                  {conv.lastMessage}
                </Text>
              </View>

              {conv.unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{conv.unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingCartBar />
      <BottomNavBar currentTab="messages" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: '#FFEDD5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#EA580C',
    fontSize: 11.5,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  contentContainer: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  list: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  pressed: {
    backgroundColor: '#F8FAFC',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convDetails: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  convName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  convTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  convRole: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 12.5,
    color: '#64748B',
  },
  lastMessageUnread: {
    color: '#0F172A',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
