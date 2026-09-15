import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';
import Information from '../components/information';
import MapSearchBar from '../components/mapSearchBar';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

const STADIA_API_KEY = process.env.EXPO_PUBLIC_STADIA_API_KEY;

export default function StatsScreen() {
  const styles = useThemedStyles(createStyles);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [placeToSearch, setPlaceToSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [nodePressed, setNodePressed] = React.useState(false);

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
              <Marker id="user" lngLat={currentUserLocation} onPress={() => setNodePressed(true)}>
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
                bottom: '15%',
                right: '5%',
                borderRadius: 10,
                width: 30,
                height: 30,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              },
            ]}
            onPress={focusOnUser}
          >
            <Image source={require('../../assets/images/focus.png')} />
          </Pressable>
          {
            nodePressed ? <Information setNodePressed={setNodePressed} /> : undefined
          }
        </View>

        <BottomNavigation activeTab="map" />
      </SafeAreaView>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    container: { width: '100%', maxWidth: 430, flex: 1 },
    header: { alignItems: 'center', paddingVertical: 20, padding: 10 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: c.textDark },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.primaryDark,
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    profileName: { color: c.textLight, fontSize: 17, fontWeight: '700' },
    profileStatus: { color: c.subtitle, fontSize: 13, marginTop: 2 },
    list: { marginTop: 24, marginHorizontal: 20 },
    statCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    statIcon: { width: 30, alignItems: 'center', marginRight: 12 },
    statValue: { fontSize: 18, fontWeight: '700', color: c.textDark },
    statLabel: { fontSize: 13, color: c.textMuted, marginTop: 2 },
    map: {
      marginTop: 20,
      width: '100%',
      height: '90%',
    },
    userMarker: {
      width: 10,
      height: 10,
      backgroundColor: 'red',
      borderRadius: 15,
    }
  });
}
