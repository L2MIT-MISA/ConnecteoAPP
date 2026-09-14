import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { cloneElement, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

type Tab = 'saved' | 'messages' | 'network' | 'settings' | 'stats' | 'map';

type BottomNavigationProps = {
  activeTab: Tab;
};

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.bottomBar}>
      <NavigationButton
        active={activeTab === 'map'}
        icon={<Ionicons name="bookmark-outline" size={22} />}
        onPress={() => router.navigate('/map')}
      />
      <NavigationButton
        active={activeTab === 'messages'}
        icon={<Ionicons name="chatbubble-outline" size={22} />}
        onPress={() => router.navigate('/message')}
      />
      <NavigationButton
        active={activeTab === 'network'}
        icon={<Feather name="wifi" size={22} />}
        onPress={() => router.navigate('/network')}
      />
      <NavigationButton
        active={activeTab === 'stats'}
        icon={<Ionicons name="stats-chart-outline" size={22} />}
        onPress={() => router.navigate('/stats')}
      />
      <NavigationButton
        active={activeTab === 'settings'}
        icon={<Ionicons name="settings-outline" size={22} />}
        onPress={() => router.navigate('/settings')}
      />
    </View>
  );
}

type NavigationButtonProps = {
  icon: ReactElement<{ color?: string }>;
  active?: boolean;
  onPress?: () => void;
};

function NavigationButton({ icon, active = false, onPress }: NavigationButtonProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  // En mode actif → icône blanche sur fond vert
  // En mode inactif → icône qui suit le thème (sombre ou clair)
  const color = active ? colors.textLight : colors.textDark;

  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [
        styles.navButton,
        active && styles.navButtonActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {cloneElement(icon, { color })}
    </Pressable>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    bottomBar: {
      position: 'absolute',
      right: 40,
      bottom: 17,
      left: 40,
      height: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderRadius: 32,
      backgroundColor: c.cardBg,
      paddingHorizontal: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    navButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
    },
    navButtonActive: { backgroundColor: c.primaryDark },
    pressed: { opacity: 0.65 },
  });
}