import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function PasswordField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} secureTextEntry style={styles.input} placeholder="••••••••" placeholderTextColor="#747d8d" />
    </View>
  );
}

export default function SecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Sécurité</Text>
        <View style={styles.form}>
          <PasswordField label="Mot de passe actuel" value={currentPassword} onChangeText={setCurrentPassword} />
          <PasswordField label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} />
          <PasswordField label="Confirmer le nouveau mot de passe" value={confirmation} onChangeText={setConfirmation} />
        </View>
        <Pressable style={styles.updateButton}>
          <Text style={styles.updateText}>Mettre à jour le mot de passe</Text>
        </Pressable>
        <View style={styles.twoFactorCard}>
          <View style={styles.twoFactorText}>
            <Text style={styles.twoFactorTitle}>Authentification à deux facteurs</Text>
            <Text style={styles.twoFactorDescription}>Sécurité renforcée à la connexion</Text>
          </View>
          <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} trackColor={{ false: '#e6e1d6', true: '#2e6b4a' }} thumbColor="#ffffff" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
  safeArea: { width: '100%', maxWidth: 430, flex: 1, paddingHorizontal: 41 },
  title: { color: '#102c1c', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 27, marginBottom: 15 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { color: '#70798a', fontSize: 12, textAlign: 'center' },
  input: { height: 42, borderWidth: 1, borderColor: '#dfe1e5', borderRadius: 10, backgroundColor: '#ffffff', paddingHorizontal: 14, color: '#18212d', fontSize: 14 },
  updateButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#16452d', marginTop: 18 },
  updateText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  twoFactorCard: { minHeight: 85, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e0e2e5', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 15, marginTop: 19 },
  twoFactorText: { flex: 1, alignItems: 'center' },
  twoFactorTitle: { color: '#253041', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  twoFactorDescription: { color: '#70798a', fontSize: 11, textAlign: 'center', marginTop: 2 },
});
