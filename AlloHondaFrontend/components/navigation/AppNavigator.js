// // navigation/AppNavigator.js
// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';

// // IMPORTATION CORRECTE - Vérifiez les chemins
// import LandingScreen from '../screens/LandingScreen';
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import DashboardScreen from '../screens/DashboardScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   return (
//     <Stack.Navigator
//       initialRouteName="Landing"
//       screenOptions={{
//         headerShown: false,
//         cardStyle: { backgroundColor: '#FFFFFF' },
//       }}
//     >
//       {/* Vérifiez que chaque screen a un composant valide */}
//       <Stack.Screen 
//         name="Landing" 
//         component={LandingScreen}
//       />
//       <Stack.Screen 
//         name="Login" 
//         component={LoginScreen} 
//       />
//       <Stack.Screen 
//         name="Register" 
//         component={RegisterScreen} 
//       />
//       <Stack.Screen 
//         name="Dashboard" 
//         component={DashboardScreen} 
//       />
//     </Stack.Navigator>
//   );
// }



// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import { Ionicons } from '@expo/vector-icons';
// import { TouchableOpacity } from 'react-native';

// // IMPORTATION des écrans
// import LandingScreen from '../screens/LandingScreen';
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import DashboardScreen from '../screens/DashboardScreen';

// const Stack = createStackNavigator();

// export default function AppNavigator() {
//   return (
//     <Stack.Navigator
//       initialRouteName="Landing"
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: '#1A56DB',
//           elevation: 0,
//           shadowOpacity: 0,
//         },
//         headerTintColor: '#FFFFFF',
//         headerTitleStyle: {
//           fontWeight: '600',
//           fontSize: 18,
//         },
//         headerTitleAlign: 'center',
//         headerBackTitleVisible: false,
//       }}
//     >
      
//       <Stack.Screen 
//         name="Landing" 
//         component={LandingScreen}
//         options={{ headerShown: false }}
//       />
      
      
//       <Stack.Screen 
//         name="Login" 
//         component={LoginScreen}
//         options={({ navigation }) => ({ 
//           title: 'Connexion',
//           headerLeft: () => (
//             <TouchableOpacity 
//               onPress={() => navigation.goBack()}
//               style={{ marginLeft: 15 }}
//             >
//               <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//           ),
//         })}
//       />
      
      
//       <Stack.Screen 
//         name="Register" 
//         component={RegisterScreen}
//         options={({ navigation }) => ({ 
//           title: 'Inscription',
//           headerLeft: () => (
//             <TouchableOpacity 
//               onPress={() => navigation.goBack()}
//               style={{ marginLeft: 15 }}
//             >
//               <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//           ),
//         })}
//       />
      
    
//       <Stack.Screen 
//         name="Dashboard" 
//         component={DashboardScreen}
//         options={({ navigation }) => ({ 
//           title: 'Tableau de bord',
//           headerLeft: () => null,
//           headerRight: () => (
//             <TouchableOpacity 
//               onPress={() => navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Landing' }],
//               })}
//               style={{ marginRight: 15 }}
//             >
//               <Ionicons name="log-out" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//           ),
//         })}
//       />
//     </Stack.Navigator>
//   );
// }






import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

// IMPORTATION des écrans
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';

// IMPORTATION des nouveaux écrans pour clients et chauffeurs
import ClientHomepage from '../screens/client/ClientHomepage';
import ChauffeurDashboard from '../screens/chauffeur/ChauffeurDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1A56DB',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}
    >
      
      <Stack.Screen 
        name="Landing" 
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={({ navigation }) => ({ 
          title: 'Connexion',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      
      
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={({ navigation }) => ({ 
          title: 'Inscription',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      
      {/* Écran Dashboard (vous pouvez le garder ou le supprimer) */}
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={({ navigation }) => ({ 
          title: 'Tableau de bord',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              })}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      
      {/* NOUVEAU : Écran pour les clients */}
      <Stack.Screen 
        name="ClientHomepage" 
        component={ClientHomepage}
        options={({ navigation, route }) => ({ 
          title: route.params?.title || 'Accueil Client',
          headerLeft: () => null, // Pas de retour en arrière (le logout suffit)
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                // Déconnexion et retour à l'écran Landing
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Landing' }],
                });
              }}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
      
      {/* NOUVEAU : Écran pour les chauffeurs */}
      <Stack.Screen 
        name="ChauffeurDashboard" 
        component={ChauffeurDashboard}
        options={({ navigation, route }) => ({ 
          title: route.params?.title || 'Tableau de Bord Chauffeur',
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {
                // Déconnexion et retour à l'écran Landing
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Landing' }],
                });
              }}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}