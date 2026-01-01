import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const TrackingScreen = ({ route, navigation }) => {
    const { demande } = route.params;
    const [currentChauffeur, setCurrentChauffeur] = useState(demande?.chauffeur);
    const [loading, setLoading] = useState(false);
    const Api_Base = process.env.EXPO_PUBLIC_API_URL;

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            fetchLatestChauffeurPosition();
        }, 15000); // 15 seconds

        return () => clearInterval(refreshInterval);
    }, []);

    const fetchLatestChauffeurPosition = async () => {
        if (!demande?.idDemande) return;

        try {
            const url = `${Api_Base}/api/DemandeTransports/${demande.idDemande}`;
            const response = await axios.get(url);
            if (response.data.success && response.data.demande?.chauffeur) {
                setCurrentChauffeur(response.data.demande.chauffeur);
            }
        } catch (error) {
            console.error("Erreur fetch position chauffeur:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Suivi en temps réel</Text>
                    <Text style={styles.headerSubtitle}>#{demande?.trackingNumber || demande?.idDemande}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: currentChauffeur?.latitude || 48.8566,
                    longitude: currentChauffeur?.longitude || 2.3522,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {currentChauffeur?.latitude && (
                    <Marker
                        coordinate={{
                            latitude: currentChauffeur.latitude,
                            longitude: currentChauffeur.longitude,
                        }}
                        title="Votre chauffeur"
                        description={currentChauffeur ? `${currentChauffeur.prenom} ${currentChauffeur.nom}` : ""}
                    >
                        <View style={styles.carMarker}>
                            <MaterialCommunityIcons name="truck-fast" size={24} color="#fff" />
                        </View>
                    </Marker>
                )}
            </MapView>

            <View style={styles.infoPanel}>
                <View style={styles.driverInfo}>
                    <View style={styles.driverAvatar}>
                        <Ionicons name="person" size={30} color="#666" />
                    </View>
                    <View style={styles.driverTextContainer}>
                        <Text style={styles.driverName}>
                            {currentChauffeur ? `${currentChauffeur.prenom} ${currentChauffeur.nom}` : "Chauffeur assigné"}
                        </Text>
                        <Text style={styles.driverStatus}>En route vers votre destination</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.routeDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location" size={20} color="#E31E24" />
                        <Text style={styles.detailText} numberOfLines={1}>{demande?.depart}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="flag" size={20} color="#0056A6" />
                        <Text style={styles.detailText} numberOfLines={1}>{demande?.arrivee}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Temps estimé</Text>
                        <Text style={styles.footerValue}>15-20 min</Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Text style={styles.footerLabel}>Distance</Text>
                        <Text style={styles.footerValue}>{demande?.trajet?.distance || "8.5"} km</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    placeholder: {
        width: 40,
    },
    map: {
        flex: 1,
    },
    carMarker: {
        backgroundColor: '#0056A6',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    infoPanel: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    driverAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    driverStatus: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    callButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    routeDetails: {
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        padding: 16,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: '#ddd',
        marginLeft: 10,
        marginVertical: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    footerItem: {
        alignItems: 'center',
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    }
});

export default TrackingScreen;
