import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DriverTabNavigator from "./DriverTabNavigator";

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
    </Stack.Navigator>
  );
};

export default DriverStackNavigator;