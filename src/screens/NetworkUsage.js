import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import BackendApi from '../api/BackendApi';

export default function NetworkUsage({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = async () => {
    try {
      setLoading(refreshing ? false : true); // Don't show full loader if refreshing
      const res = await BackendApi.get('/network-usage/deviceUsage');
      const payload = res.data?.devices ? res.data : res.data?.data;
      setDevices(payload?.devices || []);
    } catch (err) {
      console.error('Network usage fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsage();
  };

  const renderItem = ({ item }) => {
    // Logic for usage percentage (mocking it if not in your API yet)
    const usageValue = item.usage_pct || Math.floor(Math.random() * 60) + 10;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('DeviceDetails', { device: item })}
      >
        <View style={styles.cardTop}>
          <View style={styles.infoGroup}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {item.device_name !== 'Unknown'
                ? item.device_name
                : `Device • ${item.mac.slice(-5).toUpperCase()}`}
            </Text>
            <Text style={styles.deviceIp}>{item.ip}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        <View style={styles.usageContainer}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageLabel}>Bandwidth Usage</Text>
            <Text style={styles.usageValue}>{usageValue}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${usageValue}%` }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Scanning Network...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Network Usage</Text>
        <Text style={styles.subtitle}>{devices.length} Devices Online</Text>
      </View>

      <FlatList
        data={devices}
        keyExtractor={item => item.id || item.mac}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#38bdf8" 
            colors={['#38bdf8']} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices detected</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Deeper navy for more contrast
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    color: '#f8fafc',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    // Subtle shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoGroup: {
    flex: 1,
    paddingRight: 10,
  },
  deviceName: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
  },
  deviceIp: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  usageContainer: {
    width: '100%',
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  usageValue: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8', // Vibrant blue
    borderRadius: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
  },
});