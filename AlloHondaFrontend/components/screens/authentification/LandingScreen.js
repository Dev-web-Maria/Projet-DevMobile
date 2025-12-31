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
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// Animation personnalisée pour le logo
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
    // Animation d'entrée principale
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

    // Animation de rotation continue pour le logo
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

  const handleButtonPress = (buttonType) => {
    // Animation de pulsation au clic
    Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(0.95), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (buttonType === 'login') {
      navigation.navigate('Login');
    } else if (buttonType === 'register') {
      navigation.navigate('Register');
    }
  };

  const FeatureCard = ({ icon, title, description, color, delay }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        delay: delay,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={delay}
        style={[styles.featureCard, { borderLeftColor: color }]}
      >
        <Animated.View style={[styles.featureIcon, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </Animated.View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </Animatable.View>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header animé avec effet de particules */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Animated.View 
            style={[
              styles.logoBackground,
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
          />
          <Animatable.View 
            animation={pulseAnimation}
            iterationCount="infinite"
            duration={3000}
            style={styles.logoIcon}
          >
            <MaterialCommunityIcons name="truck-fast" size={80} color="#1A56DB" />
          </Animatable.View>
        </View>
        
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: truckAnim }]
          }}
        >
          <Text style={styles.title}>ALLOHONDA</Text>
          <Text style={styles.subtitle}>Optimisez votre logistique</Text>
        </Animated.View>

        {/* Élément décoratif animé */}
        <Animatable.View 
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.decorativeElement}
        >
          <View style={styles.decorativeLine} />
          <MaterialCommunityIcons name="circle-small" size={16} color="#1A56DB" />
          <View style={styles.decorativeLine} />
        </Animatable.View>
      </Animated.View>

      

      

      {/* Boutons d'action avec effets */}
      <Animatable.View 
        animation="fadeInUp"
        delay={1300}
        style={styles.actionButtons}
      >
        <Animatable.View 
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          delay={1400}
        >
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => handleButtonPress('login')}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-in" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </View>
            <Animatable.View 
              animation="slideInRight"
              iterationCount="infinite"
              duration={1500}
              style={styles.buttonArrow}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Animatable.View>
          </TouchableOpacity>
        </Animatable.View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => handleButtonPress('register')}
          activeOpacity={0.9}
        >
          <Animatable.View 
            animation="rubberBand"
            delay={1500}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add" size={24} color="#1A56DB" />
              <Text style={styles.secondaryButtonText}>Créer un compte</Text>
            </View>
          </Animatable.View>
          <View style={[styles.buttonArrow, { backgroundColor: '#1A56DB' }]}>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.demoButton}
          activeOpacity={0.8}
        >
          <Animatable.View 
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="play-circle" size={24} color="#6B7280" />
              <Text style={styles.demoButtonText}>Voir la démo</Text>
            </View>
          </Animatable.View>
          <Animatable.View 
            animation="rotate"
            iterationCount="infinite"
            duration={3000}
            style={styles.playIcon}
          >
            <FontAwesome5 name="play" size={12} color="#6B7280" />
          </Animatable.View>
        </TouchableOpacity>
      </Animatable.View>

      {/* Footer avec animation subtile */}
      <Animatable.View 
        animation="fadeIn"
        delay={1600}
        style={styles.footer}
      >
        <View style={styles.footerContent}>
          <Animatable.View 
            animation="bounceIn"
            delay={1700}
          >
            <MaterialCommunityIcons name="truck-fast" size={32} color="#1A56DB" />
          </Animatable.View>
          <Text style={styles.footerText}>© 2024 ALLOHONDA Logistics</Text>
          <Animatable.Text 
            animation="flash"
            iterationCount="infinite"
            duration={3000}
            style={styles.version}
          >
            Version 2.4.0
          </Animatable.Text>
          
          {/* Éléments décoratifs du footer */}
          <View style={styles.footerDecorations}>
            {[...Array(5)].map((_, i) => (
              <Animatable.View
                key={i}
                animation="pulse"
                iterationCount="infinite"
                duration={2000 + i * 500}
                style={[
                  styles.decorationDot,
                  { backgroundColor: i % 2 === 0 ? '#1A56DB' : '#10B981' }
                ]}
              />
            ))}
          </View>
        </View>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    position: 'relative',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(26, 86, 219, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(26, 86, 219, 0.2)',
    top: -20,
    left: -20,
  },
  logoIcon: {
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1A56DB',
    marginTop: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(26, 86, 219, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  decorativeElement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  decorativeLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1A56DB',
    borderRadius: 1,
  },
  descriptionSection: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    paddingLeft: 10,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    transform: [{ perspective: 1000 }],
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    flex: 1,
  },
  featureDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#1A56DB',
    borderRadius: 20,
    padding: 25,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 4,
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtons: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1A56DB',
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#1A56DB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#1A56DB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  demoButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A56DB',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 12,
  },
  buttonArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    color: '#1A56DB',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerDecorations: {
    flexDirection: 'row',
    marginTop: 20,
  },
  decorationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,  
  },
});