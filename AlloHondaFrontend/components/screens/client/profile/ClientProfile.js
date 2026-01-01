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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";

const ClientProfile = ({ user, navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Données du client
  const [clientData, setClientData] = useState(user);

  useEffect(() => {
    console.log("Client Data Loaded:", user);
  }, []);

  // Options du menu avec navigation
  const menuOptions = [
    {
      id: 1,
      icon: "person-outline",
      title: "Informations personnelles",
      color: "#E31E24",
      description: "Modifier vos coordonnées",
      onPress: () => console.log("Infos perso"),
    },
    {
      id: 2,
      icon: "shield-checkmark-outline",
      title: "Sécurité",
      color: "#0056A6",
      description: "Mot de passe et authentification",
      onPress: () => navigation.navigate("Security"),
    },
    {
      id: 3,
      icon: "card-outline",
      title: "Moyens de paiement",
      color: "#00A651",
      description: "Cartes bancaires enregistrées",
      onPress: () => navigation.navigate("PaymentMethods"),
    },
    {
      id: 4,
      icon: "document-text-outline",
      title: "Documents",
      color: "#FFB300",
      description: "Factures et reçus",
      onPress: () => navigation.navigate("Documents"),
    },
    {
      id: 5,
      icon: "star-outline",
      title: "Programme de fidélité",
      color: "#9C27B0",
      description: "Points et avantages",
      onPress: () => navigation.navigate("Loyalty"),
    },
    {
      id: 6,
      icon: "help-circle-outline",
      title: "Centre d'aide",
      color: "#607D8B",
      description: "FAQ et support",
      onPress: () => navigation.navigate("HelpCenter"),
    },
    {
      id: 7,
      icon: "settings-outline",
      title: "Préférences",
      color: "#795548",
      description: "Paramètres de l'application",
      onPress: () => navigation.navigate("Preferences"),
    },
  ];

  const preferences = [
    {
      id: 1,
      title: "Notifications push",
      description: "Recevoir les notifications en temps réel",
      value: notifications,
      onValueChange: () => setNotifications(!notifications),
    },
    {
      id: 2,
      title: "Emails promotionnels",
      description: "Recevoir les offres spéciales Honda",
      value: promotionalEmails,
      onValueChange: () => setPromotionalEmails(!promotionalEmails),
    },
  ];

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (editingField && editValue.trim()) {
      setClientData({
        ...clientData,
        [editingField]: editValue,
      });
      setEditModalVisible(false);
      setEditingField(null);
      setEditValue("");
      Alert.alert("Succès", "Modifications enregistrées avec succès");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              // Supprimer les données de session
              await AsyncStorage.removeItem('@user_data');

              // Réinitialise la navigation vers l'écran de connexion
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              // On redirige quand même pour ne pas bloquer l'utilisateur
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Suppression du compte",
      "Cette action est irréversible. Toutes vos données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            // Logique de suppression du compte
            console.log("Compte supprimé");
            // Après suppression, rediriger vers l'accueil
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        },
      ]
    );
  };

  const handleContactSupport = () => {
    navigation.navigate('Support');
  };

  const handleReferFriend = () => {
    navigation.navigate('ReferFriend');
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
              Modifier {editingField === 'name' ? 'le nom' :
                editingField === 'email' ? 'l\'email' :
                  editingField === 'phone' ? 'le téléphone' : 'l\'adresse'}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              autoFocus={true}
              placeholder={`Entrez votre ${editingField}`}
              keyboardType={
                editingField === 'email' ? 'email-address' :
                  editingField === 'phone' ? 'phone-pad' : 'default'
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: clientData.avatar }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{clientData.nom}</Text>
          <Text style={styles.userEmail}>{clientData.email}</Text>

          <View style={styles.membershipBadge}>
            <FontAwesome5 name="crown" size={14} color="#FFD700" />
            <Text style={styles.membershipText}>{clientData.membership}</Text>
            <Text style={styles.memberSince}>Membre depuis {clientData.memberSince}</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>{clientData.points}</Text>
            <Text style={styles.statLabel}>Points fidélité</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="package-variant" size={24} color="#E31E24" />
            <Text style={styles.statNumber}>{clientData.totalShipments}</Text>
            <Text style={styles.statLabel}>Envois</Text>
          </View>

          <View style={styles.statCard}>
            <FontAwesome5 name="euro-sign" size={20} color="#00A651" />
            <Text style={styles.statNumber}>870</Text>
            <Text style={styles.statLabel}>Dépensé</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.infoCard}>
            {[
              { icon: "person", label: "Nom complet", value: clientData.nom + " " + clientData.prenom, field: "nom" },
              { icon: "mail", label: "Email", value: clientData.email, field: "email" },
              { icon: "phone", label: "Téléphone", value: clientData.telephone, field: "phone" },
              { icon: "location-on", label: "Adresse", value: clientData.adresse, field: "address" },
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
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <View style={styles.menuCard}>
            {menuOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
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
                  <Text style={styles.preferenceDescription}>{item.description}</Text>
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

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#E31E24" />
            <Text style={styles.supportButtonText}>Contacter le support</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleReferFriend}
          >
            <Ionicons name="share-social-outline" size={20} color="#0056A6" />
            <Text style={styles.shareButtonText}>Parrainer un ami</Text>
          </TouchableOpacity>
        </View>

        {/* Actions sensibles */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Zone de danger</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#666" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-outline" size={20} color="#F44336" />
            <Text style={styles.deleteText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 2.1.4</Text>
          <Text style={styles.copyrightText}>© 2024 AlloHonda Transport. Tous droits réservés.</Text>
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
    backgroundColor: "#2775bdff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  membershipText: {
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
    padding: 20,
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
    fontSize: 24,
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
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  supportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E31E24",
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E31E24",
    marginLeft: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginLeft: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0056A6",
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0056A6",
    marginLeft: 8,
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
    color: "#999",
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

export default ClientProfile;