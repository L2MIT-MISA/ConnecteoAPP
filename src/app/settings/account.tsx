import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../../auth/session';

export default function AccountScreen() {
  const { user, profil, updateProfil } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  useEffect(() => {
    if (profil) {
      setName(profil.full_name);
      setEmail(profil.email ?? '');
      setPhone(profil.phoneNumber ?? '');
    } else if (user) {
      setEmail(user.email ?? '');
    }
  }, [profil, user]);

  async function handleSave() {
    setErreur(null);
    setSucces(null);
    setEnCours(true);

    if (!name.trim()) {
      setErreur('Veuillez entrer votre nom complet');
      setEnCours(false);
      return;
    }

    try {
      const { erreur: messageErreur } = await updateProfil(name, phone);

      if (messageErreur) {
        setErreur(messageErreur);
        return;
      }

      setSucces('Modifications enregistrées');
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
          style={styles.content}
          behavior={Platform.select({ ios: 'padding', default: undefined })}
        >
          <Text style={styles.title}>Mon compte</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}{name.split(' ').pop()?.charAt(0).toUpperCase() || ''}
            </Text>
          </View>
          <Pressable>
            <Text style={styles.changePhoto}>Changer la photo</Text>
          </Pressable>

          <View style={styles.form}>
            <AccountField
              label="Nom complet"
              value={name}
              onChangeText={setName}
              textContentType="name"
            />
            <AccountField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={false}
            />
            <AccountField
              label="Téléphone"
              value={phone}
              onChangeText={setPhone}
              textContentType="telephoneNumber"
            />
          </View>

          {erreur && <Text style={styles.errorText}>{erreur}</Text>}
          {succes && <Text style={styles.succesText}>{succes}</Text>}

          <Pressable
            style={[styles.saveButton, enCours && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={enCours}>
            <Text style={styles.saveText}>
              {enCours ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

type AccountFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address';
  textContentType: 'emailAddress' | 'name' | 'telephoneNumber';
  editable?: boolean;
};

function AccountField({ label, editable = true, ...inputProps }: AccountFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} autoCapitalize="none" style={styles.input} editable={editable} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
  safeArea: { width: '100%', maxWidth: 430, flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 42, paddingTop: 27 },
  title: { color: '#102c1c', fontSize: 20, fontWeight: '700', marginBottom: 25 },
  avatar: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: '#16452d' },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '500' },
  changePhoto: { color: '#16452d', fontSize: 11, fontWeight: '700', marginTop: 9 },
  form: { width: '100%', gap: 14, marginTop: 21 },
  field: { gap: 6 },
  label: { color: '#70798a', fontSize: 12, textAlign: 'center' },
  input: { height: 42, borderWidth: 1, borderColor: '#dfe1e5', borderRadius: 10, backgroundColor: '#ffffff', paddingHorizontal: 14, color: '#18212d', fontSize: 14 },
  saveButton: { width: '100%', minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#16452d', marginTop: 18 },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  errorText: { color: '#c0392b', fontSize: 12, textAlign: 'center', marginTop: 8 },
  succesText: { color: '#16452d', fontSize: 12, textAlign: 'center', marginTop: 8 },
});
