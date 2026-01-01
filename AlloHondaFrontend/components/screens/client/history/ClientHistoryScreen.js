import React, { useState } from "react";
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

const ClientHistoryScreen = () => {
  const [filter, setFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Données d'historique
  const shipmentsHistory = [
    {
      id: "HONDA-2024-0456",
      date: "15 Avril 2024",
      type: "Express 24h",
      from: "Paris CDG",
      to: "Lyon Part-Dieu",
      status: "livré",
      weight: "28 kg",
      items: 2,
      cost: "145€",
      driver: "Jean Renault",
      vehicle: "Honda Prologue électrique",
      rating: 5,
      timeline: [
        { time: "09:00", status: "Prise en charge", location: "Paris CDG" },
        { time: "11:30", status: "En transit", location: "A6" },
        { time: "15:45", status: "Arrivé au centre", location: "Lyon" },
        { time: "16:20", status: "Livré", location: "Part-Dieu" },
      ],
    },
    {
      id: "HONDA-2024-0455",
      date: "12 Avril 2024",
      type: "Standard",
      from: "Paris",
      to: "Bordeaux",
      status: "livré",
      weight: "42 kg",
      items: 3,
      cost: "120€",
      driver: "Marie Dubois",
      vehicle: "Honda CR-V Hybrid",
      rating: 4,
      timeline: [
        { time: "08:30", status: "Prise en charge", location: "Paris" },
        { time: "14:15", status: "En transit", location: "A10" },
        { time: "18:30", status: "Livré", location: "Bordeaux Centre" },
      ],
    },
    {
      id: "HONDA-2024-0454",
      date: "10 Avril 2024",
      type: "Express 24h",
      from: "Lyon",
      to: "Nice",
      status: "livré",
      weight: "15 kg",
      items: 1,
      cost: "95€",
      driver: "Thomas Martin",
      vehicle: "Honda Civic e:HEV",
      rating: 5,
      timeline: [
        { time: "10:00", status: "Prise en charge", location: "Lyon" },
        { time: "15:45", status: "Livré", location: "Nice" },
      ],
    },
    {
      id: "HONDA-2024-0453",
      date: "5 Avril 2024",
      type: "International",
      from: "Paris",
      to: "Genève",
      status: "livré",
      weight: "35 kg",
      items: 2,
      cost: "210€",
      driver: "Pierre Lambert",
      vehicle: "Honda HR-V",
      rating: 5,
      timeline: [
        { time: "07:45", status: "Prise en charge", location: "Paris" },
        { time: "12:30", status: "Douane", location: "Frontière" },
        { time: "14:15", status: "Livré", location: "Genève" },
      ],
    },
    {
      id: "HONDA-2024-0452",
      date: "2 Avril 2024",
      type: "Standard",
      from: "Marseille",
      to: "Toulouse",
      status: "livré",
      weight: "50 kg",
      items: 4,
      cost: "135€",
      driver: "Sophie Laurent",
      vehicle: "Honda CR-V Hybrid",
      rating: 4,
      timeline: [
        { time: "09:15", status: "Prise en charge", location: "Marseille" },
        { time: "16:45", status: "Livré", location: "Toulouse" },
      ],
    },
    {
      id: "HONDA-2024-0451",
      date: "28 Mars 2024",
      type: "Fragile",
      from: "Lille",
      to: "Strasbourg",
      status: "livré",
      weight: "18 kg",
      items: 1,
      cost: "165€",
      driver: "Paul Bernard",
      vehicle: "Honda Prologue électrique",
      rating: 5,
      timeline: [
        { time: "08:00", status: "Prise en charge", location: "Lille" },
        { time: "13:30", status: "En transit", location: "A26" },
        { time: "17:45", status: "Livré", location: "Strasbourg" },
      ],
    },
  ];

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
        <View>
          <Text style={styles.typeText}>{shipment.type}</Text>
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Historique des transports</Text>
              <Text style={styles.subtitle}>
                {stats.total} envois • {stats.totalCost}€ dépensés
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
            <FontAwesome5 name="euro-sign" size={20} color="#00A651" />
            <Text style={styles.summaryNumber}>{stats.totalCost}€</Text>
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
          {filteredShipments.map(renderShipmentCard)}
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
});

export default ClientHistoryScreen;






