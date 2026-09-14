import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../auth/session';
import { BottomNavigation } from '../components/bottom-navigation';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';
import { ThemeToggle } from '../theme/ThemeToggle';

type SettingsItemProps = {
  icon: (colors: ThemeColors) => ReactNode;
  label: string;
  danger?: boolean;
  onPress?: () => void;
};

function SettingsItem({ icon, label, danger = false, onPress }: SettingsItemProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={onPress}
    >
      <View style={styles.itemIcon}>{icon(colors)}</View>
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
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
          <ThemeToggle />
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
            icon={(c) => <Ionicons name="person-outline" size={22} color={c.textDark} />}
            label="Compte"
            onPress={() => router.push('/settings/account')}
          />
          <SettingsItem
            icon={(c) => (
              <Ionicons name="notifications-outline" size={22} color={c.textDark} />
            )}
            label="Notifications"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon={(c) => <Feather name="wifi" size={22} color={c.textDark} />}
            label="Module LoRa"
          />
          <SettingsItem
            icon={(c) => (
              <Ionicons name="shield-outline" size={22} color={c.textDark} />
            )}
            label="Sécurité"
            onPress={() => router.push('/settings/security')}
          />
          <SettingsItem
            icon={(c) => <Feather name="log-out" size={22} color={c.danger} />}
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    container: { width: '100%', maxWidth: 430, flex: 1 },
    header: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 26, fontWeight: '700', color: c.textDark, flex: 1, textAlign: 'center' },
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
    avatarText: { color: c.textLight, fontWeight: '700', fontSize: 15 },
    profileName: { color: c.textLight, fontSize: 17, fontWeight: '700' },
    profileStatus: { color: c.subtitle, fontSize: 13, marginTop: 2 },
    list: { marginTop: 24, marginHorizontal: 20 },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    itemPressed: { opacity: 0.6 },
    itemIcon: { width: 30, alignItems: 'center', marginRight: 12 },
    itemLabel: { fontSize: 17, color: c.textDark },
    itemLabelDanger: { color: c.danger },
  });
}