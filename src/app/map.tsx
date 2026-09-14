import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';
import MapSearchBar from '../components/mapSearchBar';

const STADIA_API_KEY = process.env.EXPO_PUBLIC_STADIA_API_KEY;

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
  const [placeToSearch, setPlaceToSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [currentUserLocation, setCurrentUserLocation] = React.useState<
    [lng: number, lat: number] | undefined
  >(undefined);

  const [result, setResult] = React.useState<{
    coordinate: [number, number];
    name: string;
  } | null>(null);

  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  async function getLocation(): Promise<[number, number]> {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const nextLocation: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];
      setCurrentUserLocation(nextLocation);
      return nextLocation;
    } catch (error) {
      setErrorMsg('Unable to get your current location.');
      throw error;
    }
  }

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      await getLocation();
    } catch (error) {
      console.error('Location request failed:', error);
    }
  }

  useEffect(() => {
    requestLocation();
  }, []);

  async function focusOnUser() {
    try {
      const nextLocation = await getLocation();
      cameraRef.current?.flyTo({
        center: nextLocation,
        duration: 12000,
        zoom: 16,
      });
    } catch (error) {
      console.error('Focus on user failed:', error);
    }
  }

  const searchPlace = async () => {
    if (!placeToSearch.trim()) return;
    setLoading(true);
    try {
      const url = `https://api.stadiamaps.com/geocoding/v1/search?api_key=${STADIA_API_KEY}&text=${encodeURIComponent(placeToSearch)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        console.log('No results found');
        return;
      }

      const place = data.features[0];
      const [lng, lat] = place.geometry.coordinates;
      console.log(place);


      setResult({ coordinate: [lng, lat], name: place.properties.label });
      cameraRef.current?.flyTo({ center: [lng, lat], zoom: 5, duration: 12000 });
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map</Text>

          <Map
            ref={mapRef}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            style={styles.map}
          >
            <Camera ref={cameraRef} />
            {currentUserLocation && (
              <Marker id="user" lngLat={currentUserLocation}>
                <View style={styles.userMarker} />
              </Marker>
            )}
          </Map>

          <MapSearchBar
            placeToSearch={placeToSearch}
            searchPlace={searchPlace}
            setPlaceToSearch={setPlaceToSearch}
          />

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
                position: 'absolute',
                bottom: '10%',
                right: '10%',
              },
            ]}
            onPress={focusOnUser}
          >
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
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textDark,
    padding: 10,
  },
  map: {
    width: '100%',
    height: '90%',
  },
  focusText: {
    borderWidth: 1,
    padding: 7,
    fontSize: 20,
    borderRadius: 5,
  },
  userMarker: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 15,
  },
});