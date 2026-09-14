import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';
import MapSearchBar from '../components/mapSearchBar';


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
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = React.useState<
    [lng: number, lat: number] | undefined
  >(undefined);
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [placeToSearch, setPlaceToSearch] = React.useState('');


  async function getLocation() {
    let location = await Location.getCurrentPositionAsync({});
    let stateText = 'Waiting...';
    if (errorMsg) {
      stateText = errorMsg;
    } else if (location) {
      stateText = JSON.stringify(location);
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      cameraRef.current?.flyTo({ center: [lng, lat], duration: 12000, zoom: 16 });
      setCurrentUserLocation([lng, lat])
    }
  }

  async function requestLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }
    getLocation();
  }

  requestLocation();


  async function searchForPlace() {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeToSearch)}&format=jsonv2&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ConnecteoAPP/1.0 (fiaroiarilanjaramahaliarivo@gmail.com)',
      },
    });
    const data = await response.json();
    if (data && data.length > 0) {
      const place = data[0];
      const pLat = parseFloat(place.lat);
      const pLng = parseFloat(place.lon);
      cameraRef.current?.flyTo({ center: [pLng, pLat], zoom: 10, duration: 12000 });
    }
  }


  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map</Text>
          <Map ref={mapRef} mapStyle="https://tiles.openfreemap.org/styles/liberty" style={styles.map} >
            <Camera
              ref={cameraRef}
            />
            {currentUserLocation && (
              <Marker
                id='user'
                lngLat={currentUserLocation}
              >
                <View style={styles.userMarker} />
              </Marker>
            )}
          </Map>
          <MapSearchBar
            placeToSearch={placeToSearch}
            searchForPlace={searchForPlace}
            setPlaceToSearch={setPlaceToSearch}
          />
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
                position: 'absolute',
                bottom: '10%',
                right: '10%'
              }
            ]}
            onPress={getLocation}
          >
            <Text style={styles.focusText}>Focus</Text>
          </Pressable>
        </View>
        <BottomNavigation activeTab="map" />
      </SafeAreaView >
    </View >
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
  map: {
    width: '100%',
    height: '90%'
  },
  focusText: {
    borderWidth: 1,
    padding: 7,
    fontSize: 20,
    borderRadius: 5
  },
  userMarker: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 15
  }
});