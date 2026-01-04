// firebase.js — compatible React Native / Expo

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCyTJOtHDugs2OaXameKzI__iaRflPpOfo",
  authDomain: "allohondaadmin.firebaseapp.com",
  projectId: "allohondaadmin",
  storageBucket: "allohondaadmin.appspot.com",
  messagingSenderId: "1065789462134",
  appId: "1:1065789462134:web:f508bbd86cf66d44423157",
};

const app = initializeApp(firebaseConfig);

// Configuration recommandée par Firebase pour React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

