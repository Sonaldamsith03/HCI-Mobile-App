import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export function FarmByLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="leaf" size={16} color="#FFFFFF" />
      </View>
      <View style={styles.textColumn}>
        <View style={styles.topRow}>
          <Text style={styles.brandTitle}>FarmBy</Text>
        </View>
        <Text style={styles.brandSubtitle}>DIRECT FROM FARMS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  textColumn: {
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.8,
    marginTop: -2,
  },
});
