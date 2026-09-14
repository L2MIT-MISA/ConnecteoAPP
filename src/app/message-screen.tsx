import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavigation } from '../components/bottom-navigation';
import { useMessaging, type Conversation } from '../messaging/store';
import { useThemedStyles, type ThemeColors } from '../theme/ThemeContext';

export default function MessageScreen() {
  const styles = useThemedStyles(createStyles);
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

        {/* Bouton flottant : nouveau message */}
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={() => router.push('/new-message')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>

        <BottomNavigation activeTab="messages" />
      </SafeAreaView>
    </View>
  );
}

export function MessageRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress?: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
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

function createStyles(c: ThemeColors) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', backgroundColor: c.background },
    safeArea: { width: '100%', maxWidth: 430, flex: 1 },
    title: {
      color: c.textDark,
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
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.cardBg,
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
      backgroundColor: c.primaryDark,
    },
    avatarText: { color: c.textLight, fontSize: 12, fontWeight: '700' },
    messageContent: { flex: 1, gap: 3 },
    name: { color: c.textDark, fontSize: 13, fontWeight: '700' },
    preview: { color: c.textMuted, fontSize: 11 },
    metadata: {
      alignSelf: 'stretch',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    time: { color: c.textMuted, fontSize: 10, fontFamily: 'monospace' },
    unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef8b3c' },

    // Bouton flottant
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 96, // au-dessus de la BottomNavigation
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    fabPressed: { opacity: 0.85 },
    fabIcon: { color: c.textLight, fontSize: 28, fontWeight: '700', marginTop: -2 },
  });
}