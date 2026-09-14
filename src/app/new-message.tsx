import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendMessageToGateway } from '../messaging/lora-api';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function NewMessageScreen() {
  const styles = useThemedStyles(createStyles);
  const [dest, setDest] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!dest.trim() || !message.trim()) {
      setError('Renseigne un destinataire et un message.');
      return;
    }

    setSending(true);
    setError(null);

    const result = await sendMessageToGateway({ dest: dest.trim(), payload: message.trim() });

    setSending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.back();
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Nouveau message</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Destinataire (ID)</Text>
          <TextInput
            style={styles.input}
            value={dest}
            onChangeText={setDest}
            placeholder="ex: bob"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Écris ton message..."
            multiline
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Envoyer</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancel}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    safeArea: { width: '100%', maxWidth: 430, flex: 1, paddingHorizontal: 24 },
    title: {
      color: c.textDark,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 24,
    },
    field: { marginBottom: 16, gap: 6 },
    label: { color: c.textMuted, fontSize: 12, fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: c.textDark,
      backgroundColor: c.cardBg,
    },
    messageInput: { minHeight: 100, textAlignVertical: 'top' },
    error: { color: '#ef4444', fontSize: 12, marginBottom: 12 },
    sendButton: {
      backgroundColor: c.primaryDark,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    sendButtonPressed: { opacity: 0.8 },
    sendButtonText: { color: c.textLight, fontSize: 14, fontWeight: '700' },
    cancel: { marginTop: 12, alignItems: 'center' },
    cancelText: { color: c.textMuted, fontSize: 13 },
  });
}