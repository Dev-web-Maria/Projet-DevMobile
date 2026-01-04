import React, { useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
 SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminNotificationsScreen = ({ navigation }) => {
 // Mock Data pour les notifications
 const [notifications, setNotifications] = useState([
  { id: '1', title: 'Nouvelle connexion', message: 'Admin connecté récemment.', date: 'Aujourd\'hui, 10:30', type: 'info' },
  { id: '2', title: 'Mise à jour système', message: 'Les statistiques ont été actualisées.', date: 'Aujourd\'hui, 09:15', type: 'success' },
  { id: '3', title: 'Alerte Chauffeur', message: 'Le chauffeur Pierre a terminé sa mission.', date: 'Hier, 18:45', type: 'warning' },
  { id: '4', title: 'Nouveau Client', message: 'Bienvenue au client Jean Dupont.', date: 'Hier, 14:20', type: 'info' },
 ]);

 const getIcon = (type) => {
  switch (type) {
   case 'success': return 'checkmark-circle';
   case 'warning': return 'alert-circle';
   case 'error': return 'close-circle';
   default: return 'information-circle';
  }
 };

 const getColor = (type) => {
  switch (type) {
   case 'success': return '#10B981';
   case 'warning': return '#F59E0B';
   case 'error': return '#EF4444';
   default: return '#3B82F6';
  }
 };

 const renderItem = ({ item }) => (
  <View style={styles.card}>
   <View style={[styles.iconContainer, { backgroundColor: `${getColor(item.type)}20` }]}>
    <Ionicons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
   </View>
   <View style={styles.textContainer}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.date}>{item.date}</Text>
   </View>
  </View>
 );

 return (
  <SafeAreaView style={styles.container}>
   {/* HEADER */}
   <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
     <Ionicons name="arrow-back" size={24} color="#111827" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Notifications</Text>
    <TouchableOpacity style={styles.clearButton} onPress={() => setNotifications([])}>
     <Text style={styles.clearText}>Effacer</Text>
    </TouchableOpacity>
   </View>

   {/* LISTE */}
   <FlatList
    data={notifications}
    renderItem={renderItem}
    keyExtractor={item => item.id}
    contentContainerStyle={styles.listContent}
    ListEmptyComponent={
     <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>Aucune notification</Text>
     </View>
    }
   />
  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#F9FAFB' },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 20,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
 },
 backButton: { padding: 4 },
 headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
 clearButton: { padding: 4 },
 clearText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
 listContent: { padding: 15 },
 card: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  padding: 15,
  borderRadius: 12,
  marginBottom: 10,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
 },
 iconContainer: {
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 15,
 },
 textContainer: { flex: 1 },
 title: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
 message: { fontSize: 13, color: '#4B5563', marginBottom: 4 },
 date: { fontSize: 11, color: '#9CA3AF' },
 emptyContainer: { alignItems: 'center', marginTop: 50 },
 emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 },
});

export default AdminNotificationsScreen;
