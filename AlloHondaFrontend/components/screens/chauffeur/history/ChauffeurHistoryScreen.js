import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ChauffeurHistoryScreen = ({ user, navigation }) => {
  const [filter, setFilter] = useState("all");
  const [selectedMission, setSelectedMission] = useState(null);
  const [statsFilter, setStatsFilter] = useState("week"); // week, month, year
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  // Historique des missions
  const missionsHistory = [
    {
      id: "MISSION-2024-0456",
      date: "15 Avril 2024",
      type: "Express 24h",
      from: "Paris CDG",
      to: "Lyon Part-Dieu",
      status: "complétée",
      distance: "450 km",
      duration: "6h 30min",
      earnings: "145€",
      rating: 5,
      customer: "Sophie Martin",
      customerRating: 4.8,
      vehicle: "Honda Prologue électrique",
      items: 2,
      weight: "28 kg",
      fuelCost: "18€",
      tollCost: "24€",
      netEarnings: "103€",
      invoiceNumber: "FAC-2024-0456",
    },
    {
      id: "MISSION-2024-0455",
      date: "12 Avril 2024",
      type: "Standard",
      from: "Paris",
      to: "Bordeaux",
      status: "complétée",
      distance: "580 km",
      duration: "5h 45min",
      earnings: "120€",
      rating: 4,
      customer: "Thomas Bernard",
      customerRating: 4.5,
      vehicle: "Honda CR-V Hybrid",
      items: 3,
      weight: "42 kg",
      fuelCost: "25€",
      tollCost: "32€",
      netEarnings: "63€",
      invoiceNumber: "FAC-2024-0455",
    },
    {
      id: "MISSION-2024-0454",
      date: "10 Avril 2024",
      type: "Express 24h",
      from: "Lyon",
      to: "Nice",
      status: "complétée",
      distance: "310 km",
      duration: "4h 15min",
      earnings: "95€",
      rating: 5,
      customer: "Marie Laurent",
      customerRating: 4.9,
      vehicle: "Honda Civic e:HEV",
      items: 1,
      weight: "15 kg",
      fuelCost: "12€",
      tollCost: "18€",
      netEarnings: "65€",
      invoiceNumber: "FAC-2024-0454",
    },
    {
      id: "MISSION-2024-0453",
      date: "5 Avril 2024",
      type: "International",
      from: "Paris",
      to: "Genève",
      status: "complétée",
      distance: "520 km",
      duration: "6h 15min",
      earnings: "210€",
      rating: 5,
      customer: "Pierre Dubois",
      customerRating: 4.7,
      vehicle: "Honda HR-V",
      items: 2,
      weight: "35 kg",
      fuelCost: "28€",
      tollCost: "45€",
      netEarnings: "137€",
      invoiceNumber: "FAC-2024-0453",
    },
    {
      id: "MISSION-2024-0452",
      date: "2 Avril 2024",
      type: "Standard",
      from: "Marseille",
      to: "Toulouse",
      status: "complétée",
      distance: "400 km",
      duration: "4h 30min",
      earnings: "135€",
      rating: 4,
      customer: "Sophie Martin",
      customerRating: 4.8,
      vehicle: "Honda CR-V Hybrid",
      items: 4,
      weight: "50 kg",
      fuelCost: "22€",
      tollCost: "28€",
      netEarnings: "85€",
      invoiceNumber: "FAC-2024-0452",
    },
    {
      id: "MISSION-2024-0451",
      date: "28 Mars 2024",
      type: "Fragile",
      from: "Lille",
      to: "Strasbourg",
      status: "complétée",
      distance: "480 km",
      duration: "5h 45min",
      earnings: "165€",
      rating: 5,
      customer: "Paul Bernard",
      customerRating: 4.6,
      vehicle: "Honda Prologue électrique",
      items: 1,
      weight: "18 kg",
      fuelCost: "20€",
      tollCost: "35€",
      netEarnings: "110€",
      invoiceNumber: "FAC-2024-0451",
    },
  ];

  // Statistiques
  const statsData = {
    week: {
      totalMissions: 12,
      totalEarnings: "1,450€",
      totalDistance: "2,850 km",
      averageRating: 4.7,
    },
    month: {
      totalMissions: 28,
      totalEarnings: "3,450€",
      totalDistance: "6,240 km",
      averageRating: 4.8,
    },
    year: {
      totalMissions: 156,
      totalEarnings: "18,750€",
      totalDistance: "35,200 km",
      averageRating: 4.8,
    },
  };

  // Performance mensuelle
  const monthlyPerformance = [
    { month: "Jan", missions: 14, earnings: "1,850€" },
    { month: "Fév", missions: 12, earnings: "1,650€" },
    { month: "Mar", missions: 16, earnings: "2,100€" },
    { month: "Avr", missions: 11, earnings: "1,450€" },
    { month: "Mai", missions: 0, earnings: "0€" },
    { month: "Juin", missions: 0, earnings: "0€" },
  ];

  // Filtrer les missions
  const filteredMissions = filter === "all"
    ? missionsHistory
    : missionsHistory.filter(mission => mission.type.toLowerCase().includes(filter));

  const renderStars = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderMissionCard = (mission) => (
    <TouchableOpacity
      key={mission.id}
      style={styles.missionCard}
      onPress={() => setSelectedMission(selectedMission?.id === mission.id ? null : mission)}
    >
      <View style={styles.missionHeader}>
        <View style={styles.missionInfo}>
          <Text style={styles.missionId}>{mission.id}</Text>
          <Text style={styles.missionDate}>{mission.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: "#4CAF50" }]}>
          <Text style={styles.statusText}>{mission.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.location}>
          <MaterialIcons name="location-on" size={16} color="#E31E24" />
          <Text style={styles.locationText}>{mission.from}</Text>
        </View>
        <MaterialIcons name="arrow-forward" size={18} color="#666" style={styles.arrow} />
        <View style={styles.location}>
          <MaterialIcons name="location-on" size={16} color="#0056A6" />
          <Text style={styles.locationText}>{mission.to}</Text>
        </View>
      </View>

      <View style={styles.missionDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={14} color="#666" />
            <Text style={styles.detailText}>{mission.distance}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{mission.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="car" size={14} color="#666" />
            <Text style={styles.detailText}>{mission.vehicle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.missionFooter}>
        <View>
          <Text style={styles.customerName}>{mission.customer}</Text>
          {renderStars(mission.rating)}
        </View>
        <Text style={styles.earningsText}>{mission.earnings}</Text>
      </View>

      {/* Détails dépliés */}
      {selectedMission?.id === mission.id && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Détails de la mission</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{mission.type}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Colis</Text>
                <Text style={styles.detailValue}>{mission.items} • {mission.weight}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Coûts et gains</Text>
            <View style={styles.costsContainer}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Gains bruts</Text>
                <Text style={styles.costValue}>{mission.earnings}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Carburant</Text>
                <Text style={[styles.costValue, styles.costNegative]}>-{mission.fuelCost}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Péages</Text>
                <Text style={[styles.costValue, styles.costNegative]}>-{mission.tollCost}</Text>
              </View>
              <View style={[styles.costRow, styles.netEarningsRow]}>
                <Text style={[styles.costLabel, styles.netEarningsLabel]}>Gains nets</Text>
                <Text style={[styles.costValue, styles.netEarningsValue]}>{mission.netEarnings}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.invoiceButton}
              onPress={() => setInvoiceModalVisible(true)}
            >
              <MaterialIcons name="receipt" size={18} color="#fff" />
              <Text style={styles.invoiceButtonText}>Voir la facture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <MaterialIcons name="flag" size={18} color="#666" />
              <Text style={styles.reportButtonText}>Signaler un problème</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Modal Facture */}
      <Modal
        visible={invoiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Facture {selectedMission?.invoiceNumber}</Text>
              <TouchableOpacity onPress={() => setInvoiceModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedMission && (
              <ScrollView style={styles.invoiceScroll}>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceLogo}>
                    <FontAwesome5 name="shipping-fast" size={24} color="#E31E24" />
                    <Text style={styles.invoiceCompany}>AlloHonda Transport</Text>
                  </View>
                  <Text style={styles.invoiceDate}>Émise le {selectedMission.date}</Text>
                </View>

                <View style={styles.invoiceDetails}>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>N° Mission:</Text>
                    <Text style={styles.invoiceValue}>{selectedMission.id}</Text>
                  </View>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Chauffeur:</Text>
                    <Text style={styles.invoiceValue}>Jean Renault</Text>
                  </View>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Client:</Text>
                    <Text style={styles.invoiceValue}>{selectedMission.customer}</Text>
                  </View>
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceLabel}>Trajet:</Text>
                    <Text style={styles.invoiceValue}>{selectedMission.from} → {selectedMission.to}</Text>
                  </View>
                </View>

                <View style={styles.invoiceTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Description</Text>
                    <Text style={styles.tableHeaderText}>Montant</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Transport {selectedMission.type}</Text>
                    <Text style={styles.tableCell}>{selectedMission.earnings}</Text>
                  </View>

                  <View style={[styles.tableRow, styles.tableRowAlt]}>
                    <Text style={styles.tableCell}>Carburant</Text>
                    <Text style={[styles.tableCell, styles.costCell]}>-{selectedMission.fuelCost}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>Péages</Text>
                    <Text style={[styles.tableCell, styles.costCell]}>-{selectedMission.tollCost}</Text>
                  </View>

                  <View style={[styles.tableRow, styles.tableTotal]}>
                    <Text style={[styles.tableCell, styles.totalLabel]}>Total net</Text>
                    <Text style={[styles.tableCell, styles.totalValue]}>{selectedMission.netEarnings}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.downloadButton}>
                  <MaterialIcons name="download" size={20} color="#fff" />
                  <Text style={styles.downloadButtonText}>Télécharger la facture</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Historique des missions</Text>
              <Text style={styles.subtitle}>
                {missionsHistory.length} missions complétées
              </Text>
            </View>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => navigation.navigate("ExportHistory")}
            >
              <MaterialIcons name="file-download" size={24} color="#E31E24" />
            </TouchableOpacity>
          </View>

          {/* Filtres de temps */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeFilterContainer}>
            {["week", "month", "year"].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeFilter,
                  statsFilter === time && styles.timeFilterActive,
                ]}
                onPress={() => setStatsFilter(time)}
              >
                <Text
                  style={[
                    styles.timeFilterText,
                    statsFilter === time && styles.timeFilterTextActive,
                  ]}
                >
                  {time === "week" && "Cette semaine"}
                  {time === "month" && "Ce mois"}
                  {time === "year" && "Cette année"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="package-variant" size={28} color="#E31E24" />
              <Text style={styles.statNumber}>{statsData[statsFilter].totalMissions}</Text>
              <Text style={styles.statLabel}>Missions</Text>
            </View>

            <View style={styles.statCard}>
              <FontAwesome5 name="euro-sign" size={24} color="#00A651" />
              <Text style={styles.statNumber}>{statsData[statsFilter].totalEarnings}</Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="map-marker-distance" size={28} color="#0056A6" />
              <Text style={styles.statNumber}>{statsData[statsFilter].totalDistance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="star" size={28} color="#FFB300" />
              <Text style={styles.statNumber}>{statsData[statsFilter].averageRating}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        </View>

        {/* Performance mensuelle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance mensuelle</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.performanceChart}>
              {monthlyPerformance.map((month) => (
                <View key={month.month} style={styles.monthColumn}>
                  <View style={styles.monthStats}>
                    <Text style={styles.monthMissions}>{month.missions}</Text>
                    <Text style={styles.monthEarnings}>{month.earnings}</Text>
                  </View>
                  <View style={[
                    styles.monthBar,
                    {
                      height: month.missions > 0 ? (month.missions / 20) * 80 : 10,
                      backgroundColor: month.missions > 0 ? '#E31E24' : '#e0e0e0'
                    }
                  ]} />
                  <Text style={styles.monthLabel}>{month.month}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filtres de mission */}
        <View style={styles.section}>
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
                  {filterType === "all" && "Toutes"}
                  {filterType === "express" && "Express"}
                  {filterType === "standard" && "Standard"}
                  {filterType === "international" && "International"}
                  {filterType === "fragile" && "Fragile"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des missions */}
        <View style={styles.missionsList}>
          {filteredMissions.length > 0 ? (
            filteredMissions.map(renderMissionCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-clock-outline" size={80} color="#e0e0e0" />
              <Text style={styles.emptyStateTitle}>Aucune mission trouvée</Text>
              <Text style={styles.emptyStateText}>
                Aucune mission ne correspond à vos filtres
              </Text>
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => setFilter("all")}
              >
                <Text style={styles.resetFilterText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Résumé financier */}
        <View style={styles.section}>
          <View style={styles.financialSummary}>
            <Text style={styles.financialTitle}>Résumé financier</Text>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Gains bruts totaux</Text>
              <Text style={styles.financialValue}>4,870€</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Frais totaux</Text>
              <Text style={[styles.financialValue, styles.expenseValue]}>- 1,240€</Text>
            </View>
            <View style={[styles.financialRow, styles.netRow]}>
              <Text style={[styles.financialLabel, styles.netLabel]}>Gains nets totaux</Text>
              <Text style={[styles.financialValue, styles.netValue]}>3,630€</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
  exportButton: {
    padding: 8,
  },
  timeFilterContainer: {
    marginBottom: 20,
  },
  timeFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  timeFilterActive: {
    backgroundColor: "#E31E24",
  },
  timeFilterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  timeFilterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    color: "#E31E24",
    fontSize: 14,
    fontWeight: "600",
  },
  performanceChart: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthColumn: {
    alignItems: "center",
    marginRight: 25,
  },
  monthStats: {
    alignItems: "center",
    marginBottom: 10,
  },
  monthMissions: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  monthEarnings: {
    fontSize: 12,
    color: "#666",
  },
  monthBar: {
    width: 30,
    borderRadius: 6,
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  filterContainer: {
    marginBottom: 15,
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
  missionsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  missionCard: {
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
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  missionInfo: {
    flex: 1,
  },
  missionId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  missionDate: {
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
    marginBottom: 15,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  arrow: {
    marginHorizontal: 10,
  },
  missionDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  missionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#FF9800",
    marginLeft: 4,
    fontWeight: "600",
  },
  earningsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  expandedDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  costsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  netEarningsRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#e0e0e0",
  },
  costLabel: {
    fontSize: 14,
    color: "#666",
  },
  netEarningsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  costValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  costNegative: {
    color: "#F44336",
  },
  netEarningsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00A651",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 15,
  },
  invoiceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
  },
  invoiceButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  reportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 10,
  },
  reportButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  resetFilterButton: {
    backgroundColor: "#E31E24",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetFilterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  financialSummary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  financialTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  netRow: {
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#e0e0e0",
  },
  financialLabel: {
    fontSize: 16,
    color: "#666",
  },
  netLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  expenseValue: {
    color: "#F44336",
  },
  netValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00A651",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  invoiceScroll: {
    padding: 20,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  invoiceLogo: {
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceCompany: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  invoiceDate: {
    fontSize: 14,
    color: "#666",
  },
  invoiceDetails: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  invoiceLabel: {
    fontSize: 14,
    color: "#666",
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  invoiceTable: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableRowAlt: {
    backgroundColor: "#f8f9fa",
  },
  tableTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: "#e0e0e0",
    marginTop: 10,
  },
  tableCell: {
    fontSize: 14,
    color: "#333",
  },
  costCell: {
    color: "#F44336",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00A651",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 14,
    borderRadius: 12,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default ChauffeurHistoryScreen;