import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ClientHistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des transports</Text>
      <Text style={styles.subtitle}>
        Cette fonctionnalité sera disponible prochainement.
      </Text>
    </View>
  );
};

export default ClientHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
});
