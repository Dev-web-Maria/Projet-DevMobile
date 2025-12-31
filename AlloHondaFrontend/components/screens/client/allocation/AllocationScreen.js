import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";


import AllocationHeader from "./AllocationHeader";
import AllocationFilters from "./AllocationFilters";
import TruckCard from "./TruckCard";
import { mockTrucks } from "../../../../data/mockTrucks";

const AllocationScreen = () => {
  const navigation = useNavigation();
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTrucks(mockTrucks);
    setFilteredTrucks(mockTrucks);
  }, []);

  useEffect(() => {
    let result = [...trucks];

    if (filter !== "ALL") {
      result = result.filter(t => t.status === filter);
    }

    if (search.trim()) {
      result = result.filter(t =>
        t.model.toLowerCase().includes(search.toLowerCase()) ||
        t.driver?.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search)
      );
    }

    setFilteredTrucks(result);
  }, [filter, search, trucks]);

  
  const handleAllocate = (truck) => {
    navigation.navigate("NouvelleDemande", { truck });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}> 
      <AllocationHeader search={search} onSearchChange={setSearch}/>
      <AllocationFilters selected={filter} onChange={setFilter} />

      <FlatList
        data={filteredTrucks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TruckCard truck={item} onAllocate={handleAllocate} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB amélioré */}
      <TouchableOpacity 
        onPress={() => navigation.navigate("NouvelleDemande")}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
        <View style={styles.fabShadow} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AllocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFD",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
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