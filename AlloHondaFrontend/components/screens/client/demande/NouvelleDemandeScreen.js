import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const NouvelleDemandeScreen = ({ navigation, route }) => {
  // États pour les données de la demande
  const [Depart, setDepart] = useState("");
  const [Arrivee, setArrivee] = useState("");
  const [TypeMarchandise, setTypeMarchandise] = useState("PALETTES");
  const [DescriptionMarchandise, setDescriptionMarchandise] = useState("");
  const [Poids, setPoids] = useState("");
  const [Volume, setVolume] = useState("");
  const [DateDepart, setDateDepart] = useState(new Date());
  const [HeureDepart, setHeureDepart] = useState(new Date());
  const [Instructions, setInstructions] = useState("");
  const [PrixEstime, setPrixEstime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Récupérer l'utilisateur depuis les paramètres
  const user = route.params?.user || {};
  const clientId = user?.clientId || user?.idClient || user?.userdata?.idClient;

  useEffect(() => {
    console.log("User in NouvelleDemandeScreen:", user);
    console.log("Client ID:", clientId);
  }, [user]);

  // États pour les modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapType, setMapType] = useState("depart"); // "depart" ou "arrivee"

  // États pour la géolocalisation
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Types de marchandises
  const marchandiseTypes = [
    {
      key: "PALETTES",
      label: "Palettes",
      icon: "palette",
      color: "#E31E24",
      description: "Transport de palettes"
    },
    {
      key: "DOCUMENTS",
      label: "Documents",
      icon: "file-document",
      color: "#0056A6",
      description: "Courriers et dossiers"
    },
    {
      key: "FRAGILE",
      label: "Fragile",
      icon: "glass-fragile",
      color: "#FFB300",
      description: "Objets délicats"
    },
    {
      key: "ALIMENTAIRE",
      label: "Alimentaire",
      icon: "food",
      color: "#00A651",
      description: "Produits alimentaires"
    },
    {
      key: "MATERIEL",
      label: "Matériel",
      icon: "package-variant",
      color: "#9C27B0",
      description: "Équipements divers"
    },
    {
      key: "MEUBLES",
      label: "Meubles",
      icon: "sofa",
      color: "#607D8B",
      description: "Mobilier et décoration"
    },
  ];

  // Récupérer la localisation actuelle
  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "L'accès à la localisation est nécessaire pour remplir automatiquement l'adresse."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      // Reverse geocoding pour obtenir l'adresse
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const addr = address[0];
        const fullAddress = `${addr.street || ''} ${addr.name || ''}, ${addr.city || ''}`;
        setDepart(fullAddress.trim());
      }
    } catch (error) {
      console.error("Erreur de localisation:", error);
      Alert.alert("Erreur", "Impossible de récupérer votre position");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Calculer le prix estimé
  const calculatePrice = () => {
    if (!Poids || !Depart || !Arrivee) {
      setPrixEstime(0);
      return;
    }

    const poidsNum = parseFloat(Poids) || 0;
    const volumeNum = parseFloat(Volume) || 0;

    let basePrice = 50; // Prix de base

    // Ajouter prix par kg et m³
    const weightPrice = poidsNum * 2;
    const volumePrice = volumeNum * 30;

    const total = basePrice + weightPrice + volumePrice;
    setPrixEstime(total);
  };


  // Soumettre la demande
  const submitDemande = async () => {
    // Validation
    if (!Depart.trim()) {
      Alert.alert("Erreur", "Veuillez saisir l'adresse de départ");
      return;
    }

    if (!Arrivee.trim()) {
      Alert.alert("Erreur", "Veuillez saisir l'adresse d'arrivée");
      return;
    }

    if (!Poids || parseFloat(Poids) <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un poids valide");
      return;
    }

    if (!clientId) {
      Alert.alert("Erreur", "Client ID non trouvé. Veuillez vous reconnecter.");
      return;
    }

    try {
      setLoading(true);

      // Formater la date correctement pour votre modèle
      const dateDepartObj = new Date(DateDepart);
      const dateDepartFormatted = dateDepartObj.toISOString();

      const payload = {
        Depart,
        Arrivee,
        TypeMarchandise,
        DescriptionMarchandise: DescriptionMarchandise || `Transport ${TypeMarchandise.toLowerCase()}`,
        Poids: parseFloat(Poids),
        Volume: parseFloat(Volume) || 0,
        DateDepart: dateDepartFormatted, // Format ISO
        HeureDepart: HeureDepart.toTimeString().split(' ')[0].substring(0, 5), // Format HH:mm
        Instructions: Instructions || "",
        PrixEstime: Math.round(PrixEstime * 100) / 100, // Arrondir à 2 décimales
        ClientId: clientId, // Convertir en int
        Statut: "EN_ATTENTE", // Statut initial
        // ChauffeurId sera null par défaut
      };

      console.log("Payload de la demande:", payload);

      // Utiliser l'URL de votre API - ajustez selon votre environnement
      const Api_Base = process.env.EXPO_PUBLIC_API_URL;

      // Récupérer le token depuis user
      const token = user?.token || user?.Token;
      console.log("Token récupéré:", token);

      console.log("Envoi à l'API:", `${Api_Base}/api/DemandeTransports`);
      console.log("Token:", token ? "Présent" : "Manquant");

      const response = await fetch(
        `${Api_Base}/api/DemandeTransports`, // Notez le 's' à la fin
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify(payload)
        }
      );

      console.log("Réponse status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur backend détaillée:", errorText);

        try {
          const errorJson = JSON.parse(errorText);
          console.error("Erreur JSON:", errorJson);

          // Afficher les erreurs de validation
          if (errorJson.errors) {
            const errorMessages = Object.values(errorJson.errors).flat().join('\n');
            Alert.alert("Erreur de validation", errorMessages);
            return;
          }

          Alert.alert("Erreur", errorJson.message || "Impossible de créer la demande");
        } catch (e) {
          Alert.alert("Erreur", errorText || "Erreur serveur");
        }
        return;
      }

      const data = await response.json();
      console.log("Demande créée avec succès:", data);

      Alert.alert(
        "Succès",
        "Votre demande a été créée avec succès. Un chauffeur sera notifié.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("ClientTabs", { screen: "Dashboard", params: { user: { ...user, token } } })
          }
        ]
      );

    } catch (error) {
      console.error("Erreur réseau détaillée:", error);
      Alert.alert("Erreur", `Problème de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // Utiliser l'effet pour calculer le prix
  useEffect(() => {
    calculatePrice();
  }, [Depart, Arrivee, TypeMarchandise, Poids, Volume]);

  // Utiliser la géolocalisation au chargement
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Gestion des dates
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || DateDepart;
    setShowDatePicker(Platform.OS === 'ios');
    setDateDepart(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || HeureDepart;
    setShowTimePicker(Platform.OS === 'ios');
    setHeureDepart(currentTime);
  };

  // Formater la date
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formater l'heure
  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ouvrir le modal de carte
  const openMapFor = (type) => {
    setMapType(type);
    setShowMapModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Nouvelle Demande</Text>
            <Text style={styles.headerSubtitle}>AlloHonda Transport</Text>
          </View>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate("Help")}>
            <MaterialIcons name="help-outline" size={24} color="#E31E24" />
          </TouchableOpacity>
        </View>

        {/* Carte d'itinéraire */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="map-marker-path" size={24} color="#E31E24" />
            <Text style={styles.cardTitle}>Itinéraire</Text>
          </View>

          <View style={styles.routeContainer}>
            {/* Départ */}
            <View style={styles.routeSection}>
              <View style={styles.routeLabelContainer}>
                <View style={[styles.marker, styles.markerStart]} />
                <Text style={styles.routeLabel}>Départ</Text>
              </View>
              <View style={styles.inputWithIcon}>
                <TextInput
                  placeholder="Adresse de départ..."
                  placeholderTextColor="#999"
                  value={Depart}
                  onChangeText={setDepart}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => openMapFor("depart")}
                  style={styles.mapIconButton}>
                  <MaterialIcons name="my-location" size={20} color="#E31E24" />
                </TouchableOpacity>
              </View>
              {loadingLocation ? (
                <Text style={styles.locationLoading}>Localisation en cours...</Text>
              ) : (
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={styles.useLocationButton}>
                  <Ionicons name="location" size={16} color="#0056A6" />
                  <Text style={styles.useLocationText}>Utiliser ma position actuelle</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Séparateur */}
            <View style={styles.routeSeparator}>
              <View style={styles.separatorLine} />
              <MaterialIcons name="arrow-downward" size={20} color="#666" />
              <Text style={styles.separatorText}>Vers</Text>
            </View>

            {/* Arrivée */}
            <View style={styles.routeSection}>
              <View style={styles.routeLabelContainer}>
                <View style={[styles.marker, styles.markerEnd]} />
                <Text style={styles.routeLabel}>Destination</Text>
              </View>
              <View style={styles.inputWithIcon}>
                <TextInput
                  placeholder="Adresse d'arrivée..."
                  placeholderTextColor="#999"
                  value={Arrivee}
                  onChangeText={setArrivee}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => openMapFor("arrivee")}
                  style={styles.mapIconButton}>
                  <MaterialCommunityIcons name="map-search" size={20} color="#0056A6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Type de marchandise */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="package-variant" size={24} color="#0056A6" />
            <Text style={styles.cardTitle}>Type de marchandise</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.transportTypeContainer}>
            {marchandiseTypes.map((item) => {
              const active = TypeMarchandise === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setTypeMarchandise(item.key)}
                  style={[
                    styles.transportTypeCard,
                    active && { borderColor: item.color, backgroundColor: `${item.color}10` }
                  ]}>
                  <View style={[
                    styles.transportTypeIcon,
                    { backgroundColor: active ? item.color : "#f0f0f0" }
                  ]}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={active ? "#fff" : "#666"}
                    />
                  </View>
                  <Text style={[
                    styles.transportTypeLabel,
                    active && { color: item.color, fontWeight: "bold" }
                  ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.transportTypeDesc}>{item.description}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Description de la marchandise */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.inputLabel}>Description de la marchandise</Text>
            <TextInput
              placeholder="Ex: Palettes de livres, équipement électronique, meuble..."
              placeholderTextColor="#999"
              value={DescriptionMarchandise}
              onChangeText={setDescriptionMarchandise}
              multiline
              numberOfLines={3}
              style={styles.descriptionInput}
            />
          </View>
        </View>

        {/* Détails de la marchandise */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="scale" size={24} color="#00A651" />
            <Text style={styles.cardTitle}>Détails de la marchandise</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailInput}>
              <Text style={styles.inputLabel}>Poids (kg)</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  placeholder="0"
                  value={Poids}
                  onChangeText={setPoids}
                  keyboardType="numeric"
                  style={styles.numberInput}
                />
                <Text style={styles.inputUnit}>kg</Text>
              </View>
            </View>

            <View style={styles.detailInput}>
              <Text style={styles.inputLabel}>Volume (m³)</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  placeholder="0"
                  value={Volume}
                  onChangeText={setVolume}
                  keyboardType="numeric"
                  style={styles.numberInput}
                />
                <Text style={styles.inputUnit}>m³</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates et horaires */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#FFB300" />
            <Text style={styles.cardTitle}>Dates et horaires</Text>
          </View>

          <View style={styles.dateTimeSection}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateTimeContent}>
                <MaterialCommunityIcons name="calendar" size={22} color="#E31E24" />
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Date de départ</Text>
                  <Text style={styles.dateTimeValue}>{formatDate(DateDepart)}</Text>
                </View>
              </View>
              <MaterialIcons name="edit" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}>
              <View style={styles.dateTimeContent}>
                <MaterialCommunityIcons name="clock-outline" size={22} color="#0056A6" />
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Heure de départ</Text>
                  <Text style={styles.dateTimeValue}>{formatTime(HeureDepart)}</Text>
                </View>
              </View>
              <MaterialIcons name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notes" size={24} color="#9C27B0" />
            <Text style={styles.cardTitle}>Instructions spéciales</Text>
          </View>

          <TextInput
            placeholder="Code portail, contact sur place, fragilité particulière, accès difficile..."
            placeholderTextColor="#999"
            value={Instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          <Text style={styles.charCount}>{Instructions.length}/500 caractères</Text>
        </View>

        {/* Prix estimé et soumission */}
        <View style={[styles.card, styles.priceCard]}>
          <View style={styles.priceHeader}>
            <View>
              <Text style={styles.priceLabel}>Prix estimé</Text>
              <Text style={styles.priceValue}>{PrixEstime > 0 ? `${PrixEstime.toFixed(2)}€` : "--"}</Text>
              <Text style={styles.priceNote}>TVA incluse</Text>
            </View>
            <MaterialCommunityIcons name="shield-check" size={40} color="#00A651" />
          </View>

          <View style={styles.guaranteeContainer}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#FFB300" />
            <Text style={styles.guaranteeText}>
              Livraison garantie • Suivi en temps réel • Assurance incluse
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!Depart || !Arrivee || !Poids) && styles.submitButtonDisabled]}
            onPress={submitDemande}
            disabled={!Depart || !Arrivee || !Poids || loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Créer la demande</Text>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            En soumettant, vous acceptez nos{" "}
            <Text style={styles.termsLink}>Conditions Générales</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Modal de carte */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}>
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              style={styles.mapBackButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>
              Sélectionner {mapType === "depart" ? "le départ" : "l'arrivée"}
            </Text>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: currentLocation?.latitude || 48.8566,
              longitude: currentLocation?.longitude || 2.3522,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}>
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                title="Votre position"
              />
            )}
          </MapView>

          <View style={styles.mapFooter}>
            <TextInput
              placeholder={`Rechercher une adresse...`}
              style={styles.mapSearch}
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={() => {
                // Ici, vous implémenteriez la sélection d'adresse sur la carte
                setShowMapModal(false);
              }}>
              <Text style={styles.confirmLocationText}>Confirmer cette adresse</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={DateDepart}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={HeureDepart}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E31E24",
    marginTop: 2,
  },
  helpButton: {
    padding: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  routeContainer: {
    marginTop: 10,
  },
  routeSection: {
    marginBottom: 15,
  },
  routeLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  markerStart: {
    backgroundColor: "#E31E24",
  },
  markerEnd: {
    backgroundColor: "#0056A6",
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
  },
  mapIconButton: {
    position: "absolute",
    right: 10,
    padding: 8,
  },
  useLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingLeft: 5,
  },
  useLocationText: {
    fontSize: 14,
    color: "#0056A6",
    marginLeft: 6,
    fontWeight: "500",
  },
  locationLoading: {
    fontSize: 12,
    color: "#FFB300",
    marginTop: 8,
    fontStyle: "italic",
  },
  routeSeparator: {
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    width: 2,
    height: 20,
    backgroundColor: "#e0e0e0",
    marginBottom: 5,
  },
  separatorText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  transportTypeContainer: {
    flexDirection: "row",
  },
  transportTypeCard: {
    width: 140,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  transportTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  transportTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  transportTypeDesc: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionInput: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
    minHeight: 80,
    textAlignVertical: "top",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailInput: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
  },
  numberInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingVertical: 12,
  },
  inputUnit: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 8,
  },
  dateTimeSection: {
    marginTop: 10,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateTimeText: {
    marginLeft: 15,
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 8,
  },
  priceCard: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    marginBottom: 30,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#E31E24",
  },
  priceNote: {
    fontSize: 12,
    color: "#666",
  },
  guaranteeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  guaranteeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E31E24",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  terms: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  termsLink: {
    color: "#E31E24",
    fontWeight: "500",
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  mapBackButton: {
    marginRight: 15,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  mapSearch: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f8f9fa",
    marginBottom: 15,
  },
  confirmLocationButton: {
    backgroundColor: "#E31E24",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmLocationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NouvelleDemandeScreen;