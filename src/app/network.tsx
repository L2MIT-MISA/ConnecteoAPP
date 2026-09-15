import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../components/bottom-navigation';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const NEARBY_API_URL = 'http://100.90.174.7:8000/api/network/nearby';

type NetworkNode = {
  name: string;
  type_site: string;
  proprietaire: string;
  distance_km: number;
  tech_2g: boolean;
  tech_3g: boolean;
  tech_4g: boolean;
  tech_5g: boolean;
};

function bestTech(node: NetworkNode): string {
  if (node.tech_5g) return '5G';
  if (node.tech_4g) return '4G';
  if (node.tech_3g) return '3G';
  if (node.tech_2g) return '2G';
  return '—';
}

function NetworkItem({ node }: { node: NetworkNode }) {
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity style={styles.networkItem}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="antenna" size={22} color="#31543F" />
      </View>

      <View style={styles.networkInfo}>
        <Text style={styles.networkName}>{node.name}</Text>
        <Text style={styles.networkDetails}>
          {node.distance_km.toFixed(2)} km · {bestTech(node)} · {node.type_site}
        </Text>
      </View>

    </TouchableOpacity>
  );
}

export default function NetworkScreen() {
  const styles = useThemedStyles(createStyles);

  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchNearby(lat: number, lon: number) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${NEARBY_API_URL}?lat=${lat}&lon=${lon}&radius=10`
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data: NetworkNode[] = await response.json();
      setNodes(data);
    } catch (err) {
      setError(
        "Impossible de joindre le serveur réseau — vérifie ta connexion et l'IP configurée."
      );
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }

  function handleManualSearch() {
    const lat = parseFloat(latInput.replace(',', '.'));
    const lon = parseFloat(lonInput.replace(',', '.'));

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError('Entre une latitude et une longitude valides.');
      return;
    }

    searchNearby(lat, lon);
  }

  async function handleUseGps() {
    try {
      const Location = await import('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Permission de localisation refusée.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      setLatInput(latitude.toFixed(6));
      setLonInput(longitude.toFixed(6));
      searchNearby(latitude, longitude);
    } catch {
      setError(
        "Géolocalisation indisponible — installe expo-location ou entre les coordonnées manuellement."
      );
    }
  }

  const activeCount = nodes.length;
  const farthestKm =
    nodes.length > 0 ? Math.max(...nodes.map((n) => n.distance_km)) : 0;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Réseaux à proximité</Text>
        </View>

        {/* RECHERCHE PAR COORDONNÉES */}
        <View style={styles.searchBox}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.coordInput}
              placeholder="Latitude"
              placeholderTextColor="#9a9a9a"
              value={latInput}
              onChangeText={setLatInput}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={styles.coordInput}
              placeholder="Longitude"
              placeholderTextColor="#9a9a9a"
              value={lonInput}
              onChangeText={setLonInput}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.searchButton} onPress={handleManualSearch}>
              <MaterialCommunityIcons name="magnify" size={16} color="#fff" />
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gpsButton} onPress={handleUseGps}>
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#31543F" />
              <Text style={styles.gpsButtonText}>Ma position</Text>
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* SUMMARY */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{activeCount}</Text>
              <Text style={styles.summaryLabel}>Nœuds trouvés</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{farthestKm.toFixed(1)} km</Text>
              <Text style={styles.summaryLabel}>
                Portée du relais{'\n'}le plus loin
              </Text>
            </View>
          </View>

          {/* NETWORK LIST */}
          {loading ? (
            <ActivityIndicator style={styles.loader} color="#31543F" />
          ) : nodes.length === 0 ? (
            <Text style={styles.emptyText}>
              Entre des coordonnées ou utilise "Ma position" pour voir les réseaux
              proches.
            </Text>
          ) : (
            <View style={styles.networkList}>
              {nodes.map((node, index) => (
                <NetworkItem key={`${node.name}-${index}`} node={node} />
              ))}
            </View>
          )}
        </ScrollView>

        <BottomNavigation activeTab="network" />
      </SafeAreaView>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: c.background,
    },

    container: {
      width: '100%',
      maxWidth: 430,
      flex: 1,
    },

    /* HEADER */
    header: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 12,
    },

    title: {
      fontSize: 21,
      fontWeight: '700',
      color: c.textDark,
    },

    /* SEARCH */
    searchBox: {
      paddingHorizontal: 18,
      gap: 8,
      marginBottom: 10,
    },

    searchRow: {
      flexDirection: 'row',
      gap: 8,
    },

    coordInput: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.cardBg,
      paddingHorizontal: 10,
      color: c.textDark,
      fontSize: 12,
    },

    searchButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: 10,
      backgroundColor: '#31543F',
    },

    searchButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },

    gpsButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.cardBg,
    },

    gpsButtonText: {
      color: '#31543F',
      fontSize: 12,
      fontWeight: '700',
    },

    errorText: {
      fontSize: 11,
      color: '#ef4444',
    },

    content: {
      paddingHorizontal: 18,
      paddingBottom: 20,
    },

    /* SUMMARY */
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },

    summaryCard: {
      flex: 1,
      minHeight: 78,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },

    summaryValue: {
      fontSize: 20,
      fontWeight: '700',
      color: c.textDark,
    },

    summaryLabel: {
      fontSize: 10,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 2,
      lineHeight: 13,
    },

    loader: {
      marginTop: 20,
    },

    emptyText: {
      fontSize: 12,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 24,
      paddingHorizontal: 12,
    },

    /* NETWORK LIST */
    networkList: {
      gap: 9,
    },

    networkItem: {
      minHeight: 68,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },

    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: '#EAE5D8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    networkInfo: {
      flex: 1,
    },

    networkName: {
      fontSize: 13,
      fontWeight: '700',
      color: c.textDark,
      textAlign: 'center',
    },

    networkDetails: {
      fontSize: 10,
      color: c.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
    },

    activeDot: {
      backgroundColor: c.primary,
    },

    inactiveDot: {
      backgroundColor: c.textMuted,
    },
  });
}