import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
 ActivityIndicator,
 TextInput,
 Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminClientsScreen = ({ navigation }) => {
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');

 useEffect(() => {
  fetchClients();
 }, []);

 const fetchClients = async () => {
  try {
   setLoading(true);
   const API_BASE = process.env.EXPO_PUBLIC_API_URL;

   // Récupérer le token
   const userDataStr = await AsyncStorage.getItem('@user_data');
   let token = null;
   if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    token = userData.token || userData.Token;
   }

   // WORKAROUND: Utiliser l'historique des demandes car /api/Clients n'existe pas
   const response = await fetch(`${API_BASE}/api/DemandeTransports`, {
    headers: {
     'Authorization': `Bearer ${token}`,
     'Accept': 'application/json',
     'ngrok-skip-browser-warning': 'true'
    }
   });

   if (response.ok) {
    const apiResponse = await response.json();
    // L'API DemandeTransports renvoie souvent { success: true, demandes: [...] }
    const demandes = apiResponse.demandes || (Array.isArray(apiResponse) ? apiResponse : []);

    const uniqueClients = new Map();

    demandes.forEach(d => {
     const clientObj = d.client || {};
     const clientId = d.clientId || clientObj.idClient;

     if (clientId && !uniqueClients.has(clientId)) {
      uniqueClients.set(clientId, {
       id: clientId,
       nom: clientObj.nom || 'Client',
       prenom: clientObj.prenom || `#${clientId}`,
       email: clientObj.email || 'Non visible (API)',
       telephone: clientObj.telephone || 'Non visible',
       ville: 'Inconnue'
      });
     }
    });

    const clientList = Array.from(uniqueClients.values());
    console.log(`Clients récupérés via historique: ${clientList.length}`);
    setClients(clientList);

    if (clientList.length === 0) {
     Alert.alert("Info", "Aucun client trouvé dans l'historique des commandes.");
    }
   } else {
    console.error('Erreur API (Workaround):', response.status);
    Alert.alert('Erreur', `Impossible de récupérer les données clients (${response.status})`);
   }
  } catch (error) {
   console.error('Erreur fetch clients:', error);
   Alert.alert('Erreur', 'Erreur de connexion au serveur');
  } finally {
   setLoading(false);
  }
 };

 const filteredClients = clients.filter(client => {
  const searchLower = searchQuery.toLowerCase();
  return (
   client.nom?.toLowerCase().includes(searchLower) ||
   client.prenom?.toLowerCase().includes(searchLower) ||
   client.email?.toLowerCase().includes(searchLower)
  );
 });

 const renderItem = ({ item }) => (
  <View style={styles.card}>
   <View style={styles.avatarContainer}>
    <Ionicons name="person" size={20} color="#1A56DB" />
   </View>
   <View style={styles.infoContainer}>
    <Text style={styles.name}>{item.prenom} {item.nom}</Text>
    <Text style={styles.email}>{item.email}</Text>
    <Text style={styles.detail}>{item.telephone} • {item.ville || 'N/A'}</Text>
   </View>
  </View>
 );

 return (
  <SafeAreaView style={styles.container} edges={['top']}>
   <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
     <Ionicons name="arrow-back" size={24} color="#111827" />
    </TouchableOpacity>
    <Text style={styles.title}>Liste des Clients</Text>
    <View style={{ width: 40 }} />
   </View>

   <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
     <Ionicons name="search" size={20} color="#9CA3AF" />
     <TextInput
      style={styles.searchInput}
      placeholder="Rechercher un client..."
      value={searchQuery}
      onChangeText={setSearchQuery}
     />
    </View>
   </View>

   {loading ? (
    <ActivityIndicator size="large" color="#1A56DB" style={{ marginTop: 50 }} />
   ) : (
    <FlatList
     data={filteredClients}
     renderItem={renderItem}
     keyExtractor={item => item.id.toString()}
     contentContainerStyle={styles.listContent}
     ListEmptyComponent={
      <Text style={styles.emptyText}>Aucun client trouvé</Text>
     }
    />
   )}
  </SafeAreaView>
 );
};

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#F9FAFB',
 },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 20,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
 },
 title: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
 },
 backButton: {
  padding: 8,
 },
 searchContainer: {
  padding: 15,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
 },
 searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  borderRadius: 10,
  paddingHorizontal: 12,
  height: 45,
 },
 searchInput: {
  flex: 1,
  marginLeft: 10,
  fontSize: 16,
 },
 listContent: {
  padding: 15,
 },
 card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 15,
  marginBottom: 12,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 1,
 },
 avatarContainer: {
  width: 45,
  height: 45,
  borderRadius: 22.5,
  backgroundColor: '#DBEAFE',
  alignItems: 'center',
  justifyContent: 'center',
 },
 infoContainer: {
  flex: 1,
 },
 name: {
  fontSize: 16,
  fontWeight: '600',
  color: '#111827',
 },
 email: {
  fontSize: 14,
  color: '#6B7280',
 },
 detail: {
  fontSize: 12,
  color: '#9CA3AF',
  marginTop: 2,
 },
 emptyText: {
  textAlign: 'center',
  marginTop: 40,
  color: '#6B7280',
  fontSize: 16,
 },
});

export default AdminClientsScreen;
