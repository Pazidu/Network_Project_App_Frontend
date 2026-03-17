import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import BackendApi from '../api/BackendApi';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SiteVisits({ route, navigation }) {
  const { mac, deviceName } = route.params;

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSites = async () => {
    try {
      setLoading(refreshing ? false : true);
      const res = await BackendApi.get(`/network-usage/siteVisits?mac=${mac}`);
      setSites(res.data.sites || []);
    } catch (error) {
      console.error('Site visit fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Filter Top 5 and Calculate Data for Graph
  const topSites = useMemo(() => {
    return [...sites]
      .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
      .slice(0, 5);
  }, [sites]);

  const totalVisits = useMemo(() => 
    topSites.reduce((acc, curr) => acc + (curr.visit_count || 1), 0), 
  [topSites]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSites();
  };

  const ListHeader = () => (
    <View style={styles.chartSection}>
      <Text style={styles.sectionTitle}>Top 5 Destinations</Text>
      <View style={styles.chartContainer}>
        {/* Modern "Circular" Representation */}
        <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
                <Text style={styles.totalNumber}>{totalVisits}</Text>
                <Text style={styles.totalLabel}>TOTAL VISITS</Text>
            </View>
        </View>
        
        {/* Legend */}
        <View style={styles.legend}>
            {topSites.map((site, index) => (
                <View key={index} style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: COLORS[index] }]} />
                    <Text style={styles.legendText} numberOfLines={1}>{site.domain || 'Other'}</Text>
                </View>
            ))}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const domain = item.domain || item.website || 'Unknown Site';
    const visits = item.visit_count || item.visits || 1;
    const isTopFive = index < 5;

    return (
      <View style={[styles.card, isTopFive && { borderLeftWidth: 4, borderLeftColor: COLORS[index] }]}>
        <View style={styles.cardInfo}>
            <Text style={styles.domain}>{domain}</Text>
            <Text style={styles.lastVisit}>Last seen: {item.last_visit || 'Just now'}</Text>
        </View>
        <View style={styles.visitCountContainer}>
            <Text style={styles.visitCountText}>{visits}</Text>
            <Text style={styles.visitSub}>Visits</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
            <Text style={styles.title}>{deviceName}</Text>
            <Text style={styles.subtitle}>Site Activity Log</Text>
        </View>
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={topSites.length > 0 ? ListHeader : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No traffic detected.</Text>}
      />
    </View>
  );
}

const COLORS = ['#38bdf8', '#818cf8', '#fbbf24', '#f87171', '#34d399'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, marginBottom: 30 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 22, color: '#fff', fontWeight: '800' },
  subtitle: { color: '#64748b', fontSize: 13, fontWeight: '500' },
  
  // Chart Section
  chartSection: { backgroundColor: '#1e293b', padding: 20, borderRadius: 24, marginBottom: 25 },
  sectionTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700', marginBottom: 20 },
  chartContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#38bdf8', // Base color
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: { alignItems: 'center' },
  totalNumber: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  totalLabel: { color: '#94a3b8', fontSize: 9, fontWeight: '800', marginTop: -2 },
  legend: { flex: 1, marginLeft: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { color: '#cbd5e1', fontSize: 12, fontWeight: '500' },

  // List Item
  card: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  domain: { color: '#f8fafc', fontSize: 15, fontWeight: '600' },
  lastVisit: { color: '#475569', fontSize: 12, marginTop: 4 },
  visitCountContainer: { alignItems: 'center', minWidth: 50 },
  visitCountText: { color: '#38bdf8', fontSize: 18, fontWeight: '800' },
  visitSub: { color: '#64748b', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 50 },
});