import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   StyleSheet,
   SafeAreaView,
   ScrollView,
   TouchableOpacity,
   Alert,
   StatusBar,
   Dimensions
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';

const { width } = Dimensions.get('window');

/* =======================
   STAT CARD COMPONENT
======================= */
const StatCard = ({ title, value, icon, color, subtitle }) => (
   <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statInfo}>
         <Text style={styles.statTitle}>{title}</Text>
         <Text style={styles.statValue}>{value}</Text>
         {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
         <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
   </View>
);

/* =======================
   ADMIN DASHBOARD
======================= */
const AdminDashboardScreen = ({ navigation, route }) => {
   const user = route.params?.user || {};

   const [stats, setStats] = useState({
      totalClients: 0,
      totalChauffeurs: 0,
      totalDemandes: 0,
      totalRevenue: 0,
      activeChauffeurs: 0,
      missionsEnCours: 0
   });
   const [loading, setLoading] = useState(false);
   const [alertes, setAlertes] = useState([]);
   const [errorLog, setErrorLog] = useState(null); // AJOUT: State pour l'erreur

   useEffect(() => {
      fetchStats();
   }, []);

   /* ===== Fetch Stats ===== */
   const fetchStats = async () => {
      const API_BASE = process.env.EXPO_PUBLIC_API_URL;
      try {
         setLoading(true);
         setErrorLog(null); // Reset error

         console.log('📡 Fetching stats from:', `${API_BASE}/api/AdminStats/Overview`);

         // Essayer d'abord SANS token (pour le mode développement)
         let response = await fetch(`${API_BASE}/api/AdminStats/Overview`, {
            headers: {
               'Accept': 'application/json',
               'ngrok-skip-browser-warning': 'true'
            }
         });

         console.log('📊 Stats response status (no auth):', response.status);

         // Si ça échoue, essayer AVEC token
         if (!response.ok) {
            const userDataStr = await AsyncStorage.getItem('@user_data');
            let token = null;
            if (userDataStr) {
               const userData = JSON.parse(userDataStr);
               token = userData.token || userData.Token;
               console.log('🔑 Trying with token:', token ? 'Present' : 'Missing');
            }

            if (token) {
               response = await fetch(`${API_BASE}/api/AdminStats/Overview`, {
                  headers: {
                     'Authorization': `Bearer ${token}`,
                     'Accept': 'application/json',
                     'ngrok-skip-browser-warning': 'true'
                  }
               });
               console.log('📊 Stats response status (with auth):', response.status);
            }
         }

         if (response.ok) {
            const data = await response.json();
            console.log('✅ Stats data received:', data);
            setStats({
               totalClients: data.totalClients || 0,
               totalChauffeurs: data.totalChauffeurs || 0,
               totalDemandes: data.totalDemandes || 0,
               totalRevenue: data.totalRevenue || 0,
               activeChauffeurs: data.activeChauffeurs || 0,
               missionsEnCours: data.missionsEnCours || 0
            });
         } else {
            console.log('⚠️ Stats API error:', response.status);
            const errorText = await response.text();
            setErrorLog(`Erreur API: ${response.status} - ${API_BASE}`); // Log IP
            console.log('Error details:', errorText);
         }
      } catch (error) {
         console.error('❌ Error fetching admin stats:', error);
         setErrorLog(`Erreur Réseau: ${error.message} \nURL: ${API_BASE}/api/AdminStats/Overview`);
      } finally {
         setLoading(false);
      }
   };

   /* ===== Logout ===== */
   const handleLogout = async () => {
      Alert.alert(
         'Déconnexion Admin',
         'Voulez-vous vraiment vous déconnecter ?',
         [
            { text: 'Annuler', style: 'cancel' },
            {
               text: 'Déconnexion',
               style: 'destructive',
               onPress: async () => {
                  try {
                     setLoading(true);
                     await signOut(auth);
                     await AsyncStorage.removeItem('@user_data');

                     navigation.dispatch(
                        CommonActions.reset({
                           index: 0,
                           routes: [{ name: 'Landing' }],
                        })
                     );
                  } catch (error) {
                     console.error('Erreur déconnexion:', error);
                     Alert.alert('Erreur', 'Impossible de se déconnecter');
                  } finally {
                     setLoading(false);
                  }
               }
            }
         ]
      );
   };

   /* =======================
      RENDER
   ======================= */
   return (
      <SafeAreaView style={styles.container}>
         <StatusBar barStyle="dark-content" />

         {/* ===== HEADER (SANS DECONNEXION) ===== */}
         <View style={styles.header}>
            <View>
               <Text style={styles.welcomeText}>Espace Administrateur</Text>
               <Text style={styles.adminEmail}>{user.email || 'Admin User'}</Text>
            </View>
         </View>

         <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Log d'erreur visible */}
            {errorLog && (
               <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#EF4444' }}>
                  <Text style={{ color: '#B91C1C', fontWeight: 'bold' }}>⚠️ Erreur Debug:</Text>
                  <Text style={{ color: '#B91C1C', fontSize: 12 }}>{errorLog}</Text>
               </View>
            )}
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>

            <View style={styles.statsGrid}>
               <StatCard
                  title="Clients"
                  value={stats.totalClients.toString()}
                  icon="account-group"
                  color="#1A56DB"
                  subtitle="Total inscrits"
               />
               <StatCard
                  title="Chauffeurs"
                  value={stats.totalChauffeurs.toString()}
                  icon="steering"
                  color="#10B981"
                  subtitle={`${stats.activeChauffeurs} disponibles`}
               />
               <StatCard
                  title="Missions"
                  value={stats.totalDemandes.toString()}
                  icon="truck-delivery"
                  color="#F59E0B"
                  subtitle={`${stats.missionsEnCours} en cours`}
               />
               <StatCard
                  title="Revenus Total"
                  value={`${stats.totalRevenue.toLocaleString()} €`}
                  icon="cash-multiple"
                  color="#8B5CF6"
                  subtitle="Cumul missions"
               />
            </View>

            <Text style={styles.sectionTitle}>Actions Rapides</Text>

            <View style={styles.actionsGrid}>
               <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('AdminClients')}
               >
                  <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                     <Ionicons name="people" size={24} color="#1A56DB" />
                  </View>
                  <Text style={styles.actionText}>Clients</Text>
               </TouchableOpacity>

               <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('AdminRequests')}
               >
                  <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                     <MaterialCommunityIcons name="file-chart" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.actionText}>Demandes</Text>
               </TouchableOpacity>

               <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('AdminChauffeurs')}
               >
                  <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                     <Ionicons name="car-sport" size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.actionText}>Chauffeurs</Text>
               </TouchableOpacity>

               <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('AdminNotifications')}
               >
                  <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                     <Ionicons name="notifications" size={24} color="#8B5CF6" />
                  </View>
                  <Text style={styles.actionText}>Notifications</Text>
               </TouchableOpacity>
            </View>

            <View style={styles.alertBox}>
               <View style={styles.alertHeader}>
                  <Ionicons name="alert-circle" size={20} color="#B45309" />
                  <Text style={styles.alertTitle}>Alertes Système</Text>
               </View>
               <Text style={styles.alertText}>
                  3 chauffeurs ont des documents expirant bientôt.
               </Text>
            </View>

            {/* ===== SEULE DECONNEXION ===== */}
            <TouchableOpacity style={styles.mainLogoutButton} onPress={handleLogout}>
               <Ionicons name="log-out" size={24} color="#FFFFFF" />
               <Text style={styles.mainLogoutText}>Déconnexion</Text>
            </TouchableOpacity>
         </ScrollView>
      </SafeAreaView>
   );
};

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
   container: { flex: 1, backgroundColor: '#F9FAFB' },

   header: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
   },

   welcomeText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
   adminEmail: { fontSize: 18, fontWeight: '700', color: '#111827' },

   scrollContent: { padding: 20 },

   sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 15,
      marginTop: 10,
   },

   statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

   statCard: {
      width: (width - 50) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 15,
      marginBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderLeftWidth: 4,
      elevation: 2,
   },

   statTitle: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
   statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
   statSubtitle: { fontSize: 10, color: '#10B981', fontWeight: '600' },

   statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
   },

   actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

   actionItem: {
      width: (width - 50) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 15,
      alignItems: 'center',
      marginBottom: 15,
   },

   actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
   },

   actionText: { fontSize: 14, fontWeight: '600', color: '#374151' },

   alertBox: {
      backgroundColor: '#FFFBEB',
      borderRadius: 16,
      padding: 15,
      borderWidth: 1,
      borderColor: '#FEF3C7',
      marginBottom: 30,
   },

   alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
   alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
   alertText: { fontSize: 13, color: '#B45309' },

   mainLogoutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#EF4444',
      padding: 16,
      borderRadius: 16,
      gap: 10,
   },

   mainLogoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default AdminDashboardScreen;
