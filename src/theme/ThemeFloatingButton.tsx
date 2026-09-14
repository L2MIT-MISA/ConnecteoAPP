import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type ThemeMode } from './ThemeContext';

const OPTIONS: {
  key: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'auto', label: 'Automatique', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Clair', icon: 'sunny-outline' },
  { key: 'dark', label: 'Sombre', icon: 'moon-outline' },
];

export function ThemeFloatingButton() {
  const { mode, setMode, colors, theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  // Appui long → toggle rapide ; appui court → ouvrir le menu
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        onLongPress={toggle}
        style={[
          styles.fab,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.border,
          },
        ]}
        accessibilityLabel="Changer de thème"
        accessibilityHint="Appui court : ouvrir le menu. Appui long : basculer clair/sombre."
      >
        <Ionicons
          name={theme === 'dark' ? 'moon' : 'sunny'}
          size={22}
          color={colors.primary}
        />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.textDark }]}>
              Apparence
            </Text>

            {OPTIONS.map((opt) => {
              const active = mode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.row,
                    {
                      backgroundColor: active ? colors.cardBgAlt : 'transparent',
                      borderColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setMode(opt.key);
                    setOpen(false);
                  }}
                >
                  <Ionicons name={opt.icon} size={20} color={colors.textDark} />
                  <Text style={[styles.rowLabel, { color: colors.textDark }]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    top: 60,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  rowLabel: { flex: 1, fontSize: 15 },
});
