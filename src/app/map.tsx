import { Map } from '@maplibre/maplibre-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';

const COLORS = {
  dark: '#1B3A2B',
  darkGreen: '#1F4A32',
  accentGreen: '#2E6B4A',
  background: '#EFEBE4',
  textDark: '#1B1B1B',
  textLight: '#FFFFFF',
  subtitle: '#A9C2B3',
  border: '#E3DED5',
};


export default function StatsScreen() {
  const [text, onChangeText] = React.useState('');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map</Text>
          <Map mapStyle="https://tiles.openfreemap.org/styles/liberty" style={styles.map} />
          <TextInput
            value={text}
            onChangeText={onChangeText}
            style={styles.searchBar}
            placeholder="Search"
            placeholderTextColor="#1B1B1B"
          />
          <Pressable style={styles.focus}>
            <Text style={styles.focusText}>Focus</Text>
          </Pressable>
        </View>
        <BottomNavigation activeTab="map" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: COLORS.background },
  container: { width: '100%', maxWidth: 430, flex: 1 },
  header: { alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.textDark, padding: 10 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGreen,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileName: { color: COLORS.textLight, fontSize: 17, fontWeight: '700' },
  profileStatus: { color: COLORS.subtitle, fontSize: 13, marginTop: 2 },
  list: { marginTop: 24, marginHorizontal: 20 },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statIcon: { width: 30, alignItems: 'center', marginRight: 12 },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  statLabel: { fontSize: 13, color: COLORS.dark, marginTop: 2 },
  searchBar: {
    position: 'absolute',
    top: 70,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    margin: 5,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    width: '70%',
  },
  map: {
    width: '100%',
    height: '90%'
  },
  focus: {
    position: 'absolute',
    bottom: '10%',
    right: '10%'
  },
  focusText: {
    borderWidth: 1,
    padding: 7,
    fontSize: 20,
    borderRadius: 5
  }
});