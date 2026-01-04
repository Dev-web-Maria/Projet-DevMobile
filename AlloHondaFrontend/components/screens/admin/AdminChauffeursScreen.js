import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
 ActivityIndicator,
 Alert,
 Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminChauffeursScreen = ({ navigation }) => {
 const [chauffeurs, setChauffeurs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('pending'); // pending, approved, all

 useEffect(() => {
  fetchChauffeurs();
 }, []);

 const fetchChauffeurs = async () => {
  try {
   setLoading(true);
   const API_BASE = process.env.EXPO_PUBLIC_API_URL;

   const userDataStr = await AsyncStorage.getItem('@user_data');
   let token = null;
   if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    token = userData.token || userData.Token;
   }

   const response = await fetch(`${API_BASE}/api/Chauffeur/All`, {
    headers: {
     'Authorization': `Bearer ${token}`,
     'Accept': 'application/json',
     'ngrok-skip-browser-warning': 'true'
    }
   });

   if (response.ok) {
    const data = await response.json();
    console.log("Chauffeurs API data:", data); // Debug

    // L'API renvoie directement un tableau pour cette route ciblée
    const list = Array.isArray(data) ? data : (data.data || []);

    const formatted = list.map(c => ({
     id: c.idChauffeur || c.id,
     nom: c.nom || c.Nom || 'Inconnu',
     prenom: c.prenom || c.Prenom || '',
     email: c.email || c.Email || 'Non disponible',
     telephone: c.telephone || c.Telephone || '',
     status: c.statut || c.Statut || 'unknown',
     vehicule: c.Vehicule ? `${c.Vehicule.Marque} ${c.Vehicule.Modele}` : (c.vehicule || 'Aucun')
    }));

    setChauffeurs(formatted);
   } else {
    console.log('Erreur API:', response.status);
    const errorText = await response.text();
    Alert.alert('Erreur API', `Status: ${response.status}\nURL: ${API_BASE}/api/Chauffeur/All\nDetails: ${errorText || 'Accès limité'}`);
   }
  } catch (error) {
   console.error('Erreur fetch chauffeurs:', error);
   Alert.alert('Erreur', 'Erreur de connexion au serveur');
  } finally {
   setLoading(false);
  }
 };

 const getMockChauffeurs = () => [
  { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@test.com', telephone: '0612345678', status: 'pending', dateInscription: '2024-01-02' },
  { id: 2, nom: 'Martin', prenom: 'Pierre', email: 'pierre.martin@test.com', telephone: '0687654321', status: 'approved', dateInscription: '2023-12-15' },
  { id: 3, nom: 'Bernard', prenom: 'Sophie', email: 'sophie.bernard@test.com', telephone: '0611223344', status: 'rejected', dateInscription: '2024-01-01' },
 ];

 const handleUpdateStatus = async (id, newStatus) => {
  Alert.alert(
   'Confirmation',
   `Voulez-vous vraiment ${newStatus === 'approved' ? 'approuver' : 'refuser'} ce chauffeur ?`,
   [
    { text: 'Annuler', style: 'cancel' },
    {
     text: 'Confirmer',
     onPress: async () => {
      try {
       const API_BASE = process.env.EXPO_PUBLIC_API_URL;
       const userDataStr = await AsyncStorage.getItem('@user_data');
       const userData = JSON.parse(userDataStr || '{}');
       const token = userData.token || userData.Token;

       // Endpoint hypothétique pour update status - à adapter si besoin
       const response = await fetch(`${API_BASE}/api/Chauffeur/${id}/Status`, {
        method: 'PUT',
        headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
       });

       if (response.ok) {
        setChauffeurs(prev => prev.map(c =>
         c.id === id ? { ...c, status: newStatus } : c
        ));
        Alert.alert('Succès', `Chauffeur ${newStatus === 'approved' ? 'approuvé' : 'refusé'}`);
       } else {
        throw new Error('Erreur lors de la mise à jour');
       }
      } catch (error) {
       console.error('Update error:', error);
       Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
      }
     }
    }
   ]
  );
 };
 const handleDelete = async (id, nom) => {
  Alert.alert(
   'Supprimer Chauffeur',
   `Voulez-vous vraiment supprimer définitivement ${nom} ? Cette action est irréversible.`,
   [
    { text: 'Annuler', style: 'cancel' },
    {
     text: 'Supprimer',
     style: 'destructive',
     onPress: async () => {
      try {
       const API_BASE = process.env.EXPO_PUBLIC_API_URL;
       const userDataStr = await AsyncStorage.getItem('@user_data');
       const userData = JSON.parse(userDataStr || '{}');
       const token = userData.token || userData.Token;

       const response = await fetch(`${API_BASE}/api/Chauffeur/${id}`, {
        method: 'DELETE',
        headers: {
         'Authorization': `Bearer ${token}`,
         'ngrok-skip-browser-warning': 'true'
        }
       });

       if (response.ok) {
        setChauffeurs(prev => prev.filter(c => c.id !== id));
        Alert.alert('Succès', 'Chauffeur supprimé avec succès');
       } else {
        const errorText = await response.text();
        throw new Error(`Erreur suppression: ${response.status} - ${errorText}`);
       }
      } catch (error) {
       console.error('Delete error:', error);
       Alert.alert('Erreur', 'Impossible de supprimer le chauffeur');
      }
     }
    }
   ]
  );
 };

 const filteredChauffeurs = chauffeurs.filter(c => {
  if (filter === 'all') return true;
  return c.status === filter;
 });

 const renderItem = ({ item }) => (
  <View style={styles.card}>
   <View style={styles.cardHeader}>
    <View style={styles.avatarContainer}>
     <Text style={styles.avatarText}>{item.prenom[0]}{item.nom[0]}</Text>
    </View>
    <View style={styles.infoContainer}>
     <Text style={styles.name}>{item.prenom} {item.nom}</Text>
     <Text style={styles.email}>{item.email}</Text>
     <Text style={styles.phone}>{item.telephone}</Text>
     <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
      <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
     </View>
    </View>
   </View>

   <View style={styles.actionsContainer}>
    <TouchableOpacity
     style={[styles.actionButton, styles.rejectButton]}
     onPress={() => handleDelete(item.id, `${item.prenom} ${item.nom}`)}
    >
     <Ionicons name="trash-outline" size={20} color="#EF4444" />
     <Text style={styles.rejectText}>Supprimer</Text>
    </TouchableOpacity>

    <TouchableOpacity
     style={[styles.actionButton, styles.approveButton]}
     onPress={() => navigation.navigate('AdminCreateChauffeur', { chauffeur: item })}
    >
     <Ionicons name="create-outline" size={20} color="#FFFFFF" />
     <Text style={styles.approveText}>Modifier</Text>
    </TouchableOpacity>
   </View>
  </View>
 );

 const getStatusStyle = (status) => {
  switch (status) {
   case 'approved': return { backgroundColor: '#D1FAE5', borderColor: '#10B981' };
   case 'rejected': return { backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
   default: return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
  }
 };

 const getStatusLabel = (status) => {
  switch (status) {
   case 'approved': return 'Validé';
   case 'rejected': return 'Refusé';
   default: return 'En attente';
  }
 };

 return (
  <SafeAreaView style={styles.container} edges={['top']}>
   <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
     <Ionicons name="arrow-back" size={24} color="#111827" />
    </TouchableOpacity>
    <Text style={styles.title}>Gestion des Chauffeurs</Text>
    <TouchableOpacity
     onPress={() => navigation.navigate('AdminCreateChauffeur')}
     style={styles.addButton}
    >
     <Ionicons name="add" size={24} color="#1A56DB" />
    </TouchableOpacity>
   </View>

   <View style={styles.filterContainer}>
    {['pending', 'approved', 'all'].map((f) => (
     <TouchableOpacity
      key={f}
      style={[styles.filterTab, filter === f && styles.filterTabActive]}
      onPress={() => setFilter(f)}
     >
      <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
       {f === 'pending' ? 'En attente' : f === 'approved' ? 'Validés' : 'Tous'}
      </Text>
     </TouchableOpacity>
    ))}
   </View>

   {loading ? (
    <ActivityIndicator size="large" color="#1A56DB" style={{ marginTop: 50 }} />
   ) : (
    <FlatList
     data={filteredChauffeurs}
     renderItem={renderItem}
     keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
     contentContainerStyle={styles.listContent}
     ListEmptyComponent={
      <Text style={styles.emptyText}>Aucun chauffeur trouvé</Text>
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
 addButton: {
  padding: 8,
  backgroundColor: '#DBEAFE',
  borderRadius: 8,
 },
 filterContainer: {
  flexDirection: 'row',
  padding: 15,
  gap: 10,
 },
 filterTab: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5E7EB',
 },
 filterTabActive: {
  backgroundColor: '#1A56DB',
  borderColor: '#1A56DB',
 },
 filterText: {
  fontSize: 14,
  color: '#6B7280',
  fontWeight: '500',
 },
 filterTextActive: {
  color: '#FFFFFF',
 },
 listContent: {
  padding: 15,
 },
 card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 15,
  marginBottom: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2,
 },
 cardHeader: {
  flexDirection: 'row',
  gap: 15,
 },
 avatarContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#E0E7FF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 avatarText: {
  fontSize: 20,
  fontWeight: '700',
  color: '#3730A3',
 },
 infoContainer: {
  flex: 1,
 },
 name: {
  fontSize: 16,
  fontWeight: '700',
  color: '#111827',
 },
 email: {
  fontSize: 14,
  color: '#6B7280',
  marginVertical: 2,
 },
 phone: {
  fontSize: 14,
  color: '#6B7280',
 },
 statusBadge: {
  alignSelf: 'flex-start',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  borderWidth: 1,
  marginTop: 8,
 },
 statusText: {
  fontSize: 12,
  fontWeight: '600',
  textTransform: 'uppercase',
 },
 actionsContainer: {
  flexDirection: 'row',
  marginTop: 15,
  gap: 10,
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
  paddingTop: 15,
 },
 actionButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
  borderRadius: 8,
  gap: 8,
 },
 rejectButton: {
  backgroundColor: '#FEF2F2',
 },
 approveButton: {
  backgroundColor: '#10B981',
 },
 rejectText: {
  color: '#EF4444',
  fontWeight: '600',
 },
 approveText: {
  color: '#FFFFFF',
  fontWeight: '600',
 },
 emptyText: {
  textAlign: 'center',
  marginTop: 40,
  color: '#6B7280',
  fontSize: 16,
 },
});

export default AdminChauffeursScreen;
