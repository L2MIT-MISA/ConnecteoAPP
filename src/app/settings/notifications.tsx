import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, type ThemeColors } from '../../theme/ThemeContext';

type NotificationOptionProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function NotificationOption({
  title,
  description,
  value,
  onValueChange,
}: NotificationOptionProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.option}>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.cardBg}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const styles = useThemedStyles(createStyles);
  const [newMessages, setNewMessages] = useState(true);
  const [contactRequests, setContactRequests] = useState(true);
  const [networkAlerts, setNetworkAlerts] = useState(false);
  const [sound, setSound] = useState(true);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.options}>
          <NotificationOption
            title="Nouveaux messages"
            description="Recevoir une alerte à chaque message"
            value={newMessages}
            onValueChange={setNewMessages}
          />
          <NotificationOption
            title="Demandes de contact"
            description="Être averti des nouvelles demandes"
            value={contactRequests}
            onValueChange={setContactRequests}
          />
          <NotificationOption
            title="Alertes réseau"
            description="État des relais à proximité"
            value={networkAlerts}
            onValueChange={setNetworkAlerts}
          />
          <NotificationOption
            title="Son"
            description="Jouer un son à la réception"
            value={sound}
            onValueChange={setSound}
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
      paddingHorizontal: 40,
    },
    title: {
      color: c.textDark,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 26,
      marginBottom: 15,
    },
    options: { gap: 9 },
    option: {
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      paddingHorizontal: 15,
    },
    optionText: { flex: 1, alignItems: 'center' },
    optionTitle: { color: c.textDark, fontSize: 13, fontWeight: '700' },
    optionDescription: {
      color: c.textMuted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 1,
    },
  });
}