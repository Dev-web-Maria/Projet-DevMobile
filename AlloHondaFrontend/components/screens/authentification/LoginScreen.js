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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Non testé');

  // ✅ URL DYNAMIQUE selon le périphérique
  const getApiBaseUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL;
  };

  // Fonction pour naviguer vers la bonne page après connexion
  const navigateToUserDashboard = (userData, userType) => {
    console.log('🚀 Navigation après login, userType:', userType);
    console.log('📦 Données utilisateur:', userData);
    
    if (userType === 'client') {
      // Naviguer vers la page d'accueil client
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Client', 
          params: { 
            user: userData,
          }
        }],
      });
    } else if (userType === 'chauffeur') {
      // Naviguer vers le tableau de bord chauffeur
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Driver', 
          params: { 
            user: userData,
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

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    setLoading(true);

    // Test de connexion au serveur
    const isConnected = await testServerConnection();
    
    if (!isConnected) {
      Alert.alert(
        '❌ Erreur de connexion',
        'Impossible de joindre le serveur API. Vérifiez que votre API .NET est démarrée.',
        [{ text: 'OK' }]
      );
      setLoading(false);
      return;
    }

    try {
      const API_URL = `${getApiBaseUrl()}/api/Auth/Login`;
      console.log('📡 Connexion à:', API_URL);
      
      const loginData = {
        email: email.trim(),
        password: password
      };

      // Timeout de 30 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(loginData),
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
        throw new Error('Le serveur a retourné une réponse invalide');
      }

      if (response.ok) {
        // Vérifier le type d'utilisateur dans la réponse
        const userType = data.userType || data.user?.roles?.[0]?.toLowerCase();
        const userData = data.user || data;
        
        console.log('✅ Connexion réussie, userType:', userType);
        
        Alert.alert(
          '✅ Connexion réussie',
          `Bienvenue ${userData.prenom || ''} !`,
          [
            {
              text: 'Continuer',
              onPress: () => navigateToUserDashboard(userData, userType)
            }
          ]
        );
      } else {
        const errorMessage = data.message || data.error || `Erreur HTTP ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.name === 'AbortError') {
        errorMessage = '⏱️ Le serveur ne répond pas (timeout 30s)';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = '🌐 Erreur réseau. Vérifiez votre connexion et que le serveur est démarré.';
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const showConnectionHelp = () => {
    const apiUrl = getApiBaseUrl();
    Alert.alert(
      '🔧 Configuration API',
      `URL API utilisée: ${apiUrl}

Pour que ça fonctionne:
1. ✅ Votre API .NET doit être démarrée
2. ✅ Vérifiez que l'API écoute sur: ${apiUrl}
3. ✅ Testez dans Postman: ${apiUrl}/api/Auth/Login

Si l'API ne répond pas:
• Redémarrez l'API .NET
• Vérifiez que le port 5266 n'est pas utilisé
• Sur votre PC, testez dans Chrome: ${apiUrl}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="truck-fast" size={60} color="#1A56DB" />
            <Text style={styles.title}>ALLOHONDA</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
            
            Indicateur de connexion
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

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="exemple@entreprise.com"
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
                  placeholder="Votre mot de passe"
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

            <TouchableOpacity style={styles.forgotPassword} disabled={loading}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

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

            {/* Bouton de connexion */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Connexion en cours...</Text>
                </View>
              ) : (
                <View style={styles.loginButtonContent}>
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Vous n'avez pas de compte ?</Text>
              <TouchableOpacity onPress={goToRegister} disabled={loading}>
                <Text style={styles.registerLink}>S'inscrire</Text>
              </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
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
    borderRadius: 10,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1A56DB',
    fontWeight: '500',
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
  loginButton: {
    backgroundColor: '#1A56DB',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginButtonContent: {
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
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#9CA3AF',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 5,
  },
  registerLink: {
    fontSize: 14,
    color: '#1A56DB',
    fontWeight: '600',
  },
});