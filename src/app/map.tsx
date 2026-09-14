import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/bottom-navigation';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function MapScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map</Text>
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
    header: { alignItems: 'center', paddingVertical: 20 },
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
  });
}