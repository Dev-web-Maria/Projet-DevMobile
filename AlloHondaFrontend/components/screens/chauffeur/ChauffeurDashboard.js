import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChauffeurDashboard({ route, navigation }) {
  const { user } = route.params || {};
  const [isOnline, setIsOnline] = React.useState(false);
  const [earnings, setEarnings] = React.useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* En-tête avec statut */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <Ionicons name="car-sport" size={80} color="#1A56DB" />
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>{user?.prenom || 'Chauffeur'}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
                <Text style={styles.statusText}>{isOnline ? 'En ligne' : 'Hors ligne'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Disponible pour les courses</Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cash" size={40} color="#10B981" />
            <Text style={styles.statNumber}>{earnings}€</Text>
            <Text style={styles.statLabel}>Gains du jour</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={40} color="#F59E0B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Courses aujourd'hui</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={40} color="#8B5CF6" />
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Note moyenne</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={40} color="#EF4444" />
            <Text style={styles.statNumber}>0h</Text>
            <Text style={styles.statLabel}>Temps travaillé</Text>
          </View>
        </View>

        {/* Actions rapides */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="navigate" size={30} color="#1A56DB" />
            <Text style={styles.actionText}>Navigation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document-text" size={30} color="#10B981" />
            <Text style={styles.actionText}>Rapports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="wallet" size={30} color="#F59E0B" />
            <Text style={styles.actionText}>Paiements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="car" size={30} color="#EF4444" />
            <Text style={styles.actionText}>Mon véhicule</Text>
          </TouchableOpacity>
        </View>

        {/* Prochaine course (si disponible) */}
        <View style={styles.nextRideCard}>
          <Text style={styles.nextRideTitle}>Prochaine course</Text>
          <Text style={styles.nextRideText}>Aucune course en attente</Text>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Chercher des courses</Text>
          </TouchableOpacity>
        </View>

        {/* Informations du compte */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informations chauffeur</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permis:</Text>
            <Text style={styles.infoValue}>Validé ✓</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Véhicule:</Text>
            <Text style={styles.infoValue}>À configurer</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={[styles.infoValue, { color: isOnline ? '#10B981' : '#EF4444' }]}>
              {isOnline ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginVertical: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 10,
  },
  nextRideCard: {
    backgroundColor: '#1A56DB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  nextRideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  nextRideText: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 15,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A56DB',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
});