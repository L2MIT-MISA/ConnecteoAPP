import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { cloneElement, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type Tab = 'saved' | 'messages' | 'network' | 'settings' | 'stats' | 'map';

type BottomNavigationProps = {
  activeTab: Tab;
};

const COLORS = {
  dark: '#1B3A2B',
  darkGreen: '#1F4A32',
  cardBg: '#FFFFFF',
};

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
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
      onPress={() =>router.navigate('/network')}
      />
      <NavigationButton
        active={activeTab === 'stats'}
        icon={<Ionicons name="stats-chart-outline" size={22}/>}
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
  const color = active ? COLORS.cardBg : COLORS.dark;

  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [styles.navButton, active && styles.navButtonActive, pressed && styles.pressed]}
      onPress={onPress}>
      {cloneElement(icon, { color })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  navButtonActive: { backgroundColor: COLORS.darkGreen },
  pressed: { opacity: 0.65 },
});
