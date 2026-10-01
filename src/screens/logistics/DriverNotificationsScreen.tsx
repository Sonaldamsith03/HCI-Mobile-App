import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, LogisticsNotification } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

export const DriverNotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode } = useApp();
  const isDark = themeMode === 'dark';

  const [notifications, setNotifications] = useState<LogisticsNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const unsub = logisticsService.subscribeToNotifications(list => setNotifications(list));
    return unsub;
  }, []);

  const handleMarkAllRead = () => {
    logisticsService.markAllNotificationsAsRead();
  };

  const handleNotificationPress = (notif: LogisticsNotification) => {
    logisticsService.markNotificationAsRead(notif.id);
    if (notif.deliveryId) {
      navigation.navigate('DriverTripDetail', { deliveryId: notif.deliveryId });
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type: LogisticsNotification['type']) => {
    switch (type) {
      case 'new_request':
        return { name: 'radio-outline' as const, color: '#06C167' };
      case 'driver_assigned':
        return { name: 'car-outline' as const, color: '#276EF1' };
      case 'goods_collected':
        return { name: 'checkbox-outline' as const, color: '#7C3AED' };
      case 'completed':
        return { name: 'checkmark-circle-outline' as const, color: '#06C167' };
      case 'earnings':
        return { name: 'wallet-outline' as const, color: '#FFB800' };
      case 'cancelled':
        return { name: 'close-circle-outline' as const, color: '#FF3B30' };
      default:
        return { name: 'notifications-outline' as const, color: '#8E8E93' };
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <Text style={[styles.title, isDark && styles.textWhite]}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, isDark ? styles.chipDark : styles.chipLight, filter === 'all' && styles.chipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, isDark && styles.textWhite, filter === 'all' && styles.chipTextActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, isDark ? styles.chipDark : styles.chipLight, filter === 'unread' && styles.chipActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.chipText, isDark && styles.textWhite, filter === 'unread' && styles.chipTextActive]}>
            Unread ({notifications.filter(n => !n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNotifs.length === 0 ? (
          <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
            <Ionicons name="notifications-off-outline" size={44} color="#8E8E93" />
            <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>You're all caught up</Text>
            <Text style={styles.emptySub}>
              New cargo assignments, route dispatches, and payout receipts will notify you here.
            </Text>
          </View>
        ) : (
          filteredNotifs.map(notif => {
            const iconConfig = getNotifIcon(notif.type);
            const timeStr = new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard,
                  isDark ? styles.cardDark : styles.cardLight,
                  !notif.isRead && styles.cardUnread,
                ]}
                onPress={() => handleNotificationPress(notif)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, { backgroundColor: `${iconConfig.color}18` }]}>
                  <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                </View>

                <View style={styles.notifContent}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={[styles.notifTitle, isDark && styles.textWhite, !notif.isRead && styles.boldTitle]}>
                      {notif.title}
                    </Text>
                    <Text style={styles.notifTime}>{timeStr}</Text>
                  </View>

                  <Text style={styles.notifMessage} numberOfLines={2}>
                    {notif.message}
                  </Text>

                  {notif.deliveryId && (
                    <View style={styles.tripBadge}>
                      <Text style={styles.tripBadgeText}>Trip #{notif.deliveryId}</Text>
                      <Ionicons name="chevron-forward" size={12} color="#06C167" />
                    </View>
                  )}
                </View>

                {!notif.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaDark: {
    backgroundColor: '#000000',
  },
  safeAreaLight: {
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topBarDark: {
    backgroundColor: '#000000',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topBarLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  markReadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipLight: {
    backgroundColor: '#F3F4F6',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  chipActive: {
    borderColor: '#06C167',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  chipTextActive: {
    color: '#06C167',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 5,
    gap: 12,
  },
  cardDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardUnread: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#06C167',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  boldTitle: {
    fontWeight: '800',
  },
  notifTime: {
    fontSize: 10,
    color: '#8E8E93',
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 2,
  },
  tripBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
    marginTop: 4,
  },
  emptyBox: {
    padding: 36,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyDark: {
    backgroundColor: '#161616',
  },
  emptyLight: {
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
