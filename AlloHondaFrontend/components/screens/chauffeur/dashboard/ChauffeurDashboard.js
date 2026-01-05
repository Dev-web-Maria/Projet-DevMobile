import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { ProgressBar } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";

const { width } = Dimensions.get("window");

const ChauffeurDashboard = ({ user, navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [missions, setMissions] = useState([]);
  const [todayStats, setTodayStats] = useState({
    deliveriesCompleted: 0,
    kilometers: "0 km",
    earningsToday: "0€",
    fuelConsumption: "0 L",
    co2Saved: "0 kg",
  });
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Localisation en cours...");
  const [currentStatus, setCurrentStatus] = useState(user?.UserData?.statut || user?.statut || "En attente");

  // Normalisation des données utilisateur
  const chauffeurId = user?.chauffeurId || user?.ChauffeurId || user?.UserData?.idChauffeur;
  const token = user?.token || user?.Token;
  const username = user?.prenom ? `${user.prenom} ${user.nom}` : "Chauffeur";
  const Api_Base = process.env.EXPO_PUBLIC_API_URL;

  const driverData = {
    name: username,
    driverId: `HONDA-DR-${(chauffeurId || 0).toString().padStart(4, '0')}`,
    vehicle: user?.UserData?.vehicule?.type || "Non assigné",
    plateNumber: user?.UserData?.vehicule?.immatriculation || "N/A",
    rating: 4.9,
    avatar: user?.photoProfil || "https://randomuser.me/api/portraits/men/32.jpg",
  };

  useEffect(() => {
    const status = user?.UserData?.statut || user?.statut || "En attente";
    setCurrentStatus(status);
    setIsAvailable(status === "Disponible");
    loadDashboardData();

    let locationWatcher;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress("Permission de localisation refusée");
        return;
      }

      // Initial position fetch
      getUserLocation();

      // Watch for position updates
      locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 10000, // Or every 10 seconds
        },
        (newLocation) => {
          updateLocationData(newLocation);
        }
      );
    };

    startTracking();

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, [user]);

  const updateLocationData = async (currentLocation) => {
    try {
      setLocation(currentLocation.coords);

      // Envoyer la position au backend (Throttled/Limited to avoid too many API calls)
      if (chauffeurId) {
        const url = `${Api_Base}/api/Chauffeur/UpdatePosition/${chauffeurId}`;
        await axios.put(url, {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        }, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      }

      // Mettre à jour l'adresse occasionnellement (optionnel pour économiser des ressources)
      if (!address || address === "Localisation en cours...") {
        getReadableAddress(currentLocation.coords);
      }
    } catch (error) {
      console.error("Error updating location data:", error);
    }
  };

  const getReadableAddress = async (coords) => {
    try {
      let reverseResult = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude
      });

      if (reverseResult.length > 0) {
        const item = reverseResult[0];
        setAddress(`${item.city || item.region}, ${item.country}`);
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAddress("Permission de localisation refusée");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation.coords);
      getReadableAddress(currentLocation.coords);

      // Envoyer la position initiale
      if (chauffeurId) {
        const url = `${Api_Base}/api/Chauffeur/UpdatePosition/${chauffeurId}`;
        await axios.put(url, {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        }, {
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Erreur localisation:", error);
      setAddress("Localisation indisponible");
    }
  };

  const fetchStats = async () => {
    if (!chauffeurId) return;
    try {
      const url = `${Api_Base}/api/Chauffeur/GetStats/${chauffeurId}`;
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.data.success) {
        const s = response.data.stats;
        setTodayStats({
          deliveriesCompleted: s.todayMissions,
          kilometers: s.todayDistance.toFixed(1) + " km",
          earningsToday: s.todayEarnings + "€",
          fuelConsumption: (s.todayDistance * 0.08).toFixed(1) + " L", // Estimation 8L/100km
          co2Saved: (s.todayDistance * 0.12).toFixed(1) + " kg", // Estimation 120g/km
        });
      }
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  const loadDashboardData = async () => {
    if (!chauffeurId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${Api_Base}/api/Chauffeur/GetMissions/${chauffeurId}`;
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data.success) {
        setMissions(response.data.missions);
        if (response.data.statut) {
          setCurrentStatus(response.data.statut);
          setIsAvailable(response.data.statut === "Disponible");
        }
        await fetchStats();
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleStatusChange = async () => {
    if (currentStatus === "En attente") {
      Alert.alert("Accès restreint", "Votre compte est en attente d'approbation. Vous ne pouvez pas passer en ligne pour le moment.");
      return;
    }

    const newStatus = !isAvailable ? "Disponible" : "Occupe";
    try {
      const url = `${Api_Base}/api/Chauffeur/UpdateStatus/${chauffeurId}`;
      const response = await axios.put(url, JSON.stringify(newStatus), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setIsAvailable(!isAvailable);
        setCurrentStatus(newStatus);
        Alert.alert("Statut mis à jour", `Vous êtes maintenant ${newStatus.toLowerCase()}.`);
      }
    } catch (error) {
      console.error("Erreur statut:", error);
      Alert.alert("Erreur", "Impossible de changer votre statut.");
    }
  };

  const startMission = (mission) => {
    // Naviguer vers l'écran de suivi
    navigation.navigate("ChauffeurTracking", { mission, user });
  };

  const updateMissionProgress = async (missionId, progress) => {
    try {
      const url = `${Api_Base}/api/Chauffeur/UpdateMissionProgress/${missionId}`;
      const response = await axios.put(url, { progress }, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error("Erreur progression:", error);
    }
  };

  const renderMissionCard = (mission) => {
    const isActive = mission.status === "EN_COURS";
    const isAccepted = mission.status === "ACCEPTEE";
    const isFinished = mission.status === "TERMINEE";

    if (isFinished) return null; // On ne montre que les missions actives/accéptées

    return (
      <View key={mission.id} style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <View>
            <Text style={styles.missionId}>#ID-{mission.id}</Text>
            <Text style={styles.missionType}>{mission.type}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isActive ? '#4CAF50' : isAccepted ? '#2196F3' : '#757575' }
          ]}>
            <Text style={styles.statusText}>{mission.status.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.location}>
            <MaterialIcons name="location-pin" size={18} color="#E31E24" />
            <Text style={styles.locationText} numberOfLines={1}>{mission.from}</Text>
          </View>
          <View style={styles.routeLink} />
          <View style={styles.location}>
            <MaterialIcons name="location-on" size={18} color="#0056A6" />
            <Text style={styles.locationText} numberOfLines={1}>{mission.to}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.footerText}>{mission.scheduledTime}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.footerText}>{mission.customer}</Text>
          </View>
          <Text style={styles.cardPrice}>{mission.payment}</Text>
        </View>

        <TouchableOpacity
          style={[styles.missionButton, isActive && styles.missionButtonActive]}
          onPress={() => startMission(mission)}
        >
          <Text style={styles.missionButtonText}>
            {isActive ? 'Reprendre le trajet' : isAccepted ? 'Démarrer la mission' : 'Détails'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: driverData.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.name}>{driverData.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.statusToggle} onPress={handleStatusChange}>
          <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#4CAF50' : '#FF9800' }]} />
          <Text style={styles.statusLabel}>{isAvailable ? 'Disponible' : 'Occupé'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bannière de compte en attente */}
      {currentStatus === "En attente" && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={20} color="#856404" />
          <Text style={styles.pendingText}>
            Votre compte est en attente de validation par l'administrateur.
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E31E24"]} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Résumé du jour</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e31e2415' }]}>
                <MaterialCommunityIcons name="package-variant" size={24} color="#E31E24" />
              </View>
              <Text style={styles.statNumber}>{todayStats.deliveriesCompleted}</Text>
              <Text style={styles.statDesc}>Missions</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#0056a615' }]}>
                <MaterialCommunityIcons name="map-marker-distance" size={24} color="#0056A6" />
              </View>
              <Text style={styles.statNumber}>{todayStats.kilometers}</Text>
              <Text style={styles.statDesc}>Distance</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#00a65115' }]}>
                <FontAwesome5 name="money-bill" size={20} color="#00A651" />
              </View>
              <Text style={styles.statNumber}>{todayStats.earningsToday}</Text>
              <Text style={styles.statDesc}>Gains</Text>
            </View>
          </View>
        </View>

        {/* Current Missions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Missions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Demande")}>
              <Text style={styles.linkText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#E31E24" style={{ margin: 20 }} />
          ) : missions.filter(m => m.status !== "TERMINEE").length > 0 ? (
            missions.map(renderMissionCard)
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="calendar-blank" size={50} color="#ccc" />
              <Text style={styles.emptyTitle}>Rien pour le moment</Text>
              <Text style={styles.emptyText}>Trouvez de nouvelles missions dans l'onglet Demandes</Text>
              <TouchableOpacity
                style={styles.findBtn}
                onPress={() => navigation.navigate("Demande")}
              >
                <Text style={styles.findBtnText}>Explorer les demandes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Map Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma position actuelle</Text>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={{
                latitude: location?.latitude || 48.8566,
                longitude: location?.longitude || 2.3522,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker coordinate={{
                latitude: location?.latitude || 48.8566,
                longitude: location?.longitude || 2.3522
              }}>
                <View style={styles.marker}>
                  <Ionicons name="car" size={20} color="#fff" />
                </View>
              </Marker>
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.locationName}>{address}</Text>
              <Text style={styles.locationCoords}>
                {location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` : "Chargement..."}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  greeting: {
    fontSize: 12,
    color: "#888",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  linkText: {
    fontSize: 14,
    color: "#E31E24",
    fontWeight: "600",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statCard: {
    backgroundColor: "#f9f9f9",
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statDesc: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  missionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  missionId: {
    fontSize: 12,
    color: "#bbb",
    fontWeight: "600",
  },
  missionType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  routeContainer: {
    marginBottom: 15,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 10,
    fontWeight: "500",
    flex: 1,
  },
  routeLink: {
    width: 2,
    height: 15,
    backgroundColor: "#eee",
    marginLeft: 8,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f9f9f9",
    paddingTop: 12,
    marginBottom: 15,
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E31E24",
  },
  missionButton: {
    backgroundColor: "#2196F3",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  missionButtonActive: {
    backgroundColor: "#4CAF50",
  },
  missionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  emptyCard: {
    backgroundColor: "#fefefe",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#eee",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  findBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  findBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  mapContainer: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: "#E31E24",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  locationCoords: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  pendingBanner: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEEBA",
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    color: "#856404",
    fontWeight: "500",
  },
});

export default ChauffeurDashboard;
