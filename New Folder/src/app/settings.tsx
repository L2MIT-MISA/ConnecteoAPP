import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../auth/session';
import { BottomNavigation } from '../components/bottom-navigation';

const COLORS = {
  dark: '#1B3A2B',
  darkGreen: '#1F4A32',
  accentGreen: '#2E6B4A',
  background: '#EFEBE4',
  textDark: '#1B1B1B',
  textLight: '#FFFFFF',
  subtitle: '#A9C2B3',
  danger: '#D9534F',
  border: '#E3DED5',
};

type SettingsItemProps = {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onPress?: () => void;
};

function SettingsItem({ icon, label, danger = false, onPress }: SettingsItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.item, pressed && styles.itemPressed]} onPress={onPress}>
      <View style={styles.itemIcon}>{icon}</View>
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { signOut } = useSession();

  function handleLogout() {
    signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
          <View>
            <Text style={styles.profileName}>M. Rakoto</Text>
          </View>
        </View>

        <View style={styles.list}>
          <SettingsItem
            icon={<Ionicons name="person-outline" size={22} color={COLORS.dark} />}
            label="Compte"
            onPress={() => router.push('/settings/account')}
          />
          <SettingsItem
            icon={<Ionicons name="notifications-outline" size={22} color={COLORS.dark} />}
            label="Notifications"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem icon={<Feather name="wifi" size={22} color={COLORS.dark} />} label="Module LoRa" />
          <SettingsItem
            icon={<Ionicons name="shield-outline" size={22} color={COLORS.dark} />}
            label="Sécurité"
            onPress={() => router.push('/settings/security')}
          />
          <SettingsItem
            icon={<Feather name="log-out" size={22} color={COLORS.danger} />}
            label="Déconnexion"
            danger
            onPress={handleLogout}
          />
        </View>

        <BottomNavigation activeTab="settings" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: COLORS.background },
  container: { width: '100%', maxWidth: 430, flex: 1 },
  header: { alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.textDark },
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
  avatarText: { color: COLORS.textLight, fontWeight: '700', fontSize: 15 },
  profileName: { color: COLORS.textLight, fontSize: 17, fontWeight: '700' },
  profileStatus: { color: COLORS.subtitle, fontSize: 13, marginTop: 2 },
  list: { marginTop: 24, marginHorizontal: 20 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemPressed: { opacity: 0.6 },
  itemIcon: { width: 30, alignItems: 'center', marginRight: 12 },
  itemLabel: { fontSize: 17, color: COLORS.textDark },
  itemLabelDanger: { color: COLORS.danger },
});
