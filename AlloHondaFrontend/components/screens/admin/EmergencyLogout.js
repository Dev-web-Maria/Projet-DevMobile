import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';

/**
 * COMPOSANT D'URGENCE POUR DÉCONNEXION
 * Ajoutez ce bouton temporairement à votre AdminDashboardScreen
 * pour forcer la déconnexion
 */
export const EmergencyLogout = ({ navigation }) => {
 const handleEmergencyLogout = async () => {
  try {
   console.log('🚨 DÉCONNEXION D\'URGENCE DÉCLENCHÉE');

   // 1. Déconnexion Firebase
   await signOut(auth);
   console.log('✅ Firebase signOut OK');

   // 2. Suppression AsyncStorage
   await AsyncStorage.removeItem('@user_data');
   console.log('✅ AsyncStorage cleared');

   // 3. Forcer le rechargement de l'app
   Alert.alert(
    'Déconnexion réussie',
    'Veuillez redémarrer l\'application manuellement',
    [
     {
      text: 'OK',
      onPress: () => {
       // Tentative de navigation
       try {
        navigation.navigate('Landing');
       } catch (e) {
        console.log('Navigation failed, app restart needed');
       }
      }
     }
    ]
   );

  } catch (error) {
   console.error('❌ Erreur déconnexion urgence:', error);
   Alert.alert('Erreur', error.message);
  }
 };

 return (
  <TouchableOpacity
   style={styles.emergencyButton}
   onPress={handleEmergencyLogout}
  >
   <Text style={styles.emergencyText}>🚨 DÉCONNEXION D'URGENCE</Text>
  </TouchableOpacity>
 );
};

const styles = StyleSheet.create({
 emergencyButton: {
  backgroundColor: '#DC2626',
  padding: 20,
  margin: 20,
  borderRadius: 12,
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#FEE2E2',
 },
 emergencyText: {
  color: '#FFFFFF',
  fontSize: 18,
  fontWeight: '800',
 },
});

export default EmergencyLogout;
