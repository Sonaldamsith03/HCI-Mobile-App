import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Vehicle } from '../../types/logistics';
import { colors } from '../../theme/colors';

interface VehicleCardProps {
  vehicle: Vehicle;
  isDark?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, isDark = true }) => {
  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.headerRow}>
        <View style={styles.typeBadge}>
          <Ionicons name="car-sport-outline" size={14} color="#06C167" />
          <Text style={styles.typeText}>{vehicle.type}</Text>
        </View>

        {vehicle.documentsVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#06C167" />
            <Text style={styles.verifiedText}>DOCUMENTS VERIFIED</Text>
          </View>
        )}
      </View>

      <View style={styles.contentRow}>
        {vehicle.photoUrl ? (
          <Image source={{ uri: vehicle.photoUrl }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.placeholderImg}>
            <Ionicons name="car" size={32} color="#8E8E93" />
          </View>
        )}

        <View style={styles.detailsCol}>
          <Text style={[styles.modelText, isDark && styles.textWhite]}>{vehicle.model}</Text>

          {/* Sri Lankan / Standard Vehicle Plate Badge */}
          <View style={styles.numberPlateContainer}>
            <View style={styles.plateProvince}>
              <Text style={styles.plateProvinceText}>WP</Text>
            </View>
            <View style={styles.plateNumber}>
              <Text style={styles.plateNumberText}>{vehicle.registrationNumber}</Text>
            </View>
          </View>

          <View style={styles.capacityRow}>
            <Ionicons name="cube-outline" size={13} color="#8E8E93" />
            <Text style={styles.capacityLabel}>Max Payload:</Text>
            <Text style={[styles.capacityVal, isDark && styles.textWhite]}>{vehicle.capacityLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerSpecs}>
        <View style={styles.specPill}>
          <Ionicons name="document-text-outline" size={12} color="#8E8E93" />
          <Text style={styles.specLabel}>License:</Text>
          <Text style={[styles.specValue, isDark && styles.textWhite]}>{vehicle.licenseNumber || 'Active'}</Text>
        </View>

        <View style={styles.specPill}>
          <Ionicons name="shield-outline" size={12} color="#8E8E93" />
          <Text style={styles.specLabel}>Cargo Insurance:</Text>
          <Text style={[styles.specValue, isDark && styles.textWhite]}>Covered</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 193, 103, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06C167',
    letterSpacing: 0.3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  vehicleImage: {
    width: 80,
    height: 70,
    borderRadius: 14,
  },
  placeholderImg: {
    width: 80,
    height: 70,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCol: {
    flex: 1,
  },
  modelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  numberPlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#000000',
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  plateProvince: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  plateProvinceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  plateNumber: {
    backgroundColor: '#FFCC00', // Traditional registration plate yellow
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  plateNumberText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  capacityLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  capacityVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  footerSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  specValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});
