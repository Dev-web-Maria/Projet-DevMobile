import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    adresse: '',
    ville: '',
    dateNaissance: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Non testé');
  const [isSimulator, setIsSimulator] = useState(false);
  
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Détection automatique : Expo Go sur iPhone physique vs Simulateur
    const checkDevice = () => {
      // Si c'est iOS et on est en développement, vérifier si c'est un simulateur
      const isIOSSimulator = Platform.OS === 'ios' && __DEV__;
      setIsSimulator(isIOSSimulator);
      
      console.log('📱 Plateforme:', Platform.OS);
      console.log('🔧 Mode développement:', __DEV__);
      console.log('📱 Est simulateur?', isIOSSimulator);
      console.log('🌐 URL API détectée:', getApiBaseUrl());
    };
    
    checkDevice();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.nom.trim()) errors.push('Le nom est requis');
    if (!formData.prenom.trim()) errors.push('Le prénom est requis');
    
    if (!formData.email.trim()) {
      errors.push('L\'email est requis');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email invalide');
    }
    
    if (!formData.telephone.trim()) {
      errors.push('Le téléphone est requis');
    }
    
    if (!formData.password) {
      errors.push('Le mot de passe est requis');
    } else if (formData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Les mots de passe ne correspondent pas');
    }
    
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return false;
    }
    return true;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return null;
    
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
    }
    return null;
  };

  // ✅ URL DYNAMIQUE selon le périphérique
  const getApiBaseUrl = () => {
    // Remplacez par l'IP de votre PC
    const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
    
    return envApiUrl;
  };

  const getApiEndpoint = () => {
    const API_BASE = getApiBaseUrl();
    
    return formData.userType === 'client' 
      ? `${API_BASE}/api/Clients/Create`
      : `${API_BASE}/api/Chauffeur/Create`;
  };

  // Fonction pour naviguer vers la bonne page après inscription réussie
  const navigateToUserDashboard = (userData) => {
    console.log('🚀 Navigation vers dashboard, userType:', formData.userType);
    console.log('📦 Données utilisateur:', userData);
    
    if (formData.userType === 'client') {
      // Naviguer vers la page d'accueil client
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'ClientHomepage', 
          params: { 
            user: userData,
            title: `Bonjour ${userData.prenom || ''}`
          }
        }],
      });
    } else {
      // Naviguer vers le tableau de bord chauffeur
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'ChauffeurDashboard', 
          params: { 
            user: userData,
            title: `Tableau de Bord - ${userData.prenom || ''}`
          }
        }],
      });
    }
  };

  const testServerConnection = async () => {
    try {
      setConnectionStatus('Test en cours...');
      const testUrl = getApiBaseUrl();
      console.log('🔍 Test de connexion à:', testUrl);
      
      // Utiliser AbortController pour timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('✅ Test réussi - Statut:', response.status);
      setConnectionStatus('Connecté ✓');
      return true;
    } catch (error) {
      console.log('❌ Test échoué:', error.message);
      setConnectionStatus('Non connecté ✗');
      return false;
    }
  };

  const showConnectionHelp = () => {
    const apiUrl = getApiBaseUrl();
    Alert.alert(
      '🔧 Configuration API',
      `URL API utilisée: ${apiUrl}

Pour que ça fonctionne:
1. ✅ Votre API .NET doit être démarrée
2. ✅ Vérifiez que l'API écoute sur: ${apiUrl}
3. ✅ Testez dans Postman: ${apiUrl}/api/Clients/Create

Si l'API ne répond pas:
• Redémarrez l'API .NET
• Vérifiez que le port 5266 n'est pas utilisé
• Sur votre PC, testez dans Chrome: ${apiUrl}`
    );
  };

  const handleRegister = async () => {
    console.log('🚀 Début de l\'inscription');
    console.log('📱 Type d\'utilisateur:', formData.userType);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Test de connexion avant l'inscription
    console.log('🔍 Test de connexion au serveur...');
    const isConnected = await testServerConnection();
    
    if (!isConnected) {
      const apiUrl = getApiBaseUrl();
      Alert.alert(
        '❌ Erreur de connexion',
        `Impossible de joindre le serveur API.

URL: ${apiUrl}

Vérifiez sur votre PC:
1. L'API .NET est en cours d'exécution
2. Testez dans Postman: ${apiUrl}/api/Clients/Create
3. Redémarrez l'API si nécessaire

Note: Expo Go utilise un tunnel réseau qui permet
d'accéder à localhost depuis votre iPhone.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Aide', onPress: showConnectionHelp }
        ]
      );
      setLoading(false);
      return;
    }
    
    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
        adresse: formData.adresse || '',
        ville: formData.ville || '',
        dateNaissance: formatDateForAPI(formData.dateNaissance),
        photoProfil: "default-avatar.png"
      };  
      
      const API_URL = getApiEndpoint();
      console.log('📡 Envoi des données à:', API_URL);
      console.log('📦 Données:', JSON.stringify(userData, null, 2));
      
      // Timeout de 30 secondes pour l'inscription
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('📊 Réponse reçue - Statut:', response.status);
      
      const responseText = await response.text();
      console.log('📄 Contenu de la réponse:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        console.log('Réponse brute:', responseText.substring(0, 200));
        throw new Error('Le serveur a retourné une réponse invalide (non-JSON)');
      }
      
      if (response.ok) {
        // Préparer les données utilisateur pour la navigation
        const userResponseData = {
          ...data.user,
          userType: formData.userType,
          clientId: data.clientId || null,
          chauffeurId: data.chauffeurId || null
        };
        
        Alert.alert(
          '🎉 Félicitations !',
          data.message || `Votre compte ${formData.userType === 'client' ? 'client' : 'chauffeur'} a été créé avec succès !`,
          [
            {
              text: 'Continuer', 
              onPress: () => {
                console.log('✅ Inscription réussie, données:', data);
                console.log('📍 Navigation vers:', formData.userType === 'client' ? 'ClientHomepage' : 'ChauffeurDashboard');
                navigateToUserDashboard(userResponseData);
              },
            },
          ]
        );
      } else {
        const errorMessage = data.errors 
          ? Array.isArray(data.errors) 
            ? data.errors.join('\n')
            : data.errors
          : data.error || data.message || `Erreur HTTP ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.name === 'AbortError') {
        errorMessage = '⏱️ Le serveur ne répond pas (timeout 30s)';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = `🌐 Erreur réseau

Le serveur API n'est pas accessible.

URL: ${getApiEndpoint()}

Solution:
1. Redémarrez l'API .NET
2. Vérifiez que l'API est bien démarrée
3. Testez dans Postman: ${getApiEndpoint()}`;
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête avec logo et info réseau */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="truck-fast" size={60} color="#1A56DB" />
          <Text style={styles.title}>ALLOHONDA</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>
          
          {/* Indicateur de connexion */}
          <TouchableOpacity 
            style={styles.connectionStatus}
            onPress={showConnectionHelp}
          >
            <View style={styles.statusRow}>
              <Ionicons 
                name={connectionStatus.includes('Connecté') ? "checkmark-circle" : "alert-circle"} 
                size={16} 
                color={connectionStatus.includes('Connecté') ? "#10B981" : "#EF4444"} 
              />
              <Text style={[
                styles.statusText,
                { color: connectionStatus.includes('Connecté') ? "#10B981" : "#6B7280" }
              ]}>
                {connectionStatus}
              </Text>
            </View>
            <View style={styles.serverInfo}>
              <Ionicons name="information-circle" size={14} color="#6B7280" />
              <Text style={styles.serverUrl}>
                API: {getApiBaseUrl().replace('http://', '')}
              </Text>
            </View>
            <Text style={styles.helpText}>Touchez pour info</Text>
          </TouchableOpacity>
        </View>

        {/* Formulaire d'inscription */}
        <View style={styles.formContainer}>
          {/* Sélection du type d'utilisateur */}
          <View style={styles.userTypeSection}>
            <Text style={styles.sectionLabel}>Je m'inscris en tant que :</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'client' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleInputChange('userType', 'client')}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color={formData.userType === 'client' ? '#FFFFFF' : '#1A56DB'}
                />
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'client' && styles.userTypeTextActive,
                ]}>
                  Client
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'chauffeur' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleInputChange('userType', 'chauffeur')}
                disabled={loading}
              >
                <MaterialCommunityIcons
                  name="steering"
                  size={24}
                  color={formData.userType === 'chauffeur' ? '#FFFFFF' : '#1A56DB'}
                />
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'chauffeur' && styles.userTypeTextActive,
                ]}>
                  Chauffeur
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Informations personnelles */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Nom *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChangeText={(text) => handleInputChange('nom', text)}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Prénom *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  value={formData.prenom}
                  onChangeText={(text) => handleInputChange('prenom', text)}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          {/* Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="+33 1 23 45 67 89"
                value={formData.telephone}
                onChangeText={(text) => handleInputChange('telephone', text)}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Adresse */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Votre adresse complète"
                value={formData.adresse}
                onChangeText={(text) => handleInputChange('adresse', text)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Ville */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ville</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Votre ville"
                value={formData.ville}
                onChangeText={(text) => handleInputChange('ville', text)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Date de naissance */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA"
                value={formData.dateNaissance}
                onChangeText={(text) => handleInputChange('dateNaissance', text)}
                keyboardType="numbers-and-punctuation"
                editable={!loading}
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 caractères"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmation mot de passe */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Retaper votre mot de passe"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
            </View>
          </View>

          {/* Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              En créant un compte, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
            </Text>
          </View>

          {/* Bouton TEST API */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={async () => {
              setLoading(true);
              const isConnected = await testServerConnection();
              Alert.alert(
                isConnected ? '✅ Connexion réussie' : '❌ Échec de connexion',
                isConnected 
                  ? `Le serveur API est accessible!\n\nURL: ${getApiBaseUrl()}`
                  : `Impossible de joindre le serveur.\n\nURL: ${getApiBaseUrl()}\n\nVérifiez que l'API .NET est démarrée.`
              );
              setLoading(false);
            }}
            disabled={loading}
          >
            <View style={styles.testButtonContent}>
              <Ionicons name="wifi" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Tester la connexion API</Text>
            </View>
          </TouchableOpacity>

          {/* Bouton d'inscription */}
          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="sync" size={20} color="#FFFFFF" style={styles.loadingIcon} />
                <Text style={styles.registerButtonText}>Inscription en cours...</Text>
              </View>
            ) : (
              <View style={styles.registerButtonContent}>
                <Text style={styles.registerButtonText}>
                  Créer un compte {formData.userType === 'client' ? 'Client' : 'Chauffeur'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
            <TouchableOpacity 
              onPress={() => !loading && navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A56DB',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  connectionStatus: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  serverUrl: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helpText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  formContainer: {
    marginTop: 10,
  },
  userTypeSection: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userTypeButtonActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A56DB',
    marginTop: 8,
    marginBottom: 4,
  },
  userTypeTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 10,
    marginRight: 10,
  },
  eyeButton: {
    padding: 4,
  },
  termsContainer: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 15,
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#1A56DB',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 25,
  },
  registerButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingIcon: {
    animation: 'spin 1s linear infinite',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: '#1A56DB',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});