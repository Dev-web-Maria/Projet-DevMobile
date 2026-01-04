import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminChauffeursScreen from "../screens/admin/AdminChauffeursScreen";
import AdminCreateChauffeurScreen from "../screens/admin/AdminCreateChauffeurScreen";
import AdminClientsScreen from "../screens/admin/AdminClientsScreen";
import AdminRequestsScreen from "../screens/admin/AdminRequestsScreen";
import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";

const Stack = createNativeStackNavigator();

const AdminNavigator = ({ route }) => {
  const { user } = route.params || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        initialParams={{ user }}
      />

      <Stack.Screen
        name="AdminChauffeurs"
        component={AdminChauffeursScreen}
      />

      <Stack.Screen
        name="AdminCreateChauffeur"
        component={AdminCreateChauffeurScreen}
      />

      <Stack.Screen
        name="AdminClients"
        component={AdminClientsScreen}
      />

      <Stack.Screen
        name="AdminRequests"
        component={AdminRequestsScreen}
      />

      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
      />


    </Stack.Navigator>
  );
};

export default AdminNavigator;
