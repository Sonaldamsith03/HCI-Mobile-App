import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../config/supabase';
import { Logo } from '../components/Logo';

type TableKey = 'produce' | 'orders' | 'deliveries' | 'profiles' | 'drivers' | 'vehicles';

interface TableMeta {
  key: TableKey;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const TABLES: TableMeta[] = [
  { key: 'produce', label: 'Produce', icon: 'leaf-outline', color: '#10B981', description: 'Fresh harvests listed by certified farmers' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', color: '#8B5CF6', description: 'Buyer purchases protected by escrow balances' },
  { key: 'deliveries', label: 'Deliveries', icon: 'car-outline', color: '#06C167', description: 'Logistics trip dispatches & courier live statuses' },
  { key: 'profiles', label: 'Profiles', icon: 'people-outline', color: '#3B82F6', description: 'Registered users, roles & cloud auth records' },
  { key: 'drivers', label: 'Drivers', icon: 'shield-outline', color: '#F59E0B', description: 'Verified fleet couriers & operational areas' },
  { key: 'vehicles', label: 'Vehicles', icon: 'bus-outline', color: '#EC4899', description: 'Transport assets, capacities & plate numbers' },
];

export const DatabaseExplorerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { themeMode, showToast } = useApp();
  const isDark = themeMode === 'dark';

  const [activeTable, setActiveTable] = useState<TableKey>('produce');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const [authSessionUser, setAuthSessionUser] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    checkConnectionAndCounts();
    checkCurrentUser();
  }, []);

  useEffect(() => {
    loadTableData(activeTable);
  }, [activeTable]);

  const checkCurrentUser = async () => {
    try {
      const user = await supabaseService.getCurrentSessionUser();
      setAuthSessionUser(user ? user.email || user.id : 'No active cloud session');
    } catch {
      setAuthSessionUser('Anonymous');
    }
  };

  const checkConnectionAndCounts = async () => {
    const start = Date.now();
    try {
      const counts = await supabaseService.getTableCounts();
      const elapsed = Date.now() - start;
      setPingMs(elapsed);
      setTableCounts(counts);
    } catch {
      setPingMs(null);
    }
  };

  const loadTableData = async (table: TableKey) => {
    setIsLoading(true);
    setExpandedRowIndex(null);
    try {
      const rows = await supabaseService.fetchTableRows(table, 50);
      setTableRows(rows);
    } catch (err: any) {
      showToast(`Error fetching ${table}: ${err.message}`, 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSampleProduce = async () => {
    setIsInserting(true);
    try {
      const sampleNames = [
        'Kandy Organic Avocados',
        'Nuwara Eliya Purple Cabbage',
        'Dambulla Sweet Bell Peppers',
        'Jaffna Red Carrots',
        'Matale Ceylon Cinnamon Harvest',
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomPrice = Math.floor(250 + Math.random() * 400);

      const inserted = await supabaseService.insertProduce({
        name: randomName,
        category: 'Vegetables',
        price: randomPrice,
        unit: 'kg',
        quantity: `${Math.floor(50 + Math.random() * 200)} kg`,
        location: 'Central Province Orchards',
        farmerName: 'Mateo Gutierrez (Cloud)',
        farmerPhone: '+94 77 123 4567',
        middlemanPrice: Math.floor(randomPrice * 1.5),
        harvestDate: 'Fresh harvest today',
        isOrganic: true,
        description: 'Direct harvest synced to live Supabase Postgres database.',
      });

      if (inserted) {
        showToast(`Inserted sample crop "${randomName}" to Supabase! 🎉`, 'success');
        await loadTableData('produce');
        await checkConnectionAndCounts();
      } else {
        showToast('Insert failed. Check database permissions or RLS.', 'warn');
      }
    } catch (err: any) {
      Alert.alert('Insert Error', err.message || 'Failed to insert to cloud');
    } finally {
      setIsInserting(false);
    }
  };

  // Filter rows by query
  const filteredRows = tableRows.filter(row => {
    if (!searchQuery.trim()) return true;
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(searchQuery.trim().toLowerCase());
  });

  const currentMeta = TABLES.find(t => t.key === activeTable) || TABLES[0];

  return (
    <SafeAreaView style={[styles.safeArea, isDark ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <View style={[styles.topHeader, isDark ? styles.borderDark : styles.borderLight]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={isDark ? '#FFFFFF' : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>
            Supabase Cloud Explorer
          </Text>
          <Text style={styles.headerSubtitle}>LIVE SQL DATABASE MONITOR</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, isDark && styles.actionBtnDark]}
          onPress={() => {
            checkConnectionAndCounts();
            loadTableData(activeTable);
            showToast('Refreshed cloud data ⚡', 'info');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color="#06C167" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Cloud Health & Telemetry Card */}
          <View style={[styles.telemetryCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.telemetryTopRow}>
              <View style={styles.cloudBadgeRow}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.cloudName}>rcxkrkjknsdyeiupsuwd.supabase.co</Text>
              </View>
              <View style={styles.latencyChip}>
                <Ionicons name="speedometer-outline" size={13} color="#06C167" />
                <Text style={styles.latencyText}>{pingMs !== null ? `${pingMs} ms` : 'Online'}</Text>
              </View>
            </View>

            <View style={styles.telemetryDetails}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>ENGINE</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }]}>PostgreSQL 15</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>REALTIME</Text>
                <Text style={[styles.telemetryValue, { color: '#06C167' }]}>Active WebSocket</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryLabel}>AUTH USER</Text>
                <Text style={[styles.telemetryValue, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                  {authSessionUser || 'Connected'}
                </Text>
              </View>
            </View>
          </View>

          {/* Table Selector Pills */}
          <Text style={[styles.sectionLabel, isDark && { color: '#9CA3AF' }]}>DATABASE TABLES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tablesScroll}
          >
            {TABLES.map(t => {
              const isActive = activeTable === t.key;
              const count = tableCounts[t.key] ?? '...';
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    styles.tablePill,
                    isDark ? styles.tablePillDark : styles.tablePillLight,
                    isActive && { backgroundColor: t.color, borderColor: t.color },
                  ]}
                  onPress={() => setActiveTable(t.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={16}
                    color={isActive ? '#FFFFFF' : t.color}
                  />
                  <Text style={[styles.tablePillText, isActive && styles.tablePillTextActive]}>
                    {t.label}
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      isActive ? { backgroundColor: 'rgba(255,255,255,0.25)' } : (isDark ? styles.countBadgeDark : styles.countBadgeLight),
                    ]}
                  >
                    <Text style={[styles.countBadgeText, isActive && { color: '#FFFFFF' }]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SQL Query Preview Helper Box */}
          <View style={[styles.sqlBox, isDark ? styles.sqlBoxDark : styles.sqlBoxLight]}>
            <View style={styles.sqlBoxHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="terminal-outline" size={14} color="#06C167" />
                <Text style={styles.sqlBoxTitle}>ACTIVE QUERY</Text>
              </View>
              <Text style={styles.sqlBoxSub}>{currentMeta.description}</Text>
            </View>
            <Text style={styles.sqlQueryText}>
              SELECT * FROM public.{activeTable} ORDER BY id DESC LIMIT 50;
            </Text>
          </View>

          {/* Search & Actions Bar */}
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, isDark ? styles.searchBoxDark : styles.searchBoxLight]}>
              <Ionicons name="search" size={17} color="#94A3B8" />
              <TextInput
                style={[styles.searchInput, isDark && { color: '#FFFFFF' }]}
                placeholder={`Filter ${activeTable} records...`}
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {activeTable === 'produce' && (
              <TouchableOpacity
                style={[styles.insertBtn, isInserting && { opacity: 0.7 }]}
                onPress={handleInsertSampleProduce}
                disabled={isInserting}
                activeOpacity={0.85}
              >
                {isInserting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="add" size={17} color="#FFFFFF" />
                    <Text style={styles.insertBtnText}>+ Harvest</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Table Data Rows */}
          <View style={styles.dataContainer}>
            <View style={styles.dataHeaderRow}>
              <Text style={[styles.dataHeaderTitle, isDark && { color: '#FFFFFF' }]}>
                {currentMeta.label} Records ({filteredRows.length})
              </Text>
              <TouchableOpacity
                onPress={() => loadTableData(activeTable)}
                activeOpacity={0.7}
              >
                <Text style={styles.reloadText}>Re-query</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#06C167" />
                <Text style={[styles.loadingText, isDark && { color: '#94A3B8' }]}>
                  Executing query against Supabase Cloud...
                </Text>
              </View>
            ) : filteredRows.length === 0 ? (
              <View style={[styles.emptyBox, isDark ? styles.cardDark : styles.cardLight]}>
                <Ionicons name="file-tray-outline" size={36} color="#64748B" />
                <Text style={[styles.emptyTitle, isDark && { color: '#FFFFFF' }]}>
                  No records returned
                </Text>
                <Text style={styles.emptySub}>
                  {searchQuery
                    ? `No rows match "${searchQuery}"`
                    : `Table public.${activeTable} has no rows yet.`}
                </Text>
                {activeTable === 'produce' && (
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={handleInsertSampleProduce}
                  >
                    <Text style={styles.emptyAddBtnText}>Insert Sample Crop Listing</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredRows.map((row, index) => {
                const isExpanded = expandedRowIndex === index;
                const rowId = row.id || row.driverId || row.auth_user_id || `#${index + 1}`;
                const title =
                  row.name ||
                  row.produce_name ||
                  row.title ||
                  row.email ||
                  (row.pickup ? `${row.goods || 'Freight'} delivery` : `Record ${rowId}`);

                return (
                  <View
                    key={rowId + '-' + index}
                    style={[styles.rowCard, isDark ? styles.cardDark : styles.cardLight]}
                  >
                    <TouchableOpacity
                      style={styles.rowMainTouch}
                      onPress={() => setExpandedRowIndex(isExpanded ? null : index)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.rowTopHeader}>
                        <View style={styles.rowIdBadge}>
                          <Text style={styles.rowIdText}>ID: {String(rowId).slice(0, 14)}</Text>
                        </View>
                        {row.status && (
                          <View
                            style={[
                              styles.statusTag,
                              row.status === 'Confirmed' || row.status === 'delivered' || row.status === 'active'
                                ? styles.statusGreen
                                : styles.statusAmber,
                            ]}
                          >
                            <Text style={styles.statusTagText}>{row.status}</Text>
                          </View>
                        )}
                        {row.price && (
                          <Text style={[styles.priceTag, isDark && { color: '#FFFFFF' }]}>
                            ${row.price}/{row.unit || 'kg'}
                          </Text>
                        )}
                        {row.amount && (
                          <Text style={[styles.priceTag, isDark && { color: '#FFFFFF' }]}>
                            ${row.amount}
                          </Text>
                        )}
                      </View>

                      <Text style={[styles.rowTitle, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                        {title}
                      </Text>

                      {/* Summary metadata preview */}
                      <View style={styles.metaRow}>
                        {row.farmer_name && (
                          <Text style={styles.metaItem}>🌾 {row.farmer_name}</Text>
                        )}
                        {row.buyer_name && (
                          <Text style={styles.metaItem}>🛒 {row.buyer_name}</Text>
                        )}
                        {row.category && (
                          <Text style={styles.metaItem}>📁 {row.category}</Text>
                        )}
                        {row.role && (
                          <Text style={styles.metaItem}>👤 {row.role}</Text>
                        )}
                        {row.vehicle_required && (
                          <Text style={styles.metaItem}>🚚 {row.vehicle_required}</Text>
                        )}
                      </View>

                      <View style={styles.expandChevron}>
                        <Text style={styles.expandPrompt}>
                          {isExpanded ? 'Hide Raw Columns' : 'Inspect JSON & Columns'}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color="#94A3B8"
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Expanded JSON / Columns Inspector */}
                    {isExpanded && (
                      <View style={[styles.expandedContent, isDark && styles.expandedContentDark]}>
                        <Text style={styles.columnViewTitle}>RECORD ATTRIBUTES</Text>
                        {Object.entries(row).map(([k, v]) => (
                          <View key={k} style={styles.attributeRow}>
                            <Text style={styles.attributeKey}>{k}:</Text>
                            <Text style={[styles.attributeVal, isDark && { color: '#E2E8F0' }]}>
                              {typeof v === 'object' ? JSON.stringify(v) : String(v ?? 'null')}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          {/* Quick Access to Auth & Role Dashboards */}
          <View style={[styles.portalNavCard, isDark ? styles.cardDark : styles.cardLight]}>
            <Text style={[styles.portalNavTitle, isDark && { color: '#FFFFFF' }]}>
              Fast Role Navigation
            </Text>
            <Text style={styles.portalNavSub}>
              Switch into user interfaces that read and write directly to these tables
            </Text>

            <View style={styles.portalNavGrid}>
              <TouchableOpacity
                style={[styles.portalBtn, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}
                onPress={() => navigation.navigate('FarmerDashboard')}
              >
                <MaterialCommunityIcons name="tractor" size={20} color="#10B981" />
                <Text style={[styles.portalBtnText, { color: '#10B981' }]}>Farmer Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.portalBtn, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}
                onPress={() => navigation.navigate('BuyerDashboard')}
              >
                <Ionicons name="basket" size={20} color="#8B5CF6" />
                <Text style={[styles.portalBtnText, { color: '#8B5CF6' }]}>Buyer Market</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.portalBtn, { backgroundColor: 'rgba(6, 193, 103, 0.12)' }]}
                onPress={() => navigation.navigate('DriverDashboard')}
              >
                <Ionicons name="car-sport" size={20} color="#06C167" />
                <Text style={[styles.portalBtnText, { color: '#06C167' }]}>Driver Fleet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.portalBtn, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}
                onPress={() => navigation.navigate('Auth', { initialMode: 'login' })}
              >
                <Ionicons name="key" size={20} color="#3B82F6" />
                <Text style={[styles.portalBtnText, { color: '#3B82F6' }]}>Cloud Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#000000',
  },
  bgLight: {
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  borderDark: {
    borderBottomColor: '#27272A',
  },
  borderLight: {
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  actionBtnDark: {
    backgroundColor: '#1E1E22',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  telemetryCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#121214',
    borderColor: '#27272A',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  telemetryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cloudBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06C167',
  },
  cloudName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  latencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 193, 103, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  latencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06C167',
  },
  telemetryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
    paddingTop: 10,
  },
  telemetryItem: {
    flex: 1,
  },
  telemetryLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  telemetryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  tablesScroll: {
    gap: 8,
    marginBottom: 14,
  },
  tablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tablePillDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  tablePillLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  tablePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  tablePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeDark: {
    backgroundColor: '#27272A',
  },
  countBadgeLight: {
    backgroundColor: '#F1F5F9',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  sqlBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  sqlBoxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  sqlBoxLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  sqlBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sqlBoxTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06C167',
    letterSpacing: 0.6,
  },
  sqlBoxSub: {
    fontSize: 10,
    color: '#64748B',
  },
  sqlQueryText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  searchBoxDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  searchBoxLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    color: '#0F172A',
  },
  insertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  insertBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dataContainer: {
    marginBottom: 20,
  },
  dataHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dataHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  reloadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06C167',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  emptyAddBtn: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rowCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  rowMainTouch: {
    padding: 12,
  },
  rowTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rowIdBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusGreen: {
    backgroundColor: 'rgba(6, 193, 103, 0.15)',
  },
  statusAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06C167',
  },
  priceTag: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    fontSize: 11,
    color: '#64748B',
  },
  expandChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  expandPrompt: {
    fontSize: 11,
    color: '#94A3B8',
  },
  expandedContent: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.15)',
  },
  expandedContentDark: {
    backgroundColor: '#18181B',
  },
  columnViewTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  attributeRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    gap: 6,
  },
  attributeKey: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#38BDF8',
    width: 130,
  },
  attributeVal: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
    flex: 1,
  },
  portalNavCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  portalNavTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  portalNavSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  portalNavGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  portalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  portalBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
});
