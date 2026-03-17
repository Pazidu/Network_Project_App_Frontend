import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function DeviceDetails({ route, navigation }) {
  const { device } = route.params;

  // Helper component for small stat blocks
  const StatBox = ({ label, value, icon, color = '#38bdf8' }) => (
    <View style={styles.statBox}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon} size={16} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.iconCircle}>
          <MaterialIcons name="devices" size={40} color="#38bdf8" />
        </View>
        <Text style={styles.title}>{device.device_name || 'Generic Device'}</Text>
        <View style={styles.statusRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Connected</Text>
        </View>
      </View>

      {/* Network Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identification</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IP ADDRESS</Text>
            <Text style={styles.infoValue}>{device.ip}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MAC ADDRESS</Text>
            <Text style={styles.infoValue}>{device.mac.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Traffic Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Usage</Text>
        <View style={styles.grid}>
          <StatBox 
            label="Download" 
            value={`${device.download_mb?.toFixed(2)} MB`} 
            icon="file-download" 
            color="#22c55e" 
          />
          <StatBox 
            label="Upload" 
            value={`${device.upload_mb?.toFixed(2)} MB`} 
            icon="file-upload" 
            color="#3b82f6" 
          />
        </View>

        <View style={[styles.grid, { marginTop: 12 }]}>
          <StatBox 
            label="Packets Sent" 
            value={device.packets_sent?.toLocaleString()} 
            icon="outbox" 
          />
          <StatBox 
            label="Packets Recv" 
            value={device.packets_recv?.toLocaleString()} 
            icon="inbox" 
          />
        </View>
        
        <View style={styles.sessionCard}>
          <MaterialIcons name="sync-alt" size={20} color="#94a3b8" />
          <Text style={styles.sessionLabel}>Active Sessions</Text>
          <Text style={styles.sessionValue}>{device.session_count}</Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.visitButton}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('SiteVisits', {
            mac: device.mac,
            deviceName: device.device_name,
          })
        }
      >
        <Text style={styles.visitButtonText}>View History & Site Visits</Text>
        <MaterialIcons name="chevron-right" size={20} color="#fff" />
      </TouchableOpacity>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 10,
    marginLeft: -10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  onlineText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 15,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#1e293b',
    width: '48%',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
    marginLeft: 6,
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  sessionValue: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  visitButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  visitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});