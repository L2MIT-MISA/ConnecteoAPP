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
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleLogin() {
    setErreur(null);
    setEnCours(true);

    try {
      const { erreur: messageErreur } = await signIn(email, password);

      if (messageErreur) {
        setErreur(messageErreur);
        return;
      }

      router.replace('/message');
    } catch (exception) {
      // Capte les erreurs qui ne passent pas par le { erreur } habituel,
      // typiquement une exception réseau (serveur inaccessible, etc.).
      const message = exception instanceof Error ? exception.message : 'Erreur inconnue';
      setErreur(`Erreur réseau : ${message}`);
    } finally {
      // "finally" garantit que le bouton se débloque dans TOUS les cas,
      // succès, erreur applicative, ou exception — plus jamais de blocage.
      setEnCours(false);
    }
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

            {erreur && <Text style={styles.errorText}>{erreur}</Text>}

            <Pressable
              style={[styles.submitButton, enCours && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={enCours}>
              <Text style={styles.submitText}>
                {enCours ? 'Connexion...' : 'Se connecter'}
              </Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
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
    backgroundColor: '#16452d',
    marginBottom: 1,
  },
  logoMark: { color: '#ffffff', fontSize: 31, lineHeight: 33 },
  heading: { alignItems: 'center', gap: 4, marginTop: -1 },
  title: { color: '#102c1c', fontSize: 21, fontWeight: '700' },
  subtitle: { color: '#737b8d', fontSize: 13 },
  fields: { gap: 27 },
  field: { gap: 7 },
  label: { color: '#6f7788', fontSize: 12, textAlign: 'center' },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: '#dfe1e5',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    color: '#18212d',
    fontSize: 14,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: '#16452d',
    marginTop: 1,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#c0392b', fontSize: 12, textAlign: 'center' },
  registerPrompt: { color: '#737b8d', fontSize: 12, textAlign: 'center', marginTop: 1 },
  registerLink: { color: '#16452d', fontWeight: '700' },
});
