import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

import { useSession } from '../auth/session';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function LoginScreen() {
  const styles = useThemedStyles(createStyles);
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
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
          <View style={styles.content}>
            <View style={styles.logo}>
              <Text style={styles.logoMark}>✣</Text>
            </View>

            <View style={styles.heading}>
              <Text style={styles.title}>Connecteo</Text>
              <Text style={styles.subtitle}>Communiquer, connecté ou non</Text>
            </View>

            <View style={styles.fields}>
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
                textContentType="password"
              />
            </View>

            <Pressable style={styles.submitButton} onPress={handleLogin}>
              <Text style={styles.submitText}>Se connecter</Text>
            </Pressable>

            <Link href="/register" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.registerPrompt}>
                  Pas de compte ? <Text style={styles.registerLink}>Créer un compte</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
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
  textContentType?: 'emailAddress' | 'password';
};

function FormField({ label, ...inputProps }: FormFieldProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.placeholder}
        style={styles.input}
      />
    </View>
  );
}

// petit import manquant — ajoute-le en haut :


function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    safeArea: { width: '100%', maxWidth: 430, flex: 1 },
    keyboardAvoidingView: { flex: 1 },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 49,
      paddingBottom: 16,
      gap: 27,
    },
    logo: {
      width: 57,
      height: 57,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: c.primaryDark,
      marginBottom: 1,
    },
    logoMark: { color: c.textLight, fontSize: 31, lineHeight: 33 },
    heading: { alignItems: 'center', gap: 4, marginTop: -1 },
    title: { color: c.textDark, fontSize: 21, fontWeight: '700' },
    subtitle: { color: c.textMuted, fontSize: 13 },
    fields: { gap: 27 },
    field: { gap: 7 },
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
      marginTop: 1,
    },
    submitText: { color: c.textLight, fontSize: 13, fontWeight: '700' },
    registerPrompt: {
      color: c.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 1,
    },
    registerLink: { color: c.primary, fontWeight: '700' },
  });
}