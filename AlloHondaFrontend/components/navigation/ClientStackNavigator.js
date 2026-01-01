// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import ClientTabNavigator from "./ClientTabNavigator";
// import NouvelleDemandeScreen from "../screens/client/demande/NouvelleDemandeScreen";

// const Stack = createNativeStackNavigator();

// const ClientStackNavigator = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
//       <Stack.Screen name="NouvelleDemande" component={NouvelleDemandeScreen} />
//     </Stack.Navigator>
//   );
// };

// export default ClientStackNavigator;




import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientTabNavigator from "./ClientTabNavigator";
import NouvelleDemandeScreen from "../screens/client/demande/NouvelleDemandeScreen";
import TrackingScreen from "../screens/client/tracking/TrackingScreen";

const Stack = createNativeStackNavigator();

const ClientStackNavigator = ({ route }) => {
  // Récupérer les données de l'utilisateur passées depuis AppNavigator
  const { user } = route.params || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ClientTabs"
        component={ClientTabNavigator}
        initialParams={{ user }}  // Passer l'utilisateur ici
      />
      <Stack.Screen
        name="NouvelleDemande"
        component={NouvelleDemandeScreen}
        initialParams={{ user }}
      />
      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
      />
    </Stack.Navigator>
  );
};

export default ClientStackNavigator;