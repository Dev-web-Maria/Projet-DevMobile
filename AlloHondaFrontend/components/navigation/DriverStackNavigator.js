import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DriverTabNavigator from "./DriverTabNavigator";
import ChauffeurTrackingScreen from "../screens/chauffeur/dashboard/ChauffeurTrackingScreen";

const Stack = createNativeStackNavigator();

const DriverStackNavigator = ({ route }) => {
  const { user } = route.params || {};
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DriverTabs"
        component={DriverTabNavigator}
        initialParams={{ user }}
      />
      <Stack.Screen
        name="ChauffeurTracking"
        component={ChauffeurTrackingScreen}
        initialParams={{ user }}
      />
    </Stack.Navigator>
  );
};

export default DriverStackNavigator;