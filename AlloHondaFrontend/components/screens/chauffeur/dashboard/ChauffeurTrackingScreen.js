import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const ChauffeurTrackingScreen = ({ route, navigation }) => {
    const { mission, user } = route.params;
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(mission?.status || mission?.statut);
    const Api_Base = process.env.EXPO_PUBLIC_API_URL;
    const token = user?.token || user?.Token;
    const [driverLocation, setDriverLocation] = useState(null);
    const [region, setRegion] = useState(null);

    // Parse coordinates from mission data
    const startCoords = mission?.departCoord ? {
        latitude: parseFloat(mission.departCoord.split(',')[0]),
        longitude: parseFloat(mission.departCoord.split(',')[1])
    } : null;

    const endCoords = mission?.arriveeCoord ? {
        latitude: parseFloat(mission.arriveeCoord.split(',')[0]),
        longitude: parseFloat(mission.arriveeCoord.split(',')[1])
    } : null;

    useEffect(() => {
        let isMounted = true;
        let watcher = null;

        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'La localisation est requise pour le suivi.');
                return;
            }

            // Get initial location
            let location = await Location.getCurrentPositionAsync({});
            if (isMounted) {
                setDriverLocation(location.coords);

                const initialLat = location.coords.latitude || startCoords?.latitude || 48.8566;
                const initialLng = location.coords.longitude || startCoords?.longitude || 2.3522;

                setRegion({
                    latitude: initialLat,
                    longitude: initialLng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }

            // Watch position updates
            watcher = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,
                    timeInterval: 5000,
                },
                (newLocation) => {
                    if (isMounted) {
                        setDriverLocation(newLocation.coords);
                        updateBackendPosition(newLocation.coords);
                    }
                }
            );
        })();

        return () => {
            isMounted = false;
            if (watcher) watcher.remove();
        };
    }, []);

    const updateBackendPosition = async (coords) => {
        const chauffeurId = user?.userData?.idChauffeur;
        if (!chauffeurId) return;

        try {
            await axios.put(`${Api_Base}/api/Chauffeur/UpdatePosition/${chauffeurId}`, {
                latitude: coords.latitude,
                longitude: coords.longitude
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Erreur sync position:", error);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setLoading(true);
            const url = `${Api_Base}/api/Chauffeur/UpdateMissionProgress/${mission.id || mission.idDemande}`;

            // Map progress based on status
            let progress = 0;
            if (newStatus === "EN_COURS") progress = 50;
            if (newStatus === "TERMINEE") progress = 100;

            const response = await axios.put(url, { progress }, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.data.success) {
                setStatus(response.data.statut);
                Alert.alert("Succès", `Statut mis à jour : ${response.data.statut}`);
                if (newStatus === "TERMINEE") {
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error("Erreur mise à jour statut:", error);
            Alert.alert("Erreur", "Impossible de mettre à jour le statut");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Trajet de la mission</Text>
                    <Text style={styles.headerSubtitle}>#ID-{mission?.id || mission?.idDemande}</Text>
                </View>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region || undefined}
                    onRegionChangeComplete={(r) => setRegion(r)}
                    showsUserLocation={true}
                    followsUserLocation={true}
                >
                    {/* Depart Marker */}
                    {startCoords && (
                        <Marker
                            coordinate={startCoords}
                            title="Point de départ"
                            pinColor="#4CAF50"
                        >
                            <MaterialIcons name="location-on" size={32} color="#4CAF50" />
                        </Marker>
                    )}

                    {/* Arrivee Marker */}
                    {endCoords && (
                        <Marker
                            coordinate={endCoords}
                            title="Destination"
                            pinColor="#E31E24"
                        >
                            <MaterialIcons name="flag" size={36} color="#E31E24" />
                        </Marker>
                    )}

                    {/* Trajectory */}
                    {startCoords && endCoords && (
                        <Polyline
                            coordinates={[
                                driverLocation || startCoords,
                                startCoords,
                                endCoords
                            ]}
                            strokeWidth={5}
                            strokeColor="#2196F3"
                        />
                    )}
                </MapView>

                {driverLocation && (
                    <TouchableOpacity
                        style={styles.recenterButton}
                        onPress={() => setRegion({
                            ...region,
                            latitude: driverLocation.latitude,
                            longitude: driverLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        })}
                    >
                        <MaterialIcons name="my-location" size={24} color="#2196F3" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.infoPanel}>
                <View style={styles.missionHeader}>
                    <Text style={styles.missionType}>{mission?.type || "Transport"}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status === "TERMINEE" ? "#4CAF50" : "#2196F3" }]}>
                        <Text style={styles.statusText}>{status?.replace('_', ' ')}</Text>
                    </View>
                </View>

                <View style={styles.routeDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={22} color="#E31E24" />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Ramassage</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{mission?.from || mission?.depart}</Text>
                        </View>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.detailRow}>
                        <MaterialIcons name="flag" size={22} color="#0056A6" />
                        <View style={styles.detailTextContainer}>
                            <Text style={styles.detailLabel}>Destination</Text>
                            <Text style={styles.detailValue} numberOfLines={1}>{mission?.to || mission?.arrivee}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.clientInfo}>
                    <View style={styles.clientAvatar}>
                        <Ionicons name="person" size={24} color="#666" />
                    </View>
                    <View style={styles.clientText}>
                        <Text style={styles.clientName}>{mission?.customer || "Client"}</Text>
                        <Text style={styles.clientPhone}>{mission?.customerPhone || "Pas de numéro"}</Text>
                    </View>
                    {mission?.customerPhone && (
                        <TouchableOpacity style={styles.callButton}>
                            <Ionicons name="call" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    {status !== "TERMINEE" && (
                        <TouchableOpacity
                            style={[styles.actionButton, status === "ACCEPTEE" ? styles.startBtn : styles.finishBtn]}
                            onPress={() => handleUpdateStatus(status === "ACCEPTEE" ? "EN_COURS" : "TERMINEE")}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.actionBtnText}>
                                    {status === "ACCEPTEE" ? "Démarrer le trajet" : "Terminer la mission"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    recenterButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    infoPanel: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    missionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    missionType: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    routeDetails: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#eee',
        marginLeft: 10,
        marginVertical: 4,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 15,
        marginBottom: 20,
    },
    clientAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clientText: {
        flex: 1,
        marginLeft: 15,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    clientPhone: {
        fontSize: 14,
        color: '#666',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtons: {
        marginTop: 10,
    },
    actionButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    startBtn: {
        backgroundColor: '#2196F3',
    },
    finishBtn: {
        backgroundColor: '#4CAF50',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ChauffeurTrackingScreen;
