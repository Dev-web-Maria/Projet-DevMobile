import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientTabNavigator from "./ClientTabNavigator";
import NouvelleDemandeScreen from "../screens/client/demande/NouvelleDemandeScreen";

const Stack = createNativeStackNavigator();

const ClientStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
      <Stack.Screen name="NouvelleDemande" component={NouvelleDemandeScreen} />
    </Stack.Navigator>
  );
};

export default ClientStackNavigator;
