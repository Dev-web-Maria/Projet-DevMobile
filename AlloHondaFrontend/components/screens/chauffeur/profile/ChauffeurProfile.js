import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");

const ChauffeurProfile = ({ user, navigation }) => {
  console.log("User data in ChauffeurProfile:", JSON.stringify(user, null, 2));
  
  const [notifications, setNotifications] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.userData?.statut === "Disponible");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Données du chauffeur - CORRECTION ICI
  const [driverData, setDriverData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    email: user?.email || "",
    phone: user?.telephone || "",
    address: user?.adresse || "",
    ville: user?.ville || "",
    driverId: `HONDA-DR-${(user?.userData?.idChauffeur || 0).toString().padStart(4, '0')}`,
    licenseNumber: user?.userData?.numeroPermis || "Non renseigné", // CORRIGÉ
    licenseExpiry: user?.permisExpiry || "Non renseigné",
    experience: "5 ans",
    rating: 4.8,
    totalMissions: 245,
    totalEarnings: "18,750€",
    hoursWorked: "1,560h",
    memberSince: "Depuis 2024",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  useEffect(() => {
    console.log("Driver Data Loaded:", driverData);
    console.log("User permis:", user?.userData?.numeroPermis);
    console.log("User statut:", user?.userData?.statut);
  }, [driverData, user]);

  // Véhicule assigné
  const vehicleData = {
    model: "Honda Prologue électrique",
    plateNumber: "AB-123-CD",
    year: "2023",
    color: "Noir",
    capacity: "450 kg",
    fuelType: "Électrique",
    lastService: "15/03/2024",
    nextService: "15/06/2024",
    insuranceExpiry: "30/09/2024",
  };

  // Options du menu
  const menuOptions = [
    {
      id: 1,
      icon: "card-account-details",
      title: "Documents professionnels",
      color: "#E31E24",
      description: "Permis, assurance, contrats",
    },
    {
      id: 2,
      icon: "car",
      title: "Véhicule assigné",
      color: "#0056A6",
      description: "Informations et entretien",
    },
    {
      id: 3,
      icon: "cash-multiple",
      title: "Compte bancaire",
      color: "#00A651",
      description: "Coordonnées et paiements",
    },
    {
      id: 4,
      icon: "shield-check",
      title: "Vérifications",
      color: "#FFB300",
      description: "Statut et validations",
    },
    {
      id: 5,
      icon: "certificate",
      title: "Certifications",
      color: "#9C27B0",
      description: "Formations et attestations",
    },
    {
      id: 6,
      icon: "file-document",
      title: "Documents légaux",
      color: "#607D8B",
      description: "Contrats et accords",
    },
    {
      id: 7,
      icon: "help-circle",
      title: "Support chauffeur",
      color: "#795548",
      description: "Aide et assistance",
    },
  ];

  const handleStatusChange = async (value) => {
    const newStatus = value ? "Disponible" : "Occupe";
    const chauffeurId = user?.userData?.idChauffeur; // CORRIGÉ

    if (!chauffeurId) {
      Alert.alert("Erreur", "ID chauffeur non trouvé");
      return;
    }

    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.put(
        `${baseUrl}/api/Chauffeur/UpdateStatus/${chauffeurId}`,
        JSON.stringify(newStatus),
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        }
      );

      if (response.data.success) {
        setIsAvailable(value);
        // Mettre à jour les données utilisateur si nécessaire
        Alert.alert("Succès", `Statut mis à jour: ${newStatus}`);
      }
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const preferences = [
    {
      id: 0,
      title: "Statut de disponibilité",
      description: isAvailable
        ? "Vous êtes visible pour de nouvelles missions"
        : "Vous ne recevez pas de nouvelles missions",
      value: isAvailable,
      onValueChange: handleStatusChange,
      isStatus: true,
    },
    {
      id: 1,
      title: "Notifications de missions",
      description: "Être alerté des nouvelles missions",
      value: notifications,
      onValueChange: () => setNotifications(!notifications),
    },
    {
      id: 2,
      title: "Acceptation automatique",
      description: "Accepter automatiquement les missions compatibles",
      value: autoAccept,
      onValueChange: () => setAutoAccept(!autoAccept),
    },
    {
      id: 3,
      title: "Partage de position",
      description: "Partager ma position avec AlloHonda",
      value: locationSharing,
      onValueChange: () => setLocationSharing(!locationSharing),
    },
  ];

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (editingField && editValue.trim()) {
      try {
        const chauffeurId = user?.userData?.idChauffeur; // CORRIGÉ
        if (!chauffeurId) {
          Alert.alert("Erreur", "ID chauffeur non trouvé");
          return;
        }

        const baseUrl = process.env.EXPO_PUBLIC_API_URL;

        // Mapper les noms des champs frontend vers les noms attendus par le backend
        const fieldMapping = {
          nom: "nom",
          prenom: "prenom",
          phone: "telephone",
          address: "adresse",
          ville: "ville",
          licenseNumber: "numeroPermis",
        };

        const updatePayload = {
          nom: driverData.nom,
          prenom: driverData.prenom,
          telephone: driverData.phone,
          adresse: driverData.address,
          ville: driverData.ville,
          numeroPermis: driverData.licenseNumber,
          [fieldMapping[editingField] || editingField]: editValue,
        };

        const response = await axios.put(
          `${baseUrl}/api/Chauffeur/UpdateProfile/${chauffeurId}`,
          updatePayload,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user?.token}`,
            },
          }
        );

        if (response.data.success) {
          const updatedInfo = response.data.user;
          setDriverData({
            ...driverData,
            nom: updatedInfo.nom || driverData.nom,
            prenom: updatedInfo.prenom || driverData.prenom,
            phone: updatedInfo.telephone || driverData.phone,
            address: updatedInfo.adresse || driverData.address,
            ville: updatedInfo.ville || driverData.ville,
            licenseNumber: updatedInfo.numeroPermis || driverData.licenseNumber,
          });

          setEditModalVisible(false);
          setEditingField(null);
          setEditValue("");
          Alert.alert("Succès", "Profil mis à jour avec succès");
        }
      } catch (error) {
        console.error("Erreur mise à jour profil:", error);
        Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
      }
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("@user_data");
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Erreur déconnexion:", error);
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        },
      },
    ]);
  };

  const handleVehicleDetails = () => {
    navigation.navigate("VehicleDetails", { vehicle: vehicleData });
  };

  const handleDocuments = () => {
    navigation.navigate("DriverDocuments");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Modal d'édition */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Modifier{" "}
              {editingField === "nom"
                ? "le nom"
                : editingField === "prenom"
                ? "le prénom"
                : editingField === "phone"
                ? "le téléphone"
                : editingField === "address"
                ? "l'adresse"
                : editingField === "ville"
                ? "la ville"
                : editingField === "licenseNumber"
                ? "le n° de permis"
                : "l'information"}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus={true}
              placeholder={`Entrez votre ${editingField}`}
              keyboardType={
                editingField === "email"
                  ? "email-address"
                  : editingField === "phone"
                  ? "phone-pad"
                  : "default"
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingField(null);
                  setEditValue("");
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEdit}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: driverData.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={18} color="#ffffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.driverName}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={styles.driverEmail}>{user?.email}</Text>

          <View style={styles.driverBadge}>
            <FontAwesome5 name="crown" size={14} color="#FFD700" />
            <Text style={styles.driverStatus}>
              {isAvailable ? "Disponible" : "Occupé"}
            </Text>
            <Text style={styles.memberSince}>Chauffeur AlloHonda</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{driverData.rating}</Text>
            <Text style={styles.statLabel}>Note</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="package-variant"
              size={24}
              color="#E31E24"
            />
            <Text style={styles.statNumber}>{driverData.totalMissions}</Text>
            <Text style={styles.statLabel}>Missions</Text>
          </View>

          <View style={styles.statCard}>
            <FontAwesome5 name="euro-sign" size={20} color="#00A651" />
            <Text style={styles.statNumber}>{driverData.totalEarnings}</Text>
            <Text style={styles.statLabel}>Gains</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#0056A6"
            />
            <Text style={styles.statNumber}>{driverData.hoursWorked}</Text>
            <Text style={styles.statLabel}>Heures</Text>
          </View>
        </View>

        {/* Véhicule assigné */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Véhicule assigné</Text>
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={handleVehicleDetails}
          >
            <View style={styles.vehicleHeader}>
              <MaterialCommunityIcons name="car" size={28} color="#da1b22ff" />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleModel}>{vehicleData.model}</Text>
                <Text style={styles.vehiclePlate}>{vehicleData.plateNumber}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </View>

            <View style={styles.vehicleDetails}>
              <View style={styles.vehicleDetail}>
                <Text style={styles.detailLabel}>Année</Text>
                <Text style={styles.detailValue}>{vehicleData.year}</Text>
              </View>
              <View style={styles.vehicleDetail}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{vehicleData.fuelType}</Text>
              </View>
              <View style={styles.vehicleDetail}>
                <Text style={styles.detailLabel}>Prochain entretien</Text>
                <Text style={styles.detailValue}>{vehicleData.nextService}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.infoCard}>
            {[
              {
                icon: "person",
                label: "Prénom",
                value: driverData.prenom,
                field: "prenom",
              },
              {
                icon: "person",
                label: "Nom",
                value: driverData.nom,
                field: "nom",
              },
              {
                icon: "phone",
                label: "Téléphone",
                value: driverData.phone,
                field: "phone",
              },
              {
                icon: "location-on",
                label: "Adresse",
                value: driverData.address,
                field: "address",
              },
              {
                icon: "location-city",
                label: "Ville",
                value: driverData.ville,
                field: "ville",
              },
              {
                icon: "badge",
                label: "N° de permis",
                value: driverData.licenseNumber,
                field: "licenseNumber",
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.infoItem}
                onPress={() => handleEditField(item.field, item.value)}
              >
                <View style={styles.infoLeft}>
                  <MaterialIcons name={item.icon} size={24} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
                <MaterialIcons name="edit" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu des options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon espace professionnel</Text>
          <View style={styles.menuCard}>
            {menuOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if (item.id === 1) handleDocuments();
                  else if (item.id === 2) handleVehicleDetails();
                  else navigation.navigate("Driver" + item.title.replace(/ /g, ""));
                }}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={item.color}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.preferencesCard}>
            {preferences.map((item) => (
              <View key={item.id} style={styles.preferenceItem}>
                <View style={styles.preferenceInfo}>
                  <Text style={styles.preferenceTitle}>{item.title}</Text>
                  <Text style={styles.preferenceDescription}>
                    {item.description}
                  </Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: "#e0e0e0", true: "#E31E24" }}
                  thumbColor={item.value ? "#fff" : "#f4f3f4"}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Vérifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut de vérification</Text>
          <View style={styles.verificationCard}>
            <View style={styles.verificationItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.verificationText}>Identité vérifiée</Text>
            </View>
            <View style={styles.verificationItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.verificationText}>Permis valide</Text>
            </View>
            <View style={styles.verificationItem}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.verificationText}>Assurance à jour</Text>
            </View>
            <View style={styles.verificationItem}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#FF9800"
              />
              <Text style={styles.verificationText}>Véhicule à vérifier</Text>
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("DriverSupport")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#E31E24" }]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("DriverTraining")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#0056A6" }]}
              >
                <MaterialCommunityIcons name="school" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Formation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("ReferDriver")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#00A651" }]}
              >
                <Ionicons name="person-add-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.quickActionText}>Parrainer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate("DriverSchedule")}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FFB300" }]}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#fff"
                />
              </View>
              <Text style={styles.quickActionText}>Planning</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions sensibles */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Zone de danger</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#666" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton}>
            <MaterialIcons name="delete-outline" size={20} color="#F44336" />
            <Text style={styles.deleteText}>Suspendre mon compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            ID Chauffeur: {driverData.driverId}
          </Text>
          <Text style={styles.copyrightText}>
            © 2024 AlloHonda Transport. Tous droits réservés.
          </Text>
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
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#5c75f4ff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  driverName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  driverEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  driverBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  driverStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF9800",
    marginLeft: 8,
    marginRight: 15,
  },
  memberSince: {
    fontSize: 14,
    color: "#FF9800",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  vehicleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vehicleModel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 16,
    color: "#666",
  },
  vehicleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  vehicleDetail: {
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
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
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: "#666",
  },
  preferencesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    color: "#666",
  },
  verificationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  verificationText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  dangerZone: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F44336",
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoutText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  deleteText: {
    fontSize: 16,
    color: "#F44336",
    marginLeft: 12,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
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
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#E31E24",
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ChauffeurProfile;