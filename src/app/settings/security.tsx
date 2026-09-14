import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

function PasswordField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
}

export default function SecurityScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Sécurité</Text>
        <View style={styles.form}>
          <PasswordField
            label="Mot de passe actuel"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordField
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <PasswordField
            label="Confirmer le nouveau mot de passe"
            value={confirmation}
            onChangeText={setConfirmation}
          />
        </View>
        <Pressable style={styles.updateButton}>
          <Text style={styles.updateText}>Mettre à jour le mot de passe</Text>
        </Pressable>
        <View style={styles.twoFactorCard}>
          <View style={styles.twoFactorText}>
            <Text style={styles.twoFactorTitle}>
              Authentification à deux facteurs
            </Text>
            <Text style={styles.twoFactorDescription}>
              Sécurité renforcée à la connexion
            </Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.cardBg}
            ios_backgroundColor={colors.border}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    safeArea: {
      width: '100%',
      maxWidth: 430,
      flex: 1,
      paddingHorizontal: 41,
    },
    title: {
      color: c.textDark,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 27,
      marginBottom: 15,
    },
    form: { gap: 14 },
    field: { gap: 6 },
    label: { color: c.textMuted, fontSize: 12, textAlign: 'center' },
    input: {
      height: 42,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.inputBg,
      paddingHorizontal: 14,
      color: c.textDark,
      fontSize: 14,
    },
    updateButton: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: c.primaryDark,
      marginTop: 18,
    },
    updateText: { color: c.textLight, fontSize: 13, fontWeight: '700' },
    twoFactorCard: {
      minHeight: 85,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      paddingHorizontal: 15,
      marginTop: 19,
    },
    twoFactorText: { flex: 1, alignItems: 'center' },
    twoFactorTitle: {
      color: c.textDark,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },
    twoFactorDescription: {
      color: c.textMuted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 2,
    },
  });
}