import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const pulseAnimation = {
  0: { scale: 1 },
  0.5: { scale: 1.05 },
  1: { scale: 1 },
};

export default function LandingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const truckAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(truckAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleButtonPress = (type) => {
    if (type === 'login') navigation.navigate('Login');
    if (type === 'register') navigation.navigate('Register');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoBackground, { transform: [{ rotate: rotateInterpolate }] }]} />
          <Animatable.View animation={pulseAnimation} iterationCount="infinite" duration={3000} style={styles.logoIcon}>
            <MaterialCommunityIcons name="truck-fast" size={80} color="#1A56DB" />
          </Animatable.View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: truckAnim }] }}>
          <Text style={styles.title}>ALLOHONDA</Text>
          <Text style={styles.subtitle}>Optimisez votre logistique</Text>
        </Animated.View>
      </Animated.View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => handleButtonPress('login')}>
          <View style={styles.buttonContent}>
            <Ionicons name="log-in" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleButtonPress('register')}>
          <View style={styles.buttonContent}>
            <Ionicons name="person-add" size={24} color="#1A56DB" />
            <Text style={styles.secondaryButtonText}>Créer un compte</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <Animatable.View animation="fadeIn" delay={1600} style={styles.footer}>
        <MaterialCommunityIcons name="truck-fast" size={32} color="#1A56DB" />
        <Text style={styles.footerText}>© 2024 ALLOHONDA Logistics</Text>
        <Text style={styles.version}>Version 2.4.0</Text>

        {/* 🔐 SUPPORT / ADMIN */}
        <TouchableOpacity
          style={styles.adminLinkContainer}
          onPress={() => navigation.navigate('AdminLogin')}
          activeOpacity={0.7}
        >
          <Text style={styles.adminLinkText}>Support / Admin</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20, paddingBottom: 40 },

  header: { alignItems: 'center', marginTop: 40 },
  logoContainer: { marginBottom: 20 },
  logoBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(26,86,219,0.1)',
    top: -20,
    left: -20,
  },
  logoIcon: { zIndex: 1 },

  title: { fontSize: 42, fontWeight: '800', color: '#1A56DB', textAlign: 'center' },
  subtitle: { fontSize: 20, color: '#6B7280', marginTop: 8 },

  actionButtons: { marginTop: 40 },
  primaryButton: {
    backgroundColor: '#1A56DB',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1A56DB',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 18, marginLeft: 12 },
  secondaryButtonText: { color: '#1A56DB', fontSize: 18, marginLeft: 12 },

  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 14, color: '#9CA3AF', marginTop: 10 },
  version: { fontSize: 12, color: '#1A56DB', marginBottom: 10 },

  adminLinkContainer: { marginTop: 8 },
  adminLinkText: {
    fontSize: 14,
    color: '#1A56DB',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
