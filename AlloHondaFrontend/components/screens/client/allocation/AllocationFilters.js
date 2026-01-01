import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AllocationFilters = ({ selected, onChange, counts = {} }) => {
  const filters = [
    { key: "ALL", label: "Tous", count: counts.all || "0" },
    { key: "Disponible", label: "Disponibles", count: counts.disponible || "0" },
    { key: "Occupe", label: "Occupés", count: counts.occupe || "0" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filtersWrapper}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.pillContainer,
              selected === f.key && styles.activeContainer,
            ]}
            onPress={() => onChange(f.key)}
            activeOpacity={0.7}
          >
            <View style={styles.pillContent}>
              <Text
                style={[
                  styles.text,
                  selected === f.key && styles.activeText,
                ]}
              >
                {f.label}
              </Text>
              <View style={[
                styles.countBadge,
                selected === f.key && styles.activeCountBadge,
              ]}>
                <Text style={[
                  styles.countText,
                  selected === f.key && styles.activeCountText,
                ]}>
                  {f.count}
                </Text>
              </View>
            </View>
            {selected === f.key && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filtersWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "#F8FAFD",
    borderRadius: 12,
  },
  pillContainer: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 2,
    backgroundColor: "transparent",
    position: "relative",
  },
  activeContainer: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#0066FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  activeText: {
    color: "#0066FF",
    fontWeight: "700",
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    minWidth: 24,
    alignItems: "center",
  },
  activeCountBadge: {
    backgroundColor: "rgba(0, 102, 255, 0.1)",
  },
  countText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },
  activeCountText: {
    color: "#0066FF",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -4,
    left: "25%",
    right: "25%",
    height: 3,
    backgroundColor: "#0066FF",
    borderRadius: 1.5,
  },
});

export default AllocationFilters;