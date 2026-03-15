import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Image,
  PermissionsAndroid,
  Platform,
  Linking,   
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackendApi from '../api/BackendApi';
import notifee, { AndroidImportance } from '@notifee/react-native';
import Modal from 'react-native-modal';
const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {

    const [showNotification, setShowNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [wifiData, setWifiData] = useState(null);
    const [wifiid,setWiifid]=useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [network, setNetwork] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- 2. FETCH DATA FROM BACKEND ---
  
  
    const toggleNotifications = async () => {
      await fetchNotifications(); // Fetch latest notifications before showing  
      setShowNotification(prev => !prev);

  };
    const fetchWifiInfo = async () => {
      try {
        const res = await BackendApi.get('/network/wifi');
        const res2 = await BackendApi.get('/network/wifiid');
        // res.data contains { ssid: "Name", ip: "...", etc }
        setWifiData(res.data);
        console.log("Fetched Wi-Fi Info:", res.data);
        setWiifid(res2.data.id);
        console.log("Fetched Wi-Fi ID:", res2.data.id);
      } catch (err) {
        console.log("Error fetching Home SSID:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await BackendApi.get('/notifications');
        const allNotifications = res.data;

        setNotifications(allNotifications);

        const unread = allNotifications.filter(n => !n.is_read);
        setUnreadCount(unread.length);

        if (unread.length > 0) {
          await sendLocalNotification(unread[0]);
        }

      } catch (err) {
        console.log("Error fetching notifications:", err);
      }
    };



    const sendLocalNotification = async (notif) => {
    try {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: notif.title,
        body: notif.body ,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (err) {
      console.log("Notification Error:", err);
    }
  };
 const handleNotificationClick = async (notification) => {
  try {
    await BackendApi.post(`/notifications/mark-read/${notification.id}`);


    // refresh notifications
    await fetchNotifications();

    // refresh unread count
    const res = await BackendApi.get('/notifications/unread-count');
    setUnreadCount(res.data.unread_count);

    setShowNotification(false);

    if (notification.type === "new_device") {
      navigation.navigate("NetworkUsage");
    } else if (notification.type === "alert") {
      navigation.navigate("NetworkDetails");
    } else {
      navigation.navigate("Home");
    }

  } catch (err) {
    console.log("Error handling notification:", err);
  }
};



    useEffect(() => {
    // ANDROID PERMISSION
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission Needed',
              message:
                'Android requires Location access to show the Wi-Fi Name (SSID).',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestPermission();

    // NETWORK LISTENER (SYNC)
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetwork(state);
    });

    // INITIAL FETCH
    fetchWifiInfo();
    fetchNotifications();
    BackendApi.get('/notifications/unread-count')
    .then(res => setUnreadCount(res.data.unread_count))
    .catch(err => console.log("Error fetching unread count:", err));

    // CLEANUP
    return () => {
      unsubscribe();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWifiInfo();
    setRefreshing(false);
  }, []);

    // --- HELPERS ---

    // Decide card color based on connection
    const getStatusColor = () => {
      if (!wifiData) return "#64748b"; // Grey (Loading/Error)
      if (wifiData.ssid && wifiData.ssid !== "Unknown") return "#3b82f6"; // Blue (Connected)
      return "#ef4444"; // Red (Disconnected)
    };

    const getStatusText = () => {
      if (loading) return "Scanning...";
      if (wifiData && wifiData.ssid) return "Connected";
      return "Offline";

    };

    // Get the SSID from backend data
    const getSSID = () => {
      if (loading) return "Initializing...";
      if (wifiData && wifiData.ssid) return wifiData.ssid;
      return "No Connection";

    };

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

        {/* HEADER */}
      <View style={styles.container}>
        {/* HEADER */}
       {/* HEADER */}
<View style={styles.header}>
  <View>
    <Text style={styles.greeting}>Network Monitor</Text>
    <Text style={styles.subGreeting}>
      {loading ? 'Checking status...' : 'System Secure'}
    </Text>
  </View>
  
  <TouchableOpacity onPress={toggleNotifications} style={styles.notificationIcon}>
    <MaterialCommunityIcons name="bell-outline" size={26} color="#fff" />
    {unreadCount > 0 && (
      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </Text>
      </View>
    )}
  </TouchableOpacity>
</View>
        {/* Notification Popup */}
        <Modal
          isVisible={showNotification}
          onBackdropPress={toggleNotifications}
          backdropOpacity={0.2}
          animationIn="slideInDown"
          animationOut="slideOutUp"
          style={styles.modalStyle}
        >
          <View style={styles.modalContent}>
            {notifications.length === 0 ? (
              <Text style={styles.noNotif}>No notifications available</Text>
            ) : (
              <ScrollView>
                {notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifItem,
                    { backgroundColor: item.is_read ? "#1e293b" : "#334155" }
                  ]}
                  onPress={() => handleNotificationClick(item)}
                >
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.message}</Text>
                </TouchableOpacity>
              ))}

              </ScrollView>
            )}
          </View>
        </Modal>
        {/* MAIN CONTENT */}
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>Your HomeScreen Content Here</Text>
        </View>
      </View>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6"/>
          }
        >      
        {/* MAIN STATUS CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={fetchWifiInfo} // Tap card to refresh
          style={[styles.statusCard, { backgroundColor: getStatusColor() }]}
        >
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="wifi" size={32} color="#fff" />
            <View style={styles.badge}>
              <Text style={[styles.badgeText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>    
         
   <Text style={styles.statusTitle} numberOfLines={1}>
            {getSSID()}
          </Text>
          
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NetworkDetails')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={28}
                color="#3b82f6"
              />
            </View>
            <Text style={styles.cardTitle}>Network Details</Text>
            <Text style={styles.cardSubtitle}>Full Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NetworkUsage')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="devices"
                size={28}
                color="#f59e0b"
              />
            </View>
            <Text style={styles.cardTitle}>Devices</Text>
            <Text style={styles.cardSubtitle}>Scan Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Wifi')}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={28}
                color="#10b981"
              />
            </View>
            <Text style={styles.cardTitle}>About Wi-Fi</Text>
            <Text style={styles.cardSubtitle}>Hardware Info</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={styles.card} 
              onPress={() =>
                navigation.navigate("DeviceHistory", {
                  wifi_id: wifiid,
                  ssid: wifiData?.ssid
                })
              }>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: 'rgba(236, 72, 153, 0.2)' },
              ]}
            >
              <MaterialCommunityIcons
                name="history"
                size={28}
                color="#ec4899"
              />
            </View>
            <Text style={styles.cardTitle}>Device History</Text>
            <Text style={styles.cardSubtitle}>Last 30 Days</Text>
          </TouchableOpacity>

          

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('UserProfile')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(139, 92, 246, 0.2)' },
                ]}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={28}
                  color="#8b5cf6"
                />
              </View>
              <Text style={styles.cardTitle}>Settings</Text>
              <Text style={styles.cardSubtitle}>Profile & App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 40,
    paddingHorizontal: 20,
  },


    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 25,
      marginTop: 10,
    },

    greeting: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
    },

    subGreeting: {
      fontSize: 14,
      color: '#94a3b8',
    },

    profileIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#1e293b',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#334155',
    },

    statusCard: {
      backgroundColor: '#3b82f6',
      borderRadius: 20,
      padding: 20,
      marginBottom: 30,
      shadowColor: '#3b82f6',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
    },

    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },

    badge: {
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    badgeText: {
    
      fontWeight: 'bold',
      fontSize: 12,
    },

    statusTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 20,
    },

    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      padding: 15,
    },

    statusItem: {
      alignItems: 'center',
      flex: 1,
    },

    statusLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      marginBottom: 4,
    },

    statusValue: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 15,
    },

    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 20,
    },

    card: {
      backgroundColor: '#1e293b',
      width: (width - 50) / 2,
      borderRadius: 16,
      padding: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#334155',
    },

    iconBox: {
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    notificationBadge: {
      position: "absolute",
      top: -5,
      right: -5,
      backgroundColor: "red",
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
      zIndex: 10,
    },

    statusBadge: {
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    cardSubtitle: { 
      fontSize: 12, 
      color: "#94a3b8" 
    },
    notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    position: 'relative', // Necessary for absolute positioning of the badge
  },
  countBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444", // Modern Red
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#1e293b", // Creates a "cut-out" effect against the icon background
  },
  countText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
    modalStyle: { margin: 0, justifyContent: "flex-start", paddingTop: 50 },
    modalContent: { backgroundColor: "#1e293b", marginHorizontal: 20, borderRadius: 12, padding: 15, maxHeight: 300 },
    noNotif: { color: "#94a3b8", textAlign: "center", fontSize: 16, paddingVertical: 20 },
    notifItem: { paddingVertical: 10, borderBottomColor: "#334155", borderBottomWidth: 1 },
    notifTitle: { color: "#fff", fontWeight: "bold" },
    notifBody: { color: "#94a3b8", marginTop: 2 },
  });

