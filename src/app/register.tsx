import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../auth/session';
import { useTheme, useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function RegisterScreen() {
  const styles = useThemedStyles(createStyles);
  const { signIn } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  function handleCreateAccount() {
    signIn();
    router.replace('/message');
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.select({ ios: 'padding', default: undefined })}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.logo}>
                <Text style={styles.logoMark}>✣</Text>
              </View>

              <View style={styles.heading}>
                <Text style={styles.title}>Créer un compte</Text>
                <Text style={styles.subtitle}>Rejoignez le réseau Connecteo</Text>
              </View>

              <View style={styles.fields}>
                <FormField
                  label="Nom complet"
                  placeholder="Prénom Nom"
                  value={name}
                  onChangeText={setName}
                  textContentType="name"
                />
                <FormField
                  label="E-mail"
                  placeholder="prenom.nom@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
                <FormField
                  label="Mot de passe"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="newPassword"
                />
                <FormField
                  label="Confirmer le mot de passe"
                  placeholder="••••••••"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  secureTextEntry
                  textContentType="newPassword"
                />
              </View>

              <Pressable style={styles.submitButton} onPress={handleCreateAccount}>
                <Text style={styles.submitText}>Créer mon compte</Text>
              </Pressable>

              <Link href="/login" asChild>
                <Text style={styles.loginPrompt}>
                  Déjà inscrit ? <Text style={styles.loginLink}>Se connecter</Text>
                </Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  textContentType?: 'emailAddress' | 'name' | 'newPassword';
};

function FormField({ label, ...inputProps }: FormFieldProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        autoCapitalize={inputProps.keyboardType === 'email-address' ? 'none' : 'words'}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    safeArea: { width: '100%', maxWidth: 430, flex: 1 },
    keyboardAvoidingView: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 50,
      paddingVertical: 28,
    },
    form: { gap: 22 },
    logo: {
      width: 44,
      height: 44,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: c.primaryDark,
    },
    logoMark: { color: c.textLight, fontSize: 25, lineHeight: 27 },
    heading: { alignItems: 'center', gap: 4, marginTop: -4 },
    title: { color: c.textDark, fontSize: 19, fontWeight: '700' },
    subtitle: { color: c.textMuted, fontSize: 13 },
    fields: { gap: 13 },
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
    submitButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 45,
      borderRadius: 10,
      backgroundColor: c.primaryDark,
      marginTop: -1,
    },
    submitText: { color: c.textLight, fontSize: 13, fontWeight: '700' },
    loginPrompt: {
      color: c.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: -6,
    },
    loginLink: { color: c.primary, fontWeight: '700' },
  });
}