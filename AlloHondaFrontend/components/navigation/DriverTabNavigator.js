import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

/* Driver SCREENS */
import ChauffeurDashboard from "../screens/chauffeur/dashboard/ChauffeurDashboard";
import ChauffeurDemandeVisualisation from "../screens/chauffeur/demande/ChauffeurDemandeVisualisation";
import ChauffeurHistory from "../screens/chauffeur/history/ChauffeurHistoryScreen";
import ChauffeurProfile from "../screens/chauffeur/profile/ChauffeurProfile";

const Tab = createBottomTabNavigator();

const DriverTabNavigator = ({ route }) => {
  const { user } = route.params || {};
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
            case "Demande":
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
      <Tab.Screen
        name="Dashboard"
        children={(props) => <ChauffeurDashboard user={user} {...props} />}
      />
      <Tab.Screen
        name="Demande"
        children={(props) => <ChauffeurDemandeVisualisation user={user} {...props} />}
      />
      <Tab.Screen
        name="Historique"
        children={(props) => <ChauffeurHistory user={user} {...props} />}
      />
      <Tab.Screen
        name="Profil"
        children={(props) => <ChauffeurProfile user={user} {...props} />}
      />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
