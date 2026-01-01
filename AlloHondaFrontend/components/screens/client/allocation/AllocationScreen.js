import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import AllocationHeader from "./AllocationHeader";
import AllocationFilters from "./AllocationFilters";
import TruckCard from "./TruckCard";

const AllocationScreen = ({ user }) => {
  const navigation = useNavigation();
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAvailableChauffeurs = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await axios.get(`${baseUrl}/api/Chauffeur`);

      const mappedTrucks = response.data.map(item => ({
        id: item.idChauffeur,
        status: item.statut || "Disponible",
        model: item.vehicule?.type || "Véhicule Standard",
        type: item.vehicule?.type || "Transport",
        capacity: item.vehicule?.capacite || "N/A",
        driver: `${item.prenom} ${item.nom}`,
        driverEmail: item.email,
        driverPhone: item.telephone,
        license: item.numeroPermis,
        fuel: "Inconnu",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
        rawData: item
      }));

      setTrucks(mappedTrucks);
      setFilteredTrucks(mappedTrucks);
    } catch (error) {
      console.error("Erreur lors de la récupération des chauffeurs:", error);
      Alert.alert("Erreur", "Impossible de charger la liste des chauffeurs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvailableChauffeurs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvailableChauffeurs();
  };

  useEffect(() => {
    let result = [...trucks];

    if (filter !== "ALL") {
      result = result.filter(t => t.status === filter);
    }

    if (search.trim()) {
      result = result.filter(t =>
        t.model.toLowerCase().includes(search.toLowerCase()) ||
        t.driver?.toLowerCase().includes(search.toLowerCase()) ||
        t.driverEmail?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search)
      );
    }

    setFilteredTrucks(result);
  }, [filter, search, trucks]);

  const handleAllocate = (truck) => {
    navigation.navigate("NouvelleDemande", { 
      truck, 
      user,
      chauffeurData: truck.rawData 
    });
  };

  const getCounts = () => {
    return {
      all: trucks.length.toString(),
      disponible: trucks.filter(t => t.status === "Disponible").length.toString(),
      occupe: trucks.filter(t => t.status === "Occupe").length.toString(),
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <AllocationHeader search={search} onSearchChange={setSearch} />
      <AllocationFilters
        selected={filter}
        onChange={setFilter}
        counts={getCounts()}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <FlatList
          data={filteredTrucks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TruckCard 
              truck={item} 
              onAllocate={handleAllocate} 
              user={user}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={60} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>Aucun chauffeur trouvé</Text>
              <Text style={styles.emptyText}>
                {filter === "Disponible" 
                  ? "Aucun chauffeur disponible pour le moment" 
                  : "Aucun résultat correspondant à votre recherche"}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate("NouvelleDemande", { user })}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <View style={styles.fabShadow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fabShadow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 32,
    backgroundColor: "rgba(0, 102, 255, 0.15)",
    transform: [{ scale: 1.2 }],
  },
});

export default AllocationScreen;