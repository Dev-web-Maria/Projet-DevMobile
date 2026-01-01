// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// /* AUTH SCREENS */
// import LandingScreen from "../screens/authentification/LandingScreen";
// import LoginScreen from "../screens/authentification/LoginScreen";
// import RegisterScreen from "../screens/authentification/RegisterScreen";

// /* APP NAVIGATORS */
// import ClientStackNavigator from "./ClientStackNavigator";
// import AdminNavigator from "./AdminNavigator";
// import DriverStackNavigator from "./DriverStackNavigator";

// const Stack = createNativeStackNavigator();

// const AppNavigator = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* AVANT AUTHENTIFICATION */}
//       <Stack.Screen name="Landing" component={LandingScreen} />
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Register" component={RegisterScreen} />

//       {/* APRÈS AUTHENTIFICATION */}
//       <Stack.Screen name="Client" component={ClientStackNavigator} />
//       <Stack.Screen name="Admin" component={AdminNavigator} />
//       <Stack.Screen name="Driver" component={DriverStackNavigator} />
//     </Stack.Navigator>
//   );
// };

// export default AppNavigator;


// AppNavigator.js - Version corrigée
import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

/* AUTH SCREENS */
import LandingScreen from "../screens/authentification/LandingScreen";
import LoginScreen from "../screens/authentification/LoginScreen";
import RegisterScreen from "../screens/authentification/RegisterScreen";

/* APP NAVIGATORS */
import ClientStackNavigator from "./ClientStackNavigator";
import AdminNavigator from "./AdminNavigator";
import DriverStackNavigator from "./DriverStackNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('/////////User session found:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Erreur lecture session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E31E24" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!user) return "Landing";
    
    const type = user.userType || user.UserType || (user.roles && user.roles[0]) || "client";
    
    if (type.toLowerCase() === 'chauffeur' || type.toLowerCase() === 'driver') {
      return "Driver";
    } else if (type.toLowerCase() === 'admin') {
      return "Admin";
    }
    return "Client";
  };

  return (
    <Stack.Navigator 
      initialRouteName={getInitialRoute()}
      screenOptions={{ headerShown: false }}
    >
      {/* TOUS les écrans doivent être définis ici */}
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen 
        name="Client" 
        component={ClientStackNavigator}
        initialParams={{ user }}
      />
      <Stack.Screen 
        name="Driver" 
        component={DriverStackNavigator}
        initialParams={{ user }}
      />
      <Stack.Screen 
        name="Admin" 
        component={AdminNavigator}
        initialParams={{ user }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;