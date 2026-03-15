import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from "react-native";
import axios from "axios";
import BackendApi from "../api/BackendApi";


export default function DeviceHistoryScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await BackendApi.get("/devices/history/monthly");
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device History (Last 30 Days)</Text>

      {/* TABLE HEADER */}
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.hCell]}>Device</Text>
        <Text style={[styles.cell, styles.hCell]}>IP</Text>
        <Text style={[styles.cell, styles.hCell]}>Uptime</Text>
        <Text style={[styles.cell, styles.hCell]}>Status</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.ip}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>
              {item.device_name || "Unknown"}
            </Text>
            <Text style={styles.cell}>{item.ip}</Text>
            <Text style={styles.cell}>
              {formatUptime(item.total_uptime_seconds)}
            </Text>
            <Text
              style={[
                styles.cell,
                item.is_new ? styles.new : styles.known
              ]}
            >
              {item.is_new ? "NEW" : "Known"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding:15

  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    borderRadius: 8
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingVertical: 10
  },
  cell: {
    flex: 1,
    color: "#e5e7eb",
    fontSize: 12,
    textAlign: "center"
  },
  hCell: {
    fontWeight: "bold",
    color: "#38bdf8"
  },
  new: {
    color: "#22c55e",
    fontWeight: "bold"
  },
  known: {
    color: "#94a3b8"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
