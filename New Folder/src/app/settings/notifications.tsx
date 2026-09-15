import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationOptionProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function NotificationOption({ title, description, value, onValueChange }: NotificationOptionProps) {
  return (
    <View style={styles.option}>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e6e1d6', true: '#2e6b4a' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const [newMessages, setNewMessages] = useState(true);
  const [contactRequests, setContactRequests] = useState(true);
  const [networkAlerts, setNetworkAlerts] = useState(false);
  const [sound, setSound] = useState(true);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.options}>
          <NotificationOption title="Nouveaux messages" description="Recevoir une alerte à chaque message" value={newMessages} onValueChange={setNewMessages} />
          <NotificationOption title="Demandes de contact" description="Être averti des nouvelles demandes" value={contactRequests} onValueChange={setContactRequests} />
          <NotificationOption title="Alertes réseau" description="État des relais à proximité" value={networkAlerts} onValueChange={setNetworkAlerts} />
          <NotificationOption title="Son" description="Jouer un son à la réception" value={sound} onValueChange={setSound} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
  safeArea: { width: '100%', maxWidth: 430, flex: 1, paddingHorizontal: 40 },
  title: { color: '#102c1c', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 26, marginBottom: 15 },
  options: { gap: 9 },
  option: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#e0e2e5', borderRadius: 12, backgroundColor: '#ffffff', paddingHorizontal: 15 },
  optionText: { flex: 1, alignItems: 'center' },
  optionTitle: { color: '#253041', fontSize: 13, fontWeight: '700' },
  optionDescription: { color: '#70798a', fontSize: 11, textAlign: 'center', marginTop: 1 },
});
