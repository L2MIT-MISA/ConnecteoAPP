import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeMode } from './ThemeContext';

type Variant = 'icons' | 'switch';

export const ThemeToggle: React.FC<{ variant?: Variant }> = ({
  variant = 'icons',
}) => {
  const { mode, setMode, toggle, colors, theme } = useTheme();

  if (variant === 'switch') {
    return (
      <Pressable
        onPress={toggle}
        style={[styles.switch, { borderColor: colors.border, backgroundColor: colors.cardBg }]}
        accessibilityRole="switch"
        accessibilityState={{ checked: theme === 'dark' }}
      >
        <Ionicons
          name={theme === 'dark' ? 'moon' : 'sunny'}
          size={20}
          color={colors.primary}
        />
      </Pressable>
    );
  }

  const OPTIONS: { key: ThemeMode; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'auto', icon: 'phone-portrait-outline' },
    { key: 'light', icon: 'sunny-outline' },
    { key: 'dark', icon: 'moon-outline' },
  ];

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = mode === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => setMode(opt.key)}
            style={[
              styles.btn,
              {
                borderColor: active ? colors.primaryDark : colors.border,
                backgroundColor: active ? colors.primaryDark : colors.cardBg,
              },
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={16}
              color={active ? colors.textLight : colors.textDark}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  btn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
