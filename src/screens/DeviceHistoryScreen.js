import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { useRoute } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackendApi from "../api/BackendApi";

export default function DeviceHistoryScreen() {
  const route = useRoute();
  const { wifi_id, ssid } = route.params || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wifi_id !== undefined && wifi_id !== null) loadHistory();
  }, [wifi_id]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const url = wifi_id
        ? `/devices/history/monthly?wifi_id=${wifi_id}`
        : `/devices/history/monthly`;
      const res = await BackendApi.get(url);
      setData(res.data);
    } catch (e) {
      console.log("History error", e);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const renderDeviceCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={item.device_name ? "laptop" : "help-network"} 
          size={22} 
          color={item.is_new ? "#22c55e" : "#38bdf8"} 
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.deviceName} numberOfLines={1}>
            {item.device_name || "Unknown Device"}
          </Text>
          {item.is_new && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.ip}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{formatUptime(item.total_uptime_seconds)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.title}>Network Activity</Text>
        <View style={styles.ssidContainer}>
          <MaterialCommunityIcons name="wifi" size={16} color="#38bdf8" />
          <Text style={styles.subtitle}>{ssid || "All Networks"}</Text>
        </View>
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.ip}-${item.mac_address}`}
          renderItem={renderDeviceCard}
          refreshing={loading}
          onRefresh={loadHistory}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No devices found for this period.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding:15,
    backgroundColor: "#0f172a", // Deeper slate background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,

  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  ssidContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  subtitle: {
    color: "#38bdf8",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deviceName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  newBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  newBadgeText: {
    color: "#22c55e",
    fontSize: 10,
    fontWeight: "bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  dot: {
    color: "#475569",
    marginHorizontal: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  }
});