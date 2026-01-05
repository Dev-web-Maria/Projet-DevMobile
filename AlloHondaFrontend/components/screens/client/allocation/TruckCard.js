import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TruckCard = ({ truck, onAllocate }) => {
  const isAvailable = truck.status === "Disponible";

  const getStatus = () => {
    switch (truck.status) {
      case "Disponible":
        return {
          label: "DISPONIBLE",
          color: "#10B981",
          bg: "rgba(16, 185, 129, 0.1)",
          icon: "checkmark-circle"
        };
      case "Occupe":
        return {
          label: "OCCUPÉ",
          color: "#F59E0B",
          bg: "rgba(245, 158, 11, 0.1)",
          icon: "time"
        };
      default:
        return {
          label: truck.status || "",
          color: "#6B7280",
          bg: "rgba(156, 163, 175, 0.1)",
          icon: "help"
        };
    }
  };

  const status = getStatus();

  return (
    <View style={styles.card}>
      <View style={styles.cardShadow} />

      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIcon, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
          </View>
          <View style={[styles.badge, { backgroundColor: status.color }]}>
            <Text style={styles.badgeText}>{status.label}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: truck.image || "https://www.caroom.fr/guide/wp-content/uploads/2022/05/utilitaire.jpg",
          }}
          style={styles.image}
        />
        <View style={styles.imageOverlay} />
        <View style={styles.idBadge}>
          <Text style={styles.idText}>ID: {truck.id}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {truck.model}
          </Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{truck.type}</Text>
          </View>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="cube-outline" size={14} color="#6B7280" />
            <Text style={styles.specText}>{truck.capacity}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="document-text-outline" size={14} color="#6B7280" />
            <Text style={styles.specText}>{truck.license || "N° permis"}</Text>
          </View>
        </View>

        <View style={styles.driverContainer}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverLabel}>Chauffeur</Text>
            <Text style={styles.driverName}>
              {truck.driver || "Non assigné"}
            </Text>
            {truck.driverPhone && (
              <Text style={styles.driverPhone}>{truck.driverPhone}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          disabled={!isAvailable}
          style={[
            styles.button,
            !isAvailable && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          onPress={() => isAvailable && onAllocate(truck)}
        >
          <Text style={styles.buttonText}>
            {isAvailable ? "Sélectionner ce chauffeur" : "Indisponible"}
          </Text>
          {isAvailable && (
            <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
          )}
        </TouchableOpacity>

        {!isAvailable && (
          <View style={styles.unavailableInfo}>
            <Ionicons name="information-circle-outline" size={14} color="#F59E0B" />
            <Text style={styles.unavailableText}>
              Ce chauffeur est actuellement occupé
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    top: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 4,
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  idBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  infoContainer: {
    padding: 16,
    paddingTop: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  specsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  specText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  driverContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFD",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: 2,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 12,
    color: "#6B7280",
  },
  button: {
    backgroundColor: "#0066FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
    shadowColor: "transparent",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  unavailableInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 6,
    fontWeight: "500",
  },
});

export default TruckCard;