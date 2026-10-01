import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryStatus, StatusHistoryEntry } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface DeliveryStatusTimelineProps {
  currentStatus: DeliveryStatus;
  history?: StatusHistoryEntry[];
  isDark?: boolean;
}

const LIFECYCLE_STEPS: { status: DeliveryStatus; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { status: 'Delivery Requested', label: 'Order & Delivery Requested', icon: 'cart-outline', desc: 'Buyer confirmed purchase with courier delivery' },
  { status: 'Searching for Driver', label: 'Matching Fleet Driver', icon: 'radio-outline', desc: 'Auto-dispatching to eligible trucks & vans' },
  { status: 'Driver Assigned', label: 'Driver Assigned', icon: 'person-outline', desc: 'Courier accepted and reserved cargo allocation' },
  { status: 'Driver En Route to Pickup', label: 'Heading to Farm Gate', icon: 'navigate-outline', desc: 'Traveling to agricultural loading point' },
  { status: 'Arrived at Pickup', label: 'Arrived at Farm Gate', icon: 'business-outline', desc: 'At grower location for cargo inspection' },
  { status: 'Goods Collected', label: 'Goods Collected & Verified', icon: 'checkbox-outline', desc: 'Crates inspected, verified & loaded' },
  { status: 'In Transit', label: 'In Transit to Buyer', icon: 'car-sport-outline', desc: 'Cargo en route via optimized highway routing' },
  { status: 'Arrived at Delivery', label: 'Arrived at Destination', icon: 'location-outline', desc: 'Courier at buyer location for handover inspection' },
  { status: 'Delivery Completed', label: 'Delivery Completed', icon: 'checkmark-circle-outline', desc: '4-digit PIN validated, escrow & payout disbursed' },
];

export const DeliveryStatusTimeline: React.FC<DeliveryStatusTimelineProps> = ({
  currentStatus,
  history = [],
  isDark = true,
}) => {
  const isCancelled = currentStatus === 'Cancelled';
  const isFailed = currentStatus === 'Failed Delivery';

  const currentIndex = LIFECYCLE_STEPS.findIndex(s => s.status === currentStatus);

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <Text style={[styles.title, isDark && styles.textWhite]}>Delivery Progress Lifecycle</Text>

      {isCancelled ? (
        <View style={styles.cancelledBox}>
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
          <View style={styles.cancelledTextCol}>
            <Text style={styles.cancelledTitle}>Delivery Cancelled</Text>
            <Text style={styles.cancelledSub}>
              {history.find(h => h.status === 'Cancelled')?.notes || 'The delivery assignment was cancelled.'}
            </Text>
          </View>
        </View>
      ) : isFailed ? (
        <View style={styles.failedBox}>
          <Ionicons name="warning" size={24} color="#FF9500" />
          <View style={styles.cancelledTextCol}>
            <Text style={styles.failedTitle}>Delivery Exception</Text>
            <Text style={styles.cancelledSub}>
              Problem reported with dispatch support for investigation.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.timelineList}>
        {LIFECYCLE_STEPS.map((step, index) => {
          const isDone = currentIndex > index || currentStatus === 'Delivery Completed';
          const isCurrent = currentIndex === index && currentStatus !== 'Delivery Completed';
          const isPending = currentIndex < index && currentStatus !== 'Delivery Completed';

          const matchingHistory = history.find(h => h.status === step.status);
          const timeFormatted = matchingHistory?.timestamp
            ? new Date(matchingHistory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null;

          return (
            <View key={step.status} style={styles.stepRow}>
              {/* Left Column: Icon & Connecting line */}
              <View style={styles.nodeColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    isDone && styles.nodeDone,
                    isCurrent && styles.nodeCurrent,
                    isPending && (isDark ? styles.nodePendingDark : styles.nodePendingLight),
                  ]}
                >
                  <Ionicons
                    name={isDone ? 'checkmark' : step.icon}
                    size={14}
                    color={isDone || isCurrent ? '#FFFFFF' : isDark ? '#6B7280' : '#9CA3AF'}
                  />
                </View>

                {index < LIFECYCLE_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isDone
                        ? styles.connectorDone
                        : isDark
                        ? styles.connectorPendingDark
                        : styles.connectorPendingLight,
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Text Information */}
              <View style={[styles.contentColumn, index < LIFECYCLE_STEPS.length - 1 && styles.contentSpacing]}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isDone || isCurrent ? (isDark ? styles.textWhite : styles.textBlack) : styles.textMuted,
                      isCurrent && styles.textCurrent,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {timeFormatted && <Text style={styles.timestamp}>{timeFormatted}</Text>}
                </View>
                <Text style={styles.stepDesc}>
                  {matchingHistory?.notes || step.desc}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
  },
  containerDark: {
    backgroundColor: '#161616',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#000000',
    marginBottom: 16,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
  },
  failedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
  },
  cancelledTextCol: {
    flex: 1,
  },
  cancelledTitle: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 13,
  },
  failedTitle: {
    color: '#FF9500',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelledSub: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeDone: {
    backgroundColor: '#06C167',
  },
  nodeCurrent: {
    backgroundColor: '#276EF1',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nodePendingDark: {
    backgroundColor: '#242424',
  },
  nodePendingLight: {
    backgroundColor: '#E5E7EB',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  connectorDone: {
    backgroundColor: '#06C167',
  },
  connectorPendingDark: {
    backgroundColor: '#282828',
  },
  connectorPendingLight: {
    backgroundColor: '#E5E7EB',
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
  },
  contentSpacing: {
    paddingBottom: 20,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  textCurrent: {
    color: '#276EF1',
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 15,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textBlack: {
    color: '#000000',
  },
  textMuted: {
    color: '#8E8E93',
  },
});
