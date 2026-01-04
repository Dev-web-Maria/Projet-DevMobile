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
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ChauffeurDemandeVisualisation = ({ user, navigation }) => {
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const chauffeurId = user?.chauffeurId || user?.idChauffeur || user?.UserData?.idChauffeur;
  const token = user?.token || user?.Token;
  const Api_Base = process.env.EXPO_PUBLIC_API_URL;

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = `${Api_Base}/api/DemandeTransports`;
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.demandes);
      } else {
        setError("Impossible de charger les demandes");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMission = async (demandeId) => {
    try {
      setIsProcessing(true);
      const url = `${Api_Base}/api/DemandeTransports/${demandeId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          statut: "ACCEPTEE",
          chauffeurId: chauffeurId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("Mission acceptée avec succès !");
        fetchRequests(); // Recharger la liste
        setModalVisible(false);
      } else {
        alert("Erreur lors de l'acceptation de la mission");
      }
    } catch (err) {
      console.error("Error accepting mission:", err);
      alert("Erreur de connexion au serveur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtrage des demandes
  const getFilteredRequests = () => {
    let filtered = requests;

    switch (filter) {
      case "available":
        filtered = requests.filter(r => r.statut === "EN_ATTENTE" && !r.chauffeurId);
        break;
      case "pending":
        filtered = []; // Placeholder
        break;
      case "accepted":
        filtered = requests.filter(r => r.chauffeurId === chauffeurId);
        break;
    }

    return filtered;
  };

  const getStats = () => {
    return {
      available: requests.filter(r => r.statut === "EN_ATTENTE" && !r.chauffeurId).length,
      pending: 0,
      accepted: requests.filter(r => r.chauffeurId === chauffeurId).length,
      total: requests.length
    };
  };

  const stats = getStats();

  const renderRequestCard = (request) => {
    const isAvailable = request.statut === "EN_ATTENTE" && !request.chauffeurId;
    const isAccepted = request.chauffeurId === chauffeurId;

    return (
      <TouchableOpacity
        key={request.idDemande}
        style={styles.requestCard}
        onPress={() => {
          setSelectedRequest(request);
          setModalVisible(true);
        }}
      >
        <View style={styles.requestHeader}>
          <View>
            <Text style={styles.requestId}>#DEM-{request.idDemande}</Text>
            <Text style={styles.requestType}>{request.typeMarchandise}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                isAvailable ? '#4CAF50' :
                  isAccepted ? '#2196F3' :
                    '#FF9800'
            }
          ]}>
            <Text style={styles.statusText}>
              {request.statut.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.location}>
            <MaterialIcons name="location-on" size={18} color="#E31E24" />
            <View>
              <Text style={styles.locationLabel}>Départ</Text>
              <Text style={styles.locationText} numberOfLines={1}>{request.depart}</Text>
            </View>
          </View>

          <MaterialIcons name="arrow-forward" size={20} color="#666" style={styles.arrow} />

          <View style={styles.location}>
            <MaterialIcons name="location-on" size={18} color="#0056A6" />
            <View>
              <Text style={styles.locationLabel}>Arrivée</Text>
              <Text style={styles.locationText} numberOfLines={1}>{request.arrivee}</Text>
            </View>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>{new Date(request.dateDepart).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{request.heureDepart}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="scale" size={16} color="#666" />
              <Text style={styles.detailText}>{request.poids} kg</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="package-variant" size={16} color="#666" />
              <Text style={styles.detailText}>{request.volume} m³</Text>
            </View>
          </View>

          {request.client && (
            <View style={styles.customerInfo}>
              <MaterialCommunityIcons name="account" size={16} color="#666" />
              <Text style={styles.customerText}>Client: {request.client.prenom} {request.client.nom}</Text>
            </View>
          )}
        </View>

        <View style={styles.requestFooter}>
          <View>
            <Text style={styles.priceLabel}>Prix proposé</Text>
            <Text style={styles.priceText}>{request.prixEstime}€</Text>
          </View>

          {isAvailable && (
            <TouchableOpacity
              style={styles.bidButton}
              onPress={() => {
                setSelectedRequest(request);
                setModalVisible(true);
              }}
            >
              <Text style={styles.bidButtonText}>Détails</Text>
            </TouchableOpacity>
          )}

          {isAccepted && (
            <View style={styles.acceptedInfo}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.acceptedText}>Ma mission</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Modal pour détails et acceptation */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails Mission</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Marchandise</Text>
                  <Text style={styles.infoValue}>{selectedRequest.typeMarchandise}</Text>
                  <Text style={styles.infoDesc}>{selectedRequest.descriptionMarchandise}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Trajet</Text>
                  <View style={styles.modalRouteItem}>
                    <MaterialIcons name="location-on" size={18} color="#E31E24" />
                    <Text style={styles.modalRouteText}>{selectedRequest.depart}</Text>
                  </View>
                  <View style={styles.modalRouteItem}>
                    <MaterialIcons name="location-on" size={18} color="#0056A6" />
                    <Text style={styles.modalRouteText}>{selectedRequest.arrivee}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="scale" size={18} color="#666" />
                    <Text style={styles.detailText}>{selectedRequest.poids} kg</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="package-variant" size={18} color="#666" />
                    <Text style={styles.detailText}>{selectedRequest.volume} m³</Text>
                  </View>
                </View>

                {selectedRequest.instructions && (
                  <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Instructions</Text>
                    <Text style={styles.infoDesc}>{selectedRequest.instructions}</Text>
                  </View>
                )}

                <View style={styles.priceHighlight}>
                  <Text style={styles.priceLabel}>Rémunération prévue</Text>
                  <Text style={styles.priceValueLarge}>{selectedRequest.prixEstime}€</Text>
                </View>

                {selectedRequest.statut === "EN_ATTENTE" && !selectedRequest.chauffeurId && (
                  <TouchableOpacity
                    style={[styles.acceptButton, isProcessing && styles.disabledButton]}
                    onPress={() => handleAcceptMission(selectedRequest.idDemande)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.acceptButtonText}>Accepter la mission</Text>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Missions</Text>
            <Text style={styles.subtitle}>Consultez et acceptez des trajets</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchRequests}
          >
            <MaterialIcons name="refresh" size={24} color="#E31E24" />
          </TouchableOpacity>
        </View>

        {/* Filtres */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {[
            { id: "all", label: "Toutes" },
            { id: "available", label: "Disponibles" },
            { id: "accepted", label: "Mes missions" }
          ].map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterTab,
                filter === f.id && styles.filterTabActive,
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.id && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
              {filter === f.id && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.available}</Text>
            <Text style={styles.statLabel}>Dispos</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statDivider} />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.accepted}</Text>
            <Text style={styles.statLabel}>Les miennes</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statDivider} />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {loading && !requests.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
          <Text style={styles.loadingText}>Recherche de missions...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchRequests} colors={["#E31E24"]} />
          }
        >
          <View style={styles.requestsList}>
            {getFilteredRequests().length > 0 ? (
              getFilteredRequests().map(renderRequestCard)
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="car-off" size={80} color="#e0e0e0" />
                <Text style={styles.emptyStateTitle}>Aucune demande trouvée</Text>
                <Text style={styles.emptyStateText}>
                  {filter === "available"
                    ? "Il n'y a pas de nouvelles missions pour le moment."
                    : filter === "accepted"
                      ? "Vous n'avez pas encore accepté de missions."
                      : "La liste est vide."}
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
                  <Text style={styles.retryButtonText}>Actualiser</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Conseils rapides pour chauffeur */}
          <View style={styles.chauffeurTips}>
            <View style={styles.tipBox}>
              <Ionicons name="flash" size={20} color="#FF9800" />
              <Text style={styles.tipBoxText}>Soyez réactif pour obtenir les meilleures missions.</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#212121",
  },
  subtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: "#fbe9e9",
    padding: 10,
    borderRadius: 12,
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: "#E31E24",
  },
  filterText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E31E24",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#212121",
  },
  statLabel: {
    fontSize: 11,
    color: "#9e9e9e",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#757575",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  requestsList: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  requestId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9e9e9e",
    letterSpacing: 0.5,
  },
  requestType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f9f9f9",
  },
  location: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: "#bdbdbd",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
  },
  arrow: {
    marginHorizontal: 10,
    opacity: 0.3,
  },
  requestDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: "#616161",
    marginLeft: 8,
    fontWeight: "500",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
  },
  customerText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 8,
    fontWeight: "500",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 12,
    color: "#9e9e9e",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#E31E24",
  },
  bidButton: {
    backgroundColor: "#212121",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bidButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  acceptedInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  acceptedText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2e7d32",
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#424242",
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9e9e9e",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#212121",
    fontWeight: "700",
  },
  chauffeurTips: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef8f0",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#fff3e0",
  },
  tipBoxText: {
    flex: 1,
    fontSize: 13,
    color: "#e65100",
    marginLeft: 10,
    fontWeight: "500",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
  },
  modalBody: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#bdbdbd",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  },
  infoDesc: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
    lineHeight: 20,
  },
  modalRouteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
  },
  modalRouteText: {
    fontSize: 14,
    color: "#424242",
    marginLeft: 10,
    fontWeight: "600",
    flex: 1,
  },
  priceHighlight: {
    backgroundColor: "#fbe9e9",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 20,
  },
  priceValueLarge: {
    fontSize: 32,
    fontWeight: "900",
    color: "#E31E24",
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: "#E31E24",
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E31E24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 30,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  disabledButton: {
    backgroundColor: "#bdbdbd",
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChauffeurDemandeVisualisation;