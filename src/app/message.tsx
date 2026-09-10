import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../components/bottom-navigation';
import { type Conversation, useMessaging } from '../messaging/store';

export default function MessageScreen() {
  const { conversations } = useMessaging();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Messages</Text>
        <FlatList
          data={conversations}
          keyExtractor={(conversation) => conversation.id}
          renderItem={({ item }) => (
            <MessageRow
              conversation={item}
              onPress={() =>
                router.push({
                  pathname: '/conversation/[conversationId]',
                  params: { conversationId: item.id },
                })
              }
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        <BottomNavigation activeTab="messages" />
      </SafeAreaView>
    </View>
  );
}

/** Affiche un fil que le backend a fourni via `setConversations` ou `upsertConversation`. */
export function MessageRow({ conversation, onPress }: { conversation: Conversation; onPress?: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{conversation.initials}</Text>
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.name} numberOfLines={1}>
          {conversation.name}
        </Text>
        {!!conversation.lastMessage && (
          <Text style={styles.preview} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
        )}
      </View>
      <View style={styles.metadata}>
        {!!conversation.updatedAt && <Text style={styles.time}>{conversation.updatedAt}</Text>}
        {!!conversation.unreadCount && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: '#f4f1ea' },
  safeArea: { width: '100%', maxWidth: 430, flex: 1 },
  title: {
    color: '#102c1c',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 15,
  },
  list: { paddingHorizontal: 44, paddingBottom: 112, gap: 8 },
  row: {
    minHeight: 61,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e2e5',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowPressed: { opacity: 0.72 },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#16452d',
  },
  avatarText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  messageContent: { flex: 1, gap: 3 },
  name: { color: '#273140', fontSize: 13, fontWeight: '700' },
  preview: { color: '#697387', fontSize: 11 },
  metadata: { alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between' },
  time: { color: '#6f7888', fontSize: 10, fontFamily: 'monospace' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef8b3c' },
});
