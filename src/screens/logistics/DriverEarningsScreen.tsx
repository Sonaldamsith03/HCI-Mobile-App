import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DriverEarningsSummary } from '../../types';
import { logisticsService } from '../../services/logisticsService';
import { useApp } from '../../context/AppContext';
import { EarningsSummaryCard } from '../../components/logistics/EarningsSummaryCard';
import { colors } from '../../theme/colors';

export const DriverEarningsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, showToast } = useApp();
  const isDark = themeMode === 'dark';

  const [summary, setSummary] = useState<DriverEarningsSummary>(logisticsService.getEarningsSummary());

  useEffect(() => {
    const unsub = logisticsService.subscribeToCurrentDriver(() => {
      setSummary(logisticsService.getEarningsSummary());
    });
    return unsub;
  }, []);

  const handleWithdraw = () => {
    Alert.alert(
      'AgriPay Instant Payout',
      `Transfer LKR ${summary.total.toLocaleString()} directly to your linked commercial bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw Funds',
          onPress: () => {
            showToast(`Payout of LKR ${summary.total.toLocaleString()} processed!`, 'success');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.safeAreaDark : styles.safeAreaLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topBar, isDark ? styles.topBarDark : styles.topBarLight]}>
        <Text style={[styles.title, isDark && styles.textWhite]}>Driver Earnings</Text>
        <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} activeOpacity={0.8}>
          <Ionicons name="arrow-up-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.withdrawText}>WITHDRAW</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Earnings Card with Chart */}
        <EarningsSummaryCard summary={summary} isDark={isDark} />

        {/* Payout Mechanism Notice */}
        <View style={[styles.payoutNotice, isDark ? styles.noticeDark : styles.noticeLight]}>
          <Ionicons name="shield-checkmark" size={20} color="#06C167" />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Automatic Escrow Release Payouts</Text>
            <Text style={styles.noticeSub}>
              82% of every customer delivery fee is instantly credited to your wallet the moment buyer enters the 4-digit PIN upon arrival.
            </Text>
          </View>
        </View>

        {/* Trip Payouts Ledger Section */}
        <View style={styles.ledgerHeader}>
          <Text style={[styles.ledgerTitle, isDark && styles.textWhite]}>Completed Trip Payouts</Text>
          <Text style={styles.ledgerCount}>{summary.tripHistory.length} Transactions</Text>
        </View>

        {summary.tripHistory.length === 0 ? (
          <View style={[styles.emptyBox, isDark ? styles.emptyDark : styles.emptyLight]}>
            <Ionicons name="receipt-outline" size={40} color="#8E8E93" />
            <Text style={[styles.emptyTitle, isDark && styles.textWhite]}>No Completed Trips Yet</Text>
            <Text style={styles.emptySub}>
              Payouts from verified cargo deliveries will appear in this ledger.
            </Text>
          </View>
        ) : (
          summary.tripHistory.map(record => (
            <TouchableOpacity
              key={record.deliveryId}
              style={[styles.tripRecordCard, isDark ? styles.recordDark : styles.recordLight]}
              onPress={() => navigation.navigate('DriverTripDetail', { deliveryId: record.deliveryId })}
              activeOpacity={0.8}
            >
              <View style={styles.recordIconCol}>
                <Ionicons name="checkmark-circle" size={20} color="#06C167" />
              </View>

              <View style={styles.recordDetailsCol}>
                <View style={styles.recordTitleRow}>
                  <Text style={[styles.recordGoods, isDark && styles.textWhite]}>
                    {record.goodsName}
                  </Text>
                  <Text style={styles.recordPayout}>+LKR {record.driverEarnings.toLocaleString()}</Text>
                </View>

                <View style={styles.recordSubRow}>
                  <Text style={styles.recordTripId}>#{record.deliveryId} • {record.date}</Text>
                  <Text style={styles.recordCustomerFee}>
                    Gross: LKR {record.customerFee.toLocaleString()} (18% comm.)
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06C167',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  withdrawText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  payoutNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    marginVertical: 10,
    gap: 12,
  },
  noticeDark: {
    backgroundColor: 'rgba(6, 193, 103, 0.08)',
  },
  noticeLight: {
    backgroundColor: '#ECFDF5',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06C167',
  },
  noticeSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 16,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  ledgerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
  },
  ledgerCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  tripRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 5,
    gap: 12,
  },
  recordDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  recordLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  recordIconCol: {},
  recordDetailsCol: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordGoods: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  recordPayout: {
    fontSize: 15,
    fontWeight: '900',
    color: '#06C167',
  },
  recordSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  recordTripId: {
    fontSize: 11,
    color: '#8E8E93',
  },
  recordCustomerFee: {
    fontSize: 10,
    color: '#8E8E93',
  },
  emptyBox: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 14,
  },
  emptyDark: {
    backgroundColor: '#161616',
  },
  emptyLight: {
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000000',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
