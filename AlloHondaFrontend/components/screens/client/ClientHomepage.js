import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ClientHomepage({ route, navigation }) {
  const { user } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#1A56DB" />
          <Text style={styles.welcomeText}>Bienvenue, {user?.prenom || 'Client'} !</Text>
          <Text style={styles.emailText}>{user?.email || ''}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="car" size={40} color="#1A56DB" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Courses effectuées</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={40} color="#F59E0B" />
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>Votre note</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={30} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Nouvelle course</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]}>
            <Ionicons name="history" size={30} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Historique</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="settings" size={30} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Paramètres</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informations du compte</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet:</Text>
            <Text style={styles.infoValue}>{user?.prenom} {user?.nom}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>{user?.telephone || 'Non renseigné'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type de compte:</Text>
            <Text style={styles.infoValue}>Client</Text>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A56DB',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 15,
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