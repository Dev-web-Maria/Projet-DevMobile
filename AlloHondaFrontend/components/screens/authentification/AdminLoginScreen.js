import React, { useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TextInput,
 TouchableOpacity,
 SafeAreaView,
 ScrollView,
 KeyboardAvoidingView,
 Platform,
 Alert,
 ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLoginScreen({ navigation }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);

 const handleAdminLogin = async () => {
  if (!email.trim() || !password.trim()) {
   Alert.alert('Erreur', 'Veuillez remplir tous les champs');
   return;
  }

  setLoading(true);

  try {
   // MODE DÉVELOPPEMENT : Identifiants hardcodés (bypass Firebase)
   // Utilisez ceci quand Firebase est bloqué par le réseau
   if (email.trim() === 'admin@allohonda.com' && password === 'admin123') {
    console.log('✅ Admin connecté en mode développement (bypass Firebase)');

    const adminData = {
     uid: 'dev-admin-001',
     email: 'admin@allohonda.com',
     userType: 'admin',
     lastLogin: new Date().toISOString(),
     authMethod: 'development'
    };

    await AsyncStorage.setItem('@user_data', JSON.stringify(adminData));

    Alert.alert(
     '✅ Connexion réussie',
     'Mode Développement\nBienvenue dans l\'espace administrateur',
     [
      {
       text: 'Accéder au Dashboard',
       onPress: () => {
        navigation.reset({
         index: 0,
         routes: [{ name: 'Admin', params: { user: adminData } }],
        });
       }
      }
     ]
    );
    setLoading(false);
    return;
   }

   // MODE PRODUCTION : Firebase Auth (si réseau le permet)
   const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
   const user = userCredential.user;

   console.log('✅ Admin connecté avec Firebase:', user.email);

   const adminData = {
    uid: user.uid,
    email: user.email,
    userType: 'admin',
    lastLogin: new Date().toISOString(),
    authMethod: 'firebase'
   };

   await AsyncStorage.setItem('@user_data', JSON.stringify(adminData));

   Alert.alert(
    '✅ Connexion réussie',
    'Bienvenue dans l\'espace administrateur',
    [
     {
      text: 'Accéder au Dashboard',
      onPress: () => {
       navigation.reset({
        index: 0,
        routes: [{ name: 'Admin' }],
       });
      }
     }
    ]
   );
  } catch (error) {
   console.error('❌ Erreur Auth Firebase:', error.code, error.message);

   let errorMessage = 'Erreur lors de la connexion admin';

   if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
    errorMessage = 'Identifiants admin invalides';
   } else if (error.code === 'auth/network-request-failed') {
    errorMessage = 'Erreur réseau Firebase.\n\n💡 Astuce: Utilisez les identifiants de développement:\nEmail: admin@allohonda.com\nMot de passe: admin123';
   }

   Alert.alert('Échec Authentification', errorMessage);
  } finally {
   setLoading(false);
  }
 };

 return (
  <SafeAreaView style={styles.container}>
   <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.keyboardAvoid}
   >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
     <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
     >
      <Ionicons name="arrow-back" size={24} color="#374151" />
     </TouchableOpacity>

     <View style={styles.header}>
      <MaterialCommunityIcons name="shield-account" size={80} color="#1A56DB" />
      <Text style={styles.title}>Espace Admin</Text>
      <Text style={styles.subtitle}>Mode Développement Disponible</Text>
     </View>

     <View style={styles.formContainer}>
      <View style={styles.inputGroup}>
       <Text style={styles.label}>Email Administrateur</Text>
       <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
        <TextInput
         style={styles.input}
         placeholder="admin@allohonda.com"
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
         autoCapitalize="none"
         editable={!loading}
        />
       </View>
      </View>

      <View style={styles.inputGroup}>
       <Text style={styles.label}>Mot de passe</Text>
       <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
        <TextInput
         style={styles.input}
         placeholder="••••••••"
         value={password}
         onChangeText={setPassword}
         secureTextEntry={!showPassword}
         editable={!loading}
        />
        <TouchableOpacity
         onPress={() => setShowPassword(!showPassword)}
         disabled={loading}
        >
         <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color="#9CA3AF"
         />
        </TouchableOpacity>
       </View>
      </View>

      <TouchableOpacity
       style={[styles.loginButton, loading && styles.loginButtonDisabled]}
       onPress={handleAdminLogin}
       disabled={loading}
      >
       {loading ? (
        <View style={styles.loadingContainer}>
         <ActivityIndicator size="small" color="#FFFFFF" />
         <Text style={styles.loginButtonText}>Authentification...</Text>
        </View>
       ) : (
        <View style={styles.loginButtonContent}>
         <Text style={styles.loginButtonText}>Se connecter</Text>
         <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
        </View>
       )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
       <Ionicons name="information-circle-outline" size={20} color="#1A56DB" />
       <Text style={styles.infoText}>
        Cet accès est réservé au personnel autorisé. Les activités sont journalisées.
       </Text>
      </View>
     </View>
    </ScrollView>
   </KeyboardAvoidingView>
  </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#FFFFFF',
 },
 keyboardAvoid: {
  flex: 1,
 },
 scrollContainer: {
  flexGrow: 1,
  paddingHorizontal: 20,
  paddingVertical: 20,
 },
 backButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#F3F4F6',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 20,
 },
 header: {
  alignItems: 'center',
  marginBottom: 40,
 },
 title: {
  fontSize: 32,
  fontWeight: '800',
  color: '#1A56DB',
  marginTop: 10,
 },
 subtitle: {
  fontSize: 16,
  color: '#6B7280',
  marginTop: 5,
 },
 formContainer: {
  marginTop: 10,
 },
 inputGroup: {
  marginBottom: 20,
 },
 label: {
  fontSize: 16,
  fontWeight: '600',
  color: '#374151',
  marginBottom: 8,
 },
 inputWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 12,
  paddingHorizontal: 15,
  paddingVertical: 14,
 },
 input: {
  flex: 1,
  fontSize: 16,
  color: '#1F2937',
  marginLeft: 10,
  marginRight: 10,
 },
 loginButton: {
  backgroundColor: '#111827',
  paddingVertical: 16,
  borderRadius: 12,
  marginTop: 10,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
 },
 loginButtonDisabled: {
  backgroundColor: '#9CA3AF',
 },
 loginButtonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
 },
 loadingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
 },
 loginButtonText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#FFFFFF',
 },
 infoBox: {
  flexDirection: 'row',
  backgroundColor: '#EFF6FF',
  padding: 15,
  borderRadius: 12,
  alignItems: 'center',
  gap: 10,
  borderWidth: 1,
  borderColor: '#DBEAFE',
 },
 infoText: {
  flex: 1,
  fontSize: 13,
  color: '#1E40AF',
  lineHeight: 18,
 },
});
