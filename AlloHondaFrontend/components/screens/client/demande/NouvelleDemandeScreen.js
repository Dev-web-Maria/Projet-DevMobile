import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const { width } = Dimensions.get('window');

const NouvelleDemandeScreen = ({ navigation, route }) => {
  const truck = route.params?.truck;

  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [typeMarchandise, setTypeMarchandise] = useState("PALETTES");
  const [poids, setPoids] = useState("");
  const [volume, setVolume] = useState("");
  const [dateDepart, setDateDepart] = useState("Aujourd'hui, 24 Oct");
  const [heure, setHeure] = useState("08:00 - 10:00");
  const [instructions, setInstructions] = useState("");

  const marchandiseTypes = [
    { key: "PALETTES", label: "Palettes", icon: "cube-outline", color: "#3B82F6" },
    { key: "VRAC", label: "Vrac", icon: "archive-outline", color: "#10B981" },
    { key: "FRIGO", label: "Frigo", icon: "snow-outline", color: "#8B5CF6" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header avec gradient et ombre */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle Demande</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Carte d'itinéraire */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="map-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>Itinéraire</Text>
          </View>

          <View style={styles.routeContainer}>
            {/* Départ */}
            <View style={styles.routeRow}>
              <View style={styles.routeIndicator}>
                <View style={[styles.routeDot, styles.dotGreen]} />
                <View style={styles.routeLineVertical} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Départ</Text>
                <TextInput
                  placeholder="Adresse de départ..."
                  placeholderTextColor="#9CA3AF"
                  value={depart}
                  onChangeText={setDepart}
                  style={styles.routeInput}
                />
              </View>
            </View>

            {/* Arrivée */}
            <View style={styles.routeRow}>
              <View style={styles.routeIndicator}>
                <View style={[styles.routeDot, styles.dotRed]} />
              </View>
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Destination</Text>
                <TextInput
                  placeholder="Adresse d'arrivée..."
                  placeholderTextColor="#9CA3AF"
                  value={arrivee}
                  onChangeText={setArrivee}
                  style={styles.routeInput}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Détails marchandise */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="cube-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.sectionTitle}>Marchandise</Text>
          </View>

          {/* Type de marchandise */}
          <View style={styles.chipContainer}>
            {marchandiseTypes.map((item) => {
              const active = typeMarchandise === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setTypeMarchandise(item.key)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: item.color + "15", borderColor: item.color }
                  ]}>
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={active ? item.color : "#9CA3AF"}
                  />
                  <Text style={[
                    styles.chipText,
                    active && { color: item.color, fontWeight: "600" }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Poids et Volume */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="barbell-outline" size={18} color="#3B82F6" />
                <Text style={styles.metricLabel}>Poids</Text>
              </View>
              <View style={styles.metricInputContainer}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="numeric"
                  value={poids}
                  onChangeText={setPoids}
                  style={styles.metricInput}
                />
                <Text style={styles.metricUnit}>kg</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Ionicons name="resize-outline" size={18} color="#8B5CF6" />
                <Text style={styles.metricLabel}>Volume</Text>
              </View>
              <View style={styles.metricInputContainer}>
                <TextInput
                  placeholder="0"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="numeric"
                  value={volume}
                  onChangeText={setVolume}
                  style={styles.metricInput}
                />
                <Text style={styles.metricUnit}>m³</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Planification */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.sectionTitle}>Planification</Text>
          </View>

          <TouchableOpacity style={styles.dateTimeCard}>
            <View style={styles.dateTimeContent}>
              <Ionicons name="calendar" size={22} color="#3B82F6" />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateTimeLabel}>Date de départ</Text>
                <Text style={styles.dateTimeValue}>{dateDepart}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateTimeCard}>
            <View style={styles.dateTimeContent}>
              <Ionicons name="time" size={22} color="#10B981" />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateTimeLabel}>Plage horaire</Text>
                <Text style={styles.dateTimeValue}>{heure}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              placeholder="Code portail, contact sur place, fragilité..."
              placeholderTextColor="#9CA3AF"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
            <View style={styles.textAreaFooter}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
              <Text style={styles.textAreaHint}>Optionnel</Text>
            </View>
          </View>
        </View>

        {/* Total et Soumission */}
        <View style={[styles.card, styles.totalCard]}>
          <View style={styles.totalHeader}>
            <View>
              <Text style={styles.totalLabel}>Total estimé</Text>
              <Text style={styles.totalValue}>-- DHs</Text>
            </View>
            <TouchableOpacity style={styles.quoteButton}>
              <Text style={styles.quoteButtonText}>Devis précis</Text>
              <Ionicons name="calculator-outline" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Soumettre la demande</Text>
            <View style={styles.submitButtonIcon}>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Vous serez contacté dans les 30 minutes pour confirmation
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NouvelleDemandeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  routeContainer: {
    paddingLeft: 8,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  routeIndicator: {
    alignItems: "center",
    width: 24,
    marginRight: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  dotGreen: {
    backgroundColor: "#10B981",
  },
  dotRed: {
    backgroundColor: "#EF4444",
  },
  routeLineVertical: {
    width: 2,
    height: 30,
    backgroundColor: "#E2E8F0",
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  chipText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#64748B",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  metricInputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  metricInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    marginLeft: 8,
  },
  dateTimeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  dateTimeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeText: {
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  textAreaContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  textArea: {
    padding: 16,
    minHeight: 100,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
    textAlignVertical: "top",
  },
  textAreaFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  textAreaHint: {
    marginLeft: 6,
    fontSize: 12,
    color: "#94A3B8",
  },
  totalCard: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  totalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -1,
  },
  quoteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quoteButtonText: {
    color: "#60A5FA",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  submitButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 16,
  },
});