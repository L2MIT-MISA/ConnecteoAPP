import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const [name, setName] = useState('M. Rakoto');
  const [email, setEmail] = useState('m.rakoto@email.com');
  const [phone, setPhone] = useState('+261 34 00 000 00');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <Text style={styles.title}>Mon compte</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MR</Text>
          </View>
          <Pressable>
            <Text style={styles.changePhoto}>Changer la photo</Text>
          </Pressable>

          <View style={styles.form}>
            <AccountField label="Nom complet" value={name} onChangeText={setName} textContentType="name" />
            <AccountField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <AccountField label="Téléphone" value={phone} onChangeText={setPhone} textContentType="telephoneNumber" />
          </View>

          <Pressable style={styles.saveButton}>
            <Text style={styles.saveText}>Enregistrer les modifications</Text>
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
};

function AccountField({ label, ...inputProps }: AccountFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps} autoCapitalize="none" style={styles.input} />
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
  saveText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
});
