import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { PieChart } from "react-native-chart-kit";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";

const { width } = Dimensions.get("window");

const ClientDashboard = ({ user, navigation }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState({
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesAcceptees: 0,
    demandesEnCours: 0,
    demandesTerminees: 0,
    totalDepense: 0,
    satisfactionRate: 0,
    onTimeDelivery: 85 // Par défaut
  });

  // Animations
  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 100],
    extrapolate: "clamp",
  });

  useEffect(() => {
    loadDashboardData();

    // Rafraîchir toutes les 30 secondes pour le suivi temps réel
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadDashboardData = async (showLoading = true) => {
    const clientId = user?.clientId || user?.ClientId || user?.userdata?.idClient;
    const token = user?.token || user?.Token;
    const Api_Base = process.env.EXPO_PUBLIC_API_URL;

    if (!clientId) return;

    try {
      if (showLoading) setLoading(true);
      const url = `${Api_Base}/api/DemandeTransports/client/${clientId}`;
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data.success) {
        setDemandes(response.data.demandes);
        calculateStats(response.data.demandes);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard client:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const calculateStats = (demandesList) => {
    if (!demandesList) return;

    const totalDepense = demandesList.reduce((sum, d) => sum + (d.prixEstime || 0), 0);

    // Compter les demandes par statut
    const demandesParStatut = demandesList.reduce((acc, d) => {
      const statut = d.statut || 'EN_ATTENTE';
      acc[statut] = (acc[statut] || 0) + 1;
      return acc;
    }, {});

    // Calculer le taux de satisfaction (simplifié)
    const demandesTerminees = demandesParStatut['TERMINEE'] || 0;
    const demandesPositives = demandesTerminees * 0.95; // Simulation
    const satisfactionRate = demandesTerminees > 0
      ? Math.round((demandesPositives / demandesTerminees) * 100)
      : 0;

    setStats({
      totalDemandes: demandesList.length,
      demandesEnAttente: demandesParStatut['EN_ATTENTE'] || 0,
      demandesAcceptees: demandesParStatut['ACCEPTEE'] || 0,
      demandesEnCours: demandesParStatut['EN_COURS'] || 0,
      demandesTerminees: demandesTerminees,
      totalDepense: totalDepense,
      satisfactionRate: satisfactionRate,
      onTimeDelivery: Math.max(85, satisfactionRate - 5) // Simulation
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData(false).then(() => {
      setRefreshing(false);
    });
  };

  // Données du client
  const clientData = {
    name: `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || "Client",
    email: user?.email,
    telephone: user?.telephone,
    adresse: user?.adresse,
    ville: user?.ville,
    photoProfil: user?.photoProfil || "https://i.pravatar.cc/150",
    points: user?.userdata?.loyaltyPoints || 0,
  };

  // Données pour graphiques - basées sur les données réelles
  const getMonthlyShipmentData = () => {
    // Regrouper les demandes par mois
    const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const demandesParMois = Array(12).fill(0);

    if (demandes.length > 0) {
      demandes.forEach(d => {
        const date = new Date(d.dateDepart);
        const moisIndex = date.getMonth();
        if (!isNaN(moisIndex) && moisIndex >= 0 && moisIndex < 12) {
          demandesParMois[moisIndex]++;
        }
      });
    }

    return {
      labels: mois.slice(0, 6), // 6 derniers mois
      datasets: [{
        data: demandesParMois.slice(0, 6),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const getShipmentTypeData = () => {
    // Analyser les types de marchandises
    const types = {};
    demandes.forEach(d => {
      const type = d.typeMarchandise || 'Autre';
      types[type] = (types[type] || 0) + 1;
    });

    const colors = ["#E31E24", "#0056A6", "#00A651", "#FFB300", "#9C27B0", "#FF9800"];
    return Object.entries(types).map(([name, count], index) => ({
      name,
      population: count,
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));
  };

  const performanceData = {
    labels: ["Livraison", "Satisfaction", "Suivi", "Service"],
    data: [
      stats.onTimeDelivery / 100,
      stats.satisfactionRate / 100,
      0.85, // Suivi (simulation)
      0.88, // Service (simulation)
    ],
  };

  // Envois en cours (demandes avec statut EN_COURS ou ACCEPTEE)
  const activeShipments = demandes
    .filter(d => d.statut === 'EN_COURS' || d.statut === 'ACCEPTEE')
    .map((demande, index) => ({
      id: demande.idDemande || index,
      trackingNumber: `HONDA-${new Date().getFullYear()}-${(demande.idDemande || index).toString().padStart(4, '0')}`,
      from: demande.depart || "Non spécifié",
      to: demande.arrivee || "Non spécifié",
      status: demande.statut === 'EN_COURS' ? 'en transit' : 'préparation',
      progress: demande.statut === 'EN_COURS' ? 75 : 30,
      departure: demande.dateDepart ?
        `Le ${new Date(demande.dateDepart).toLocaleDateString('fr-FR')} ${demande.heureDepart || ''}` :
        "Non spécifié",
      estimatedArrival: demande.trajet?.dureeEstimee ?
        `Arrivée estimée: ${demande.trajet.dureeEstimee}h` :
        "Non spécifié",
      items: demande.descriptionMarchandise ? [demande.descriptionMarchandise] : ["Marchandise non décrite"],
      vehicle: demande.chauffeur?.vehicule?.type || "Véhicule Honda",
      driver: demande.chauffeur ?
        `${demande.chauffeur.nom || ''} ${demande.chauffeur.prenom || ''}`.trim() || "Chauffeur non assigné" :
        "Chauffeur non assigné",
      demandeData: demande
    }));

  // Historique récent (demandes terminées)
  const recentHistory = demandes
    .filter(d => d.statut === 'TERMINEE')
    .slice(0, 2)
    .map((demande, index) => ({
      id: demande.idDemande || index,
      trackingNumber: `HONDA-${new Date(demande.dateDepart).getFullYear()}-${(demande.idDemande || index).toString().padStart(4, '0')}`,
      date: new Date(demande.dateDepart).toLocaleDateString('fr-FR'),
      from: demande.depart || "Non spécifié",
      to: demande.arrivee || "Non spécifié",
      status: demande.statut.toLowerCase(),
      rating: 5, // À implémenter avec un système de notation
      cost: `${demande.prixEstime?.toFixed(2) || '0'}€`,
    }));

  // Promotions
  const promotions = [
    {
      id: 1,
      title: "-20% Premier envoi",
      code: "HONDAFIRST20",
      validUntil: "30/04/2024",
    },
    {
      id: 2,
      title: "Livraison gratuite",
      description: "Pour tout envoi > 100€",
      code: "FREESHIP100",
      validUntil: "15/05/2024",
    },
  ];

  // Navigation vers les détails d'une demande
  const handleDemandePress = (demande) => {
    navigation.navigate('DemandeDetails', { demande });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0056A6" />
        <Text style={styles.loadingText}>Chargement de votre tableau de bord...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0056A6" />

      {/* Header animé */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <FontAwesome5 name="shipping-fast" size={24} color="#fff" />
              <Text style={styles.logoText}>Allo</Text>
              <Text style={[styles.logoText, { color: "#FFD700" }]}>Honda</Text>
              <Text style={styles.logoSubtext}>Transport</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: clientData.photoProfil }}
              style={styles.avatar}
            // defaultSource={require('../../assets/default-avatar.png')}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Bonjour,</Text>
              <Text style={styles.clientName}>{clientData.name}</Text>
              {clientData.points > 0 && (
                <View style={styles.loyaltyBadge}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.loyaltyText}>
                    {clientData.points} points fidélité
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0056A6"]}
            tintColor="#0056A6"
          />
        }
      >
        {/* Cartes de statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={24}
                  color="#E31E24"
                />
              </View>
              <Text style={styles.statNumber}>{stats.totalDemandes}</Text>
              <Text style={styles.statLabel}>Demandes totales</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={24}
                  color="#0056A6"
                />
              </View>
              <Text style={styles.statNumber}>{stats.demandesEnCours}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <FontAwesome5 name="euro-sign" size={20} color="#00A651" />
              </View>
              <Text style={styles.statNumber}>{stats.totalDepense.toFixed(2)}€</Text>
              <Text style={styles.statLabel}>Total dépensé</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={24} color="#FFB300" />
              </View>
              <Text style={styles.statNumber}>{stats.onTimeDelivery}%</Text>
              <Text style={styles.statLabel}>À l'heure</Text>
            </View>
          </View>
        </View>

        {/* Graphiques */}
        {demandes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyses et performances</Text>

            {/* Graphique en ligne - Tendances mensuelles */}
            {demandes.length >= 3 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Demandes mensuelles</Text>
                <LineChart
                  data={getMonthlyShipmentData()}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#2196F3",
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            {/* Graphique circulaire - Types de marchandises */}
            {demandes.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Types de marchandises</Text>
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={getShipmentTypeData()}
                    width={width - 60}
                    height={180}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              </View>
            )}

            {/* Graphique de performance */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Indicateurs de performance</Text>
              <ProgressChart
                data={performanceData}
                width={width - 60}
                height={180}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(231, 30, 36, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                hideLegend={false}
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Demande en cours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Demandes en cours ({activeShipments.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('MesDemandes')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {activeShipments.length > 0 ? (
            activeShipments.map((shipment) => (
              <TouchableOpacity
                key={shipment.id}
                style={styles.shipmentCard}
                onPress={() => handleDemandePress(shipment.demandeData)}
              >
                <View style={styles.shipmentHeader}>
                  <View>
                    <Text style={styles.trackingNumber}>
                      {shipment.trackingNumber}
                    </Text>
                    <Text style={styles.route}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={14}
                        color="#E31E24"
                      />{" "}
                      {shipment.from} → {shipment.to}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          shipment.status === 'en transit'
                            ? "#2196F3"
                            : "#FF9800",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {shipment.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Barre de progression */}
                <View style={styles.progressSection}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progression</Text>
                    <Text style={styles.progressPercentage}>
                      {shipment.progress}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${shipment.progress}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.shipmentDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Feather name="clock" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {shipment.departure}
                      </Text>
                    </View>
                    {shipment.estimatedArrival && (
                      <View style={styles.detailItem}>
                        <Feather name="calendar" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {shipment.estimatedArrival}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.detailRow}>
                    {shipment.vehicle && (
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="car"
                          size={16}
                          color="#666"
                        />
                        <Text style={styles.detailText}>{shipment.vehicle}</Text>
                      </View>
                    )}
                    {shipment.driver && (
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="account"
                          size={16}
                          color="#666"
                        />
                        <Text style={styles.detailText}>Chauffeur: {shipment.driver}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemsContainer}>
                    {shipment.items.map((item, index) => (
                      <View key={index} style={styles.itemTag}>
                        <MaterialCommunityIcons
                          name="package"
                          size={12}
                          color="#666"
                        />
                        <Text style={styles.itemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Mini Carte de suivi si le chauffeur est en route */}
                {shipment.status === 'en transit' && shipment.demandeData.chauffeur?.latitude && (
                  <View style={styles.miniMapContainer}>
                    <MapView
                      style={styles.miniMap}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      region={{
                        latitude: shipment.demandeData.chauffeur.latitude,
                        longitude: shipment.demandeData.chauffeur.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: shipment.demandeData.chauffeur.latitude,
                          longitude: shipment.demandeData.chauffeur.longitude,
                        }}
                      >
                        <View style={styles.driverMarker}>
                          <Ionicons name="car" size={14} color="#fff" />
                        </View>
                      </Marker>
                    </MapView>
                    <View style={styles.mapOverlayHint}>
                      <Text style={styles.mapHintText}>Chauffeur en mouvement</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.trackButton}
                  onPress={() => navigation.navigate('Tracking', { demande: shipment.demandeData })}
                >
                  <MaterialCommunityIcons
                    name="map-marker-path"
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.trackButtonText}>Suivre ma demande</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="truck-remove"
                size={50}
                color="#ccc"
              />
              <Text style={styles.emptyStateText}>
                Aucune demande en cours
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('NouvelleDemande')}
              >
                <Text style={styles.createButtonText}>Créer une demande</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offres spéciales Honda</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promotions.map((promo) => (
              <View key={promo.id} style={styles.promotionCard}>
                <View style={styles.promotionHeader}>
                  <MaterialCommunityIcons
                    name="tag"
                    size={24}
                    color="#E31E24"
                  />
                  <Text style={styles.promotionTitle}>{promo.title}</Text>
                </View>
                {promo.description && (
                  <Text style={styles.promotionDescription}>
                    {promo.description}
                  </Text>
                )}
                <View style={styles.codeContainer}>
                  <Text style={styles.codeLabel}>CODE:</Text>
                  <Text style={styles.codeText}>{promo.code}</Text>
                </View>
                <Text style={styles.validUntil}>
                  Valable jusqu'au {promo.validUntil}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Historique récent */}
        {recentHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historique récent</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Historique')}>
                <Text style={styles.seeAllText}>Voir l'historique</Text>
              </TouchableOpacity>
            </View>

            {recentHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyCard}
                onPress={() => navigation.navigate('DemandeDetails', { demandeId: item.id })}
              >
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyTracking}>
                      {item.trackingNumber}
                    </Text>
                    <Text style={styles.historyRoute}>
                      {item.from} → {item.to}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyCost}>{item.cost}</Text>
                    <View style={styles.ratingContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < item.rating ? "star" : "star-outline"}
                          size={14}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <View
                    style={[
                      styles.historyStatus,
                      { backgroundColor: "#4CAF50" },
                    ]}
                  >
                    <Text style={styles.historyStatusText}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Section informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes informations</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={20} color="#0056A6" />
              <Text style={styles.infoText}>{clientData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color="#0056A6" />
              <Text style={styles.infoText}>{clientData.telephone || 'Non renseigné'}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#0056A6" />
              <Text style={styles.infoText}>{clientData.adresse || 'Non renseigné'}, {clientData.ville}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Profil')}
            >
              <Text style={styles.editButtonText}>Modifier mon profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  miniMapContainer: {
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniMap: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: '#0056A6',
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  mapOverlayHint: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapHintText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: "#288be8ff",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: "hidden",
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    flex: 1,
    justifyContent: "space-between",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  logoSubtext: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFD700",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  clientName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  loyaltyText: {
    fontSize: 12,
    color: "#FFD700",
    marginLeft: 4,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    marginTop: -30,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#E31E24",
    fontSize: 14,
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: "center",
  },
  shipmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shipmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  route: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: 15,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E31E24",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  shipmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  itemTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2775bdff",
    paddingVertical: 12,
    borderRadius: 12,
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  promotionCard: {
    backgroundColor: "#2775bdff",
    borderRadius: 16,
    padding: 20,
    marginRight: 15,
    width: width * 0.7,
  },
  promotionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  promotionDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 15,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  codeLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginRight: 8,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  validUntil: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  historyTracking: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  historyRoute: {
    fontSize: 13,
    color: "#666",
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyCost: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2775bdff",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 13,
    color: "#999",
  },
  historyStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#0056A6",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 15,
    flex: 1,
  },
  editButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonText: {
    color: "#0056A6",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ClientDashboard;