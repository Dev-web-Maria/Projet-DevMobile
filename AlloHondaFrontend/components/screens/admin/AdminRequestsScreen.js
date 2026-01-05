import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert // Added Alert import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage'; // Added AsyncStorage import

const AdminRequestsScreen = ({ navigation }) => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, en_cours, terminee

    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        try {
            setLoading(true);
            const API_BASE = process.env.EXPO_PUBLIC_API_URL;

            const userDataStr = await AsyncStorage.getItem('@user_data');
            let token = null;
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                token = userData.token || userData.Token;
            }

            const response = await fetch(`${API_BASE}/api/DemandeTransports`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const rawList = data.demandes || (Array.isArray(data) ? data : []);

                const formatted = rawList.map(d => ({
                    id: d.idDemande,
                    date: d.dateDepart ? new Date(d.dateDepart).toLocaleDateString() : '---',
                    status: mapStatus(d.statut),
                    depart: d.depart,
                    arrivee: d.arrivee,
                    client: d.client ? `${d.client.prenom || ''} ${d.client.nom || ''}`.trim() : `Client #${d.clientId}`,
                    chauffeur: d.chauffeur ? `${d.chauffeur.prenom || ''} ${d.chauffeur.nom || ''}`.trim() : null,
                    prix: d.prixEstime
                }));

                setDemandes(formatted);
            } else {
                Alert.alert('Erreur', `Impossible de charger les demandes (${response.status})`);
            }
        } catch (error) {
            console.error('Erreur fetch demandes:', error);
            Alert.alert('Erreur', 'Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    // Removed getMockDemandes function

    const filteredDemandes = demandes.filter(d => {
        if (filter === 'all') return true;
        if (filter === 'en_cours') return d.status === 'En cours' || d.status === 'En attente';
        if (filter === 'terminee') return d.status === 'Terminée' || d.status === 'Annulée';
        return true;
    });

    const mapStatus = (status) => {
        switch (status) {
            case 'TERMINEE': return 'Terminée';
            case 'EN_COURS': return 'En cours';
            case 'EN_ATTENTE': return 'En attente';
            case 'ANNULEE': return 'Annulée';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Terminée': return '#10B981';
            case 'En cours': return '#3B82F6';
            case 'En attente': return '#F59E0B';
            case 'Annulée': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date}</Text>
                <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.itineraryContainer}>
                <View style={styles.pointRow}>
                    <Ionicons name="radio-button-on" size={16} color="#1A56DB" />
                    <Text style={styles.addressText}>{item.depart}</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.pointRow}>
                    <Ionicons name="location" size={16} color="#EF4444" />
                    <Text style={styles.addressText}>{item.arrivee}</Text>
                </View>
            </View>

            <View style={styles.actorsContainer}>
                <View style={styles.actorItem}>
                    <Text style={styles.actorLabel}>Client</Text>
                    <Text style={styles.actorName}>{item.client}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                <View style={styles.actorItem}>
                    <Text style={styles.actorLabel}>Chauffeur</Text>
                    <Text style={styles.actorName}>{item.chauffeur || '---'}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.price}>{item.prix} Dhs</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Suivi des Missions</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.filterContainer}>
                {['all', 'en_cours', 'terminee'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'all' ? 'Toutes' : f === 'en_cours' ? 'En cours' : 'Terminées'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1A56DB" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredDemandes}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Aucune mission trouvée</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    date: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    itineraryContainer: {
        marginBottom: 15,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 4,
    },
    line: {
        height: 15,
        width: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 7.5,
    },
    addressText: {
        fontSize: 14,
        color: '#111827',
        flex: 1,
    },
    actorsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    actorItem: {
        flex: 1,
    },
    actorLabel: {
        fontSize: 10,
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    actorName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A56DB',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6B7280',
        fontSize: 16,
    },
});

export default AdminRequestsScreen;
