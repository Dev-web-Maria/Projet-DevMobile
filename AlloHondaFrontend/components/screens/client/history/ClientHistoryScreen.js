import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import axios from "axios";
import { RefreshControl, ActivityIndicator, Alert } from "react-native";

const ClientHistoryScreen = ({ user }) => {
  const [filter, setFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipmentsHistory, setShipmentsHistory] = useState([]);

  const Api_Base = process.env.EXPO_PUBLIC_API_URL;
  const clientId = user?.clientId || user?.ClientId || user?.userdata?.idClient || user?.userData?.idClient;
  const token = user?.token || user?.Token;

  useEffect(() => {
    fetchHistory();
  }, [clientId]);

  const fetchHistory = async (showLoading = true) => {
    if (!clientId) return;

    try {
      if (showLoading) setLoading(true);
      const url = `${Api_Base}/api/DemandeTransports/client/${clientId}`;
      const response = await axios.get(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter for completed demands
        const history = response.data.demandes
          .filter(d => d.statut === 'TERMINEE')
          .map(d => ({
            id: `HONDA-${new Date(d.dateDepart).getFullYear()}-${d.idDemande.toString().padStart(4, '0')}`,
            dbId: d.idDemande,
            date: new Date(d.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            type: d.typeMarchandise,
            from: d.depart,
            to: d.arrivee,
            status: 'livré',
            weight: `${d.poids} kg`,
            items: d.volume > 0 ? Math.max(1, Math.floor(d.volume * 2)) : 1,
            cost: `${d.prixEstime}Dhs`,
            driver: d.chauffeur ? `${d.chauffeur.prenom} ${d.chauffeur.nom}` : "Non assigné",
            vehicle: d.chauffeur?.vehicule?.type || "Non spécifié",
            rating: 5, // Simulated for now
            timeline: [
              { time: d.heureDepart || "09:00", status: "Prise en charge", location: d.depart },
              { time: "Livré", status: "Livré", location: d.arrivee },
            ]
          }));
        setShipmentsHistory(history);
      }
    } catch (error) {
      console.error("Erreur fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory(false);
  }, [clientId]);

  // Filtrer les données
  const filteredShipments = filter === "all"
    ? shipmentsHistory
    : shipmentsHistory.filter(shipment => shipment.type.toLowerCase().includes(filter));

  // Statistiques
  const stats = {
    total: shipmentsHistory.length,
    totalCost: shipmentsHistory.reduce((sum, s) => sum + parseInt(s.cost), 0),
    averageRating: (shipmentsHistory.reduce((sum, s) => sum + s.rating, 0) / shipmentsHistory.length).toFixed(1),
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  const renderShipmentCard = (shipment) => (
    <TouchableOpacity
      key={shipment.id}
      style={styles.shipmentCard}
      onPress={() => setSelectedShipment(selectedShipment?.id === shipment.id ? null : shipment)}
    >
      <View style={styles.shipmentHeader}>
        <View style={styles.shipmentInfo}>
          <Text style={styles.shipmentId}>{shipment.id}</Text>
          <Text style={styles.shipmentDate}>{shipment.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: "#4CAF50" }]}>
          <Text style={styles.statusText}>{shipment.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.location}>
          <MaterialIcons name="location-on" size={18} color="#E31E24" />
          <Text style={styles.locationText}>{shipment.from}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={20} color="#666" style={styles.arrow} />
        <View style={styles.location}>
          <MaterialIcons name="location-on" size={18} color="#0056A6" />
          <Text style={styles.locationText}>{shipment.to}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="package-variant" size={16} color="#666" />
          <Text style={styles.detailText}>{shipment.items} colis • {shipment.weight}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="car" size={16} color="#666" />
          <Text style={styles.detailText}>{shipment.vehicle}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.typeText} numberOfLines={1}>{shipment.type}</Text>
          {renderStars(shipment.rating)}
        </View>
        <Text style={styles.costText}>{shipment.cost}</Text>
      </View>

      {/* Détails dépliés */}
      {selectedShipment?.id === shipment.id && (
        <View style={styles.expandedDetails}>
          <View style={styles.driverInfo}>
            <MaterialCommunityIcons name="account" size={20} color="#666" />
            <Text style={styles.driverText}>Chauffeur: {shipment.driver}</Text>
          </View>

          {/* Timeline */}
          <Text style={styles.timelineTitle}>Déroulement du transport</Text>
          {shipment.timeline.map((step, index) => (
            <View key={index} style={styles.timelineStep}>
              <View style={styles.timelineDot} />
              {index < shipment.timeline.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTime}>{step.time}</Text>
                <Text style={styles.timelineStatus}>{step.status}</Text>
                <Text style={styles.timelineLocation}>{step.location}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.invoiceButton}>
            <MaterialIcons name="receipt" size={20} color="#fff" />
            <Text style={styles.invoiceButtonText}>Voir la facture</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#E31E24"]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.title} numberOfLines={1}>Historique des transports</Text>
              <Text style={styles.subtitle}>
                {stats.total} envois • {stats.totalCost}Dhs dépensés
              </Text>
            </View>
            <View style={styles.statsBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statsRating}>{stats.averageRating}/5</Text>
            </View>
          </View>

          {/* Filtres */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {["all", "express", "standard", "international", "fragile"].map((filterType) => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterButton,
                  filter === filterType && styles.filterButtonActive,
                ]}
                onPress={() => setFilter(filterType)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === filterType && styles.filterTextActive,
                  ]}
                >
                  {filterType === "all" && "Tous"}
                  {filterType === "express" && "Express"}
                  {filterType === "standard" && "Standard"}
                  {filterType === "international" && "International"}
                  {filterType === "fragile" && "Fragile"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Statistiques résumées */}
        <View style={styles.summaryStats}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color="#E31E24" />
            <Text style={styles.summaryNumber}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Envois total</Text>
          </View>
          <View style={styles.summaryCard}>
            <FontAwesome5 name="wallet" size={20} color="#00A651" />
            <Text style={styles.summaryNumber}>{stats.totalCost}Dhs</Text>
            <Text style={styles.summaryLabel}>Total dépensé</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="time" size={24} color="#0056A6" />
            <Text style={styles.summaryNumber}>94%</Text>
            <Text style={styles.summaryLabel}>À l'heure</Text>
          </View>
        </View>

        {/* Liste des envois */}
        <View style={styles.shipmentsList}>
          <Text style={styles.listTitle}>Envois récents</Text>
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#E31E24" style={{ marginTop: 20 }} />
          ) : filteredShipments.length > 0 ? (
            filteredShipments.map(renderShipmentCard)
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="history" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Aucun historique pour le moment</Text>
            </View>
          )}
        </View>

        {/* Note sur les données */}
        <View style={styles.noteContainer}>
          <MaterialIcons name="info-outline" size={20} color="#666" />
          <Text style={styles.noteText}>
            L'historique est conservé pendant 24 mois. Pour les données plus anciennes, contactez notre service client.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statsRating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9800",
    marginLeft: 5,
  },
  filterContainer: {
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#E31E24",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  summaryCard: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  shipmentsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
  shipmentInfo: {
    flex: 1,
  },
  shipmentId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  shipmentDate: {
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
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  arrow: {
    marginHorizontal: 10,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E31E24",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  costText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  expandedDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
  },
  driverText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    fontWeight: "500",
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginTop: 4,
  },
  timelineLine: {
    position: "absolute",
    top: 12,
    left: 5.5,
    width: 2,
    height: 40,
    backgroundColor: "#e0e0e0",
  },
  timelineContent: {
    marginLeft: 20,
    flex: 1,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  timelineStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  timelineLocation: {
    fontSize: 13,
    color: "#999",
  },
  invoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  invoiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
  }
});

export default ClientHistoryScreen;






