import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminCreateChauffeurScreen = ({ navigation, route }) => {
    const editChauffeur = route.params?.chauffeur;
    const isEditMode = !!editChauffeur;

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        ville: '',
        adresse: '',
        numeroPermis: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                nom: editChauffeur.nom || '',
                prenom: editChauffeur.prenom || '',
                email: editChauffeur.email || '',
                telephone: editChauffeur.telephone || '',
                password: '', // Pas d'affichage du password actuel
                ville: editChauffeur.ville || '',
                adresse: editChauffeur.adresse || '',
                numeroPermis: editChauffeur.numeroPermis || '',
            });
        }
    }, [editChauffeur]);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        if (!formData.nom || !formData.prenom || !formData.email || (!isEditMode && !formData.password)) {
            Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const API_BASE = process.env.EXPO_PUBLIC_API_URL;
            const userDataStr = await AsyncStorage.getItem('@user_data');
            const userData = JSON.parse(userDataStr || '{}');
            const token = userData.token || userData.Token;

            if (isEditMode) {
                // Mode Edition
                const updateData = {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    telephone: formData.telephone,
                    adresse: formData.adresse,
                    ville: formData.ville,
                    numeroPermis: formData.numeroPermis
                };

                const response = await fetch(`${API_BASE}/api/Chauffeur/UpdateProfile/${editChauffeur.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(updateData)
                });

                const data = await response.json();

                if (response.ok) {
                    Alert.alert(
                        'Succès',
                        'Le profil du chauffeur a été mis à jour.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    throw new Error(data.message || 'Erreur lors de la mise à jour');
                }

            } else {
                // Mode Création
                const createData = {
                    ...formData,
                    userType: 'chauffeur',
                    statut: 'Disponible', // Par défaut confirmé quand créé par admin
                    photoProfil: 'default-avatar.png'
                };

                const response = await fetch(`${API_BASE}/api/Chauffeur/Create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(createData)
                });

                const data = await response.json();

                if (response.ok) {
                    Alert.alert(
                        'Succès',
                        'Le compte chauffeur a été créé avec succès.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    throw new Error(data.message || 'Erreur lors de la création');
                }
            }

        } catch (error) {
            console.error('Erreur sauvegarde chauffeur:', error);
            Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le chauffeur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>{isEditMode ? 'Modifier Chauffeur' : 'Nouveau Chauffeur'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Informations Personnelles</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom de famille"
                            value={formData.nom}
                            onChangeText={(t) => handleInputChange('nom', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Prénom *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Prénom"
                            value={formData.prenom}
                            onChangeText={(t) => handleInputChange('prenom', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, isEditMode && styles.disabledInput]}
                            placeholder="email@exemple.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isEditMode}
                            value={formData.email}
                            onChangeText={(t) => handleInputChange('email', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Téléphone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="06..."
                            keyboardType="phone-pad"
                            value={formData.telephone}
                            onChangeText={(t) => handleInputChange('telephone', t)}
                        />
                    </View>

                    {!isEditMode && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mot de passe *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="******"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(t) => handleInputChange('password', t)}
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Numéro de Permis</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ABC12345"
                            value={formData.numeroPermis}
                            onChangeText={(t) => handleInputChange('numeroPermis', t)}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Localisation</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ville</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Paris, Lyon..."
                            value={formData.ville}
                            onChangeText={(t) => handleInputChange('ville', t)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adresse</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123 rue de la Paix"
                            value={formData.adresse}
                            onChangeText={(t) => handleInputChange('adresse', t)}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text style={styles.submitText}>
                            {loading ? 'Traitement en cours...' : isEditMode ? 'Enregistrer les modifications' : 'Créer le compte chauffeur'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
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
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 10,
        marginBottom: 15,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4B5563',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
    },
    submitButton: {
        backgroundColor: '#1A56DB',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#93C5FD',
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AdminCreateChauffeurScreen;
