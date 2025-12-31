import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

/* CLIENT SCREENS */
import ClientDashboard from "../screens/client/dashboard/ClientDashboard";
import AllocationScreen from "../screens/client/allocation/AllocationScreen";
import ClientHistoryScreen from "../screens/client/history/ClientHistoryScreen";
import ClientProfile from "../screens/client/profile/ClientProfile";

const Tab = createBottomTabNavigator();

const ClientTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Dashboard":
              iconName = "home-outline";
              break;
            case "Allocation":
              iconName = "car-outline";
              break;
            case "Historique":
              iconName = "time-outline";
              break;
            case "Profil":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      
      <Tab.Screen name="Allocation" component={AllocationScreen} />
      <Tab.Screen name="Dashboard" component={ClientDashboard} />
      <Tab.Screen name="Historique" component={ClientHistoryScreen} />
      <Tab.Screen name="Profil" component={ClientProfile} />
    </Tab.Navigator>
  );
};

export default ClientTabNavigator;
