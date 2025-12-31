import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* AUTH SCREENS */
import LandingScreen from "../screens/authentification/LandingScreen";
import LoginScreen from "../screens/authentification/LoginScreen";
import RegisterScreen from "../screens/authentification/RegisterScreen";

/* APP NAVIGATORS */
import ClientStackNavigator from "./ClientStackNavigator";
import AdminNavigator from "./AdminNavigator";
import DriverNavigator from "./DriverNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* AVANT AUTHENTIFICATION */}
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* APRÈS AUTHENTIFICATION */}
      <Stack.Screen name="Client" component={ClientStackNavigator} />
      <Stack.Screen name="Admin" component={AdminNavigator} />
      <Stack.Screen name="Driver" component={DriverNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
