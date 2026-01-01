import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AllocationHeader = ({ search, onSearchChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Allocation</Text>
        <View style={styles.titleLine} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={18} color="#6B7280" />
          </View>
          <TextInput
            placeholder="Rechercher ID ou chauffeur..."
            value={search}
            onChangeText={onSearchChange}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.searchHint}>
            <Text style={styles.hintText}>⌘K</Text>
          </View>
        </View>
        <View style={styles.searchShadow} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerTop: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  titleLine: {
    width: 48,
    height: 4,
    backgroundColor: "#0066FF",
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.8,
  },
  searchContainer: {
    position: "relative",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 0,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  searchIconContainer: {
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  input: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    paddingRight: 12,
  },
  searchHint: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hintText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  searchShadow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    top: 4,
    zIndex: -1,
    opacity: 0.7,
  },
});

export default AllocationHeader;