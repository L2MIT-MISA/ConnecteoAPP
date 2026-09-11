import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type ChatMessage, useMessaging } from '../../messaging/store';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { conversations, messagesByConversation } = useMessaging();
  const conversation = conversations.find((item) => item.id === conversationId);
  const messages = messagesByConversation[conversationId] ?? [];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable hitSlop={10} style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#1b3a2b" />
          </Pressable>
          {conversation && (
            <>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{conversation.initials}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.name}>{conversation.name}</Text>
                {conversation.isOnline && <Text style={styles.online}>● En ligne</Text>}
              </View>
            </>
          )}
        </View>

        <FlatList
          data={messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composer}>
          <TextInput
            editable={false}
            placeholder="Écrire un message…"
            placeholderTextColor="#727b8c"
            style={styles.input}
          />
          <View style={styles.sendButton}>
            <Feather name="send" size={20} color="#ffffff" />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Affiche un message que le backend a fourni via `setMessages` ou `appendMessage`. */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isOutgoing = message.direction === 'outgoing';

  return (
    <View style={[styles.bubble, isOutgoing ? styles.outgoingBubble : styles.incomingBubble]}>
      <Text style={[styles.messageBody, isOutgoing && styles.outgoingText]}>{message.body}</Text>
      <Text style={[styles.messageTime, isOutgoing && styles.outgoingTime]}>{message.sentAt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
  safeArea: { width: '100%', maxWidth: 430, flex: 1 },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e2e5',
    backgroundColor: '#ffffff',
    paddingHorizontal: 17,
  },
  backButton: { width: 24, alignItems: 'center' },
  avatar: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#16452d',
  },
  avatarText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  headerText: { gap: 1 },
  name: { color: '#142238', fontSize: 14, fontWeight: '700' },
  online: { color: '#34754d', fontSize: 10 },
  messages: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 76, gap: 9 },
  bubble: { maxWidth: '76%', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 9 },
  incomingBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e2e5',
    backgroundColor: '#ffffff',
  },
  outgoingBubble: { alignSelf: 'flex-end', backgroundColor: '#16452d' },
  messageBody: { color: '#172235', fontSize: 13, lineHeight: 18, textAlign: 'center' },
  outgoingText: { color: '#ffffff' },
  messageTime: { color: '#788192', fontSize: 9, textAlign: 'center', marginTop: 3 },
  outgoingTime: { color: '#b2d1bd' },
  composer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#dedbd4',
    borderRadius: 20,
    backgroundColor: '#f4f1ea',
    paddingHorizontal: 14,
    color: '#172235',
    fontSize: 12,
  },
  sendButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#16452d',
  },
});
