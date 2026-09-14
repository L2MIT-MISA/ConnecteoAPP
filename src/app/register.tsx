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
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function handleCreateAccount() {
    setErreur(null);
    setEnCours(true);

    if (!name.trim()) {
      setErreur('Veuillez entrer votre nom complet');
      setEnCours(false);
      return;
    }
    if (!email.trim()) {
      setErreur('Veuillez entrer votre e-mail');
      setEnCours(false);
      return;
    }
    if (!phone.trim()) {
      setErreur('Veuillez entrer votre téléphone');
      setEnCours(false);
      return;
    }
    if (password.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      setEnCours(false);
      return;
    }
    if (password !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      setEnCours(false);
      return;
    }

    try {
      const { erreur: messageErreur } = await signUp(name, email, password, phone);

      if (messageErreur) {
        setErreur(messageErreur);
        return;
      }

      router.replace('/message');
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : 'Erreur inconnue';
      setErreur(`Erreur réseau : ${message}`);
    } finally {
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
                  label="Téléphone"
                  placeholder="+261 34 00 000 00"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
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

              {erreur && <Text style={styles.errorText}>{erreur}</Text>}

              <Pressable
                style={[styles.submitButton, enCours && styles.submitButtonDisabled]}
                onPress={handleCreateAccount}
                disabled={enCours}>
                <Text style={styles.submitText}>
                  {enCours ? 'Création...' : 'Créer mon compte'}
                </Text>
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
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  textContentType?: 'emailAddress' | 'name' | 'newPassword' | 'telephoneNumber';
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

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
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
    backgroundColor: '#16452d',
  },
  logoMark: { color: '#ffffff', fontSize: 25, lineHeight: 27 },
  heading: { alignItems: 'center', gap: 4, marginTop: -4 },
  title: { color: '#102c1c', fontSize: 19, fontWeight: '700' },
  subtitle: { color: '#737b8d', fontSize: 13 },
  fields: { gap: 13 },
  field: { gap: 6 },
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
    marginTop: -1,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#c0392b', fontSize: 12, textAlign: 'center', marginTop: 8 },
  loginPrompt: { color: '#737b8d', fontSize: 12, textAlign: 'center', marginTop: -6 },
  loginLink: { color: '#16452d', fontWeight: '700' },
});
