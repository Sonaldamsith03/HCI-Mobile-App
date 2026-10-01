import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DriverEarningsSummary } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface EarningsSummaryCardProps {
  summary: DriverEarningsSummary;
  isDark?: boolean;
}

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({ summary, isDark = true }) => {
  // Weekly simulation heights for visual chart
  const weekDays = [
    { day: 'M', amount: 6200, height: 45 },
    { day: 'T', amount: 8400, height: 65 },
    { day: 'W', amount: 4800, height: 35 },
    { day: 'T', amount: 9200, height: 75 },
    { day: 'F', amount: 11500, height: 90 },
    { day: 'S', amount: 8500, height: 70, isToday: true },
    { day: 'S', amount: 0, height: 10 },
  ];

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Top Banner: Today's Earnings */}
      <View style={styles.todayRow}>
        <View>
          <Text style={styles.todayLabel}>TODAY'S NET EARNINGS</Text>
          <Text style={styles.todayAmount}>LKR {summary.today.toLocaleString()}</Text>
          <Text style={styles.todayTripsSub}>{summary.tripsToday} Completed Cargo Trips</Text>
        </View>

        <View style={styles.walletPill}>
          <Ionicons name="wallet-outline" size={14} color="#06C167" />
          <Text style={styles.walletText}>LKR {summary.total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Mini Visual Weekly Bar Chart */}
      <View style={[styles.chartContainer, isDark ? styles.chartDark : styles.chartLight]}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Weekly Revenue Velocity</Text>
          <Text style={styles.chartTotal}>Total LKR {summary.thisWeek.toLocaleString()}</Text>
        </View>

        <View style={styles.barsRow}>
          {weekDays.map((item, idx) => (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${item.height}%` },
                    item.isToday ? styles.barToday : styles.barNormal,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, item.isToday && styles.dayToday]}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Grid: This Week vs This Month */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricTile, isDark ? styles.tileDark : styles.tileLight]}>
          <Text style={styles.metricLabel}>THIS WEEK</Text>
          <Text style={[styles.metricVal, isDark && styles.textWhite]}>
            LKR {summary.thisWeek.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.metricTile, isDark ? styles.tileDark : styles.tileLight]}>
          <Text style={styles.metricLabel}>THIS MONTH</Text>
          <Text style={[styles.metricVal, isDark && styles.textWhite]}>
            LKR {summary.thisMonth.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.5,
  },
  todayAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#06C167',
    marginTop: 2,
  },
  todayTripsSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  walletText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06C167',
  },
  chartContainer: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  chartDark: {
    backgroundColor: '#202020',
  },
  chartLight: {
    backgroundColor: '#F9FAFB',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  chartTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
    paddingTop: 6,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 50,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barNormal: {
    backgroundColor: '#276EF1',
  },
  barToday: {
    backgroundColor: '#06C167',
  },
  dayLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 4,
  },
  dayToday: {
    color: '#06C167',
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
  },
  tileDark: {
    backgroundColor: '#202020',
  },
  tileLight: {
    backgroundColor: '#F3F4F6',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginTop: 2,
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
