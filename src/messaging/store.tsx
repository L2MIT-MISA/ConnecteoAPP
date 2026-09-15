import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSession } from '../auth/session';
import {
  hasSupabaseAccessToken,
  subscribeToSupabaseAccessToken,
  supabase,
  supabaseConfigurationError,
} from '../lib/supabase';

export type Conversation = {
  /** A 1-to-1 conversation is identified by the other participant's UUID. */
  id: string;
  initials: string;
  name: string;
  lastMessage?: string;
  updatedAt?: string;
  updatedAtTimestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  body: string;
  sentAt: string;
  direction: 'incoming' | 'outgoing';
};

type MessageRecord = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type ProfileRecord = {
  id: string;
  full_name: string | null;
};

type MessagingContextValue = {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
  refreshConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  markConversationRead: (conversationId: string) => Promise<void>;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fallbackName() {
  return 'Utilisateur';
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}

function toChatMessage(record: MessageRecord, currentUserId: string): ChatMessage {
  const conversationId = record.sender_id === currentUserId ? record.receiver_id : record.sender_id;
  return {
    id: record.id,
    conversationId,
    body: record.content,
    sentAt: formatTimestamp(record.created_at),
    direction: record.sender_id === currentUserId ? 'outgoing' : 'incoming',
  };
}

function toConversations(
  records: MessageRecord[],
  currentUserId: string,
  profilesById: Map<string, ProfileRecord>
): Conversation[] {
  const byParticipant = new Map<string, MessageRecord[]>();

  for (const record of records) {
    const participantId = record.sender_id === currentUserId ? record.receiver_id : record.sender_id;
    const participantMessages = byParticipant.get(participantId) ?? [];
    participantMessages.push(record);
    byParticipant.set(participantId, participantMessages);
  }

  return [...byParticipant.entries()]
    .map(([participantId, participantMessages]) => {
      const latest = participantMessages[0];
      const unreadCount = participantMessages.filter(
        (message) => message.receiver_id === currentUserId && !message.read
      ).length;

      const profileName = profilesById.get(participantId)?.full_name?.trim();
      const name = profileName || fallbackName();

      return {
        id: participantId,
        initials: initialsFromName(name),
        name,
        lastMessage: latest.content,
        updatedAt: formatTimestamp(latest.created_at),
        updatedAtTimestamp: latest.created_at,
        unreadCount,
      };
    })
    .sort((first, second) => (second.updatedAtTimestamp ?? '').localeCompare(first.updatedAtTimestamp ?? ''));
}

export function MessagingProvider({ children }: PropsWithChildren) {
  const { user } = useSession();
  const currentUserId = user?.id && uuidPattern.test(user.id) ? user.id : null;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(supabaseConfigurationError);
  const [accessTokenVersion, setAccessTokenVersion] = useState(0);
  const loadedConversationIds = useRef(new Set<string>());
  const profilesById = useRef(new Map<string, ProfileRecord>());
  const isRefreshing = useRef(false);

  useEffect(() => subscribeToSupabaseAccessToken(() => setAccessTokenVersion((version) => version + 1)), []);

  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      const updated = exists
        ? current.map((item) => {
            if (item.id !== conversation.id) {
              return item;
            }

            const next = { ...item, ...conversation };
            return conversation.name === fallbackName() && item.name !== fallbackName()
              ? { ...next, name: item.name, initials: item.initials }
              : next;
          })
        : [...current, conversation];

      return updated.sort((a, b) =>
        (b.updatedAtTimestamp ?? '').localeCompare(a.updatedAtTimestamp ?? '')
      );
    });
  }, []);

  const setMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setMessagesByConversation((current) => ({ ...current, [conversationId]: messages }));
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessagesByConversation((current) => {
      const existing = current[message.conversationId] ?? [];
      if (existing.some((item) => item.id === message.id)) {
        return current;
      }

      return { ...current, [message.conversationId]: [...existing, message] };
    });
  }, []);

  const refreshConversations = useCallback(async () => {
    if (!supabase || !currentUserId || !hasSupabaseAccessToken()) {
      setConversations([]);
      setMessagesByConversation({});
      return;
    }

    if (isRefreshing.current) {
      return;
    }

    isRefreshing.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, read, created_at')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (queryError) {
        setError('Impossible de charger les conversations. Vérifiez votre connexion puis réessayez.');
        return;
      }

      const messages = (data ?? []) as MessageRecord[];
      const participantIds = [
        ...new Set(
          messages.map((message) =>
            message.sender_id === currentUserId ? message.receiver_id : message.sender_id
          )
        ),
      ];
      const missingProfileIds = participantIds.filter((id) => !profilesById.current.has(id));

      if (missingProfileIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', missingProfileIds);

        for (const profile of (profiles ?? []) as ProfileRecord[]) {
          profilesById.current.set(profile.id, profile);
        }

        for (const profileId of missingProfileIds) {
          if (!profilesById.current.has(profileId)) {
            profilesById.current.set(profileId, { id: profileId, full_name: null });
          }
        }
      }

      setConversations(toConversations(messages, currentUserId, profilesById.current));
    } catch {
      setError('Impossible de charger les conversations. Vérifiez votre connexion puis réessayez.');
    } finally {
      isRefreshing.current = false;
      setIsLoading(false);
    }
  }, [accessTokenVersion, currentUserId]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!supabase || !currentUserId || !hasSupabaseAccessToken() || !uuidPattern.test(conversationId)) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from('messages')
          .select('id, sender_id, receiver_id, content, read, created_at')
          .or(
            `and(sender_id.eq.${currentUserId},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${currentUserId})`
          )
          .order('created_at', { ascending: true });

        if (queryError) {
          setError('Impossible de charger les messages. Vérifiez votre connexion puis réessayez.');
          return;
        }

        loadedConversationIds.current.add(conversationId);
        setMessages(conversationId, (data ?? []).map((record) => toChatMessage(record as MessageRecord, currentUserId)));
      } catch {
        setError('Impossible de charger les messages. Vérifiez votre connexion puis réessayez.');
      } finally {
        setIsLoading(false);
      }
    },
    [accessTokenVersion, currentUserId, setMessages]
  );

  const markConversationRead = useCallback(
    async (conversationId: string) => {
      if (!supabase || !currentUserId || !hasSupabaseAccessToken() || !uuidPattern.test(conversationId)) {
        return;
      }

      try {
        const { data, error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', conversationId)
          .eq('receiver_id', currentUserId)
          .eq('read', false)
          .select('id');

        if (updateError) {
          setError('Impossible de marquer les messages comme lus. Réessayez plus tard.');
          return;
        }

        if ((data ?? []).length > 0) {
          await refreshConversations();
        }
      } catch {
        setError('Impossible de marquer les messages comme lus. Réessayez plus tard.');
      }
    },
    [accessTokenVersion, currentUserId, refreshConversations]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const trimmedContent = content.trim();
      if (!supabase || !currentUserId || !hasSupabaseAccessToken() || !uuidPattern.test(conversationId) || !trimmedContent) {
        return false;
      }

      setError(null);
      try {
        const { data, error: insertError } = await supabase
          .from('messages')
          .insert({ sender_id: currentUserId, receiver_id: conversationId, content: trimmedContent })
          .select('id, sender_id, receiver_id, content, read, created_at')
          .single();

        if (insertError || !data) {
          setError('Le message n’a pas pu être envoyé. Vérifiez votre connexion puis réessayez.');
          return false;
        }

        const record = data as MessageRecord;
        const message = toChatMessage(record, currentUserId);
        appendMessage(message);
        upsertConversation({
          id: conversationId,
          initials: initialsFromName(fallbackName()),
          name: fallbackName(),
          lastMessage: message.body,
          updatedAt: message.sentAt,
          updatedAtTimestamp: record.created_at,
          unreadCount: 0,
        });
        return true;
      } catch {
        setError('Le message n’a pas pu être envoyé. Vérifiez votre connexion puis réessayez.');
        return false;
      }
    },
    [accessTokenVersion, appendMessage, currentUserId, upsertConversation]
  );

  useEffect(() => {
    loadedConversationIds.current.clear();
    profilesById.current.clear();
    if (!currentUserId) {
      setConversations([]);
      setMessagesByConversation({});
      setError(supabaseConfigurationError ?? 'La messagerie attend un identifiant utilisateur Supabase valide.');
      return;
    }

    if (!hasSupabaseAccessToken()) {
      setConversations([]);
      setMessagesByConversation({});
      setError('La messagerie attend le jeton Supabase de la session authentifiée.');
      return;
    }

    void refreshConversations();
  }, [currentUserId, refreshConversations]);

  useEffect(() => {
    if (!supabase || !currentUserId || !hasSupabaseAccessToken()) {
      return;
    }

    const supabaseClient = supabase;
    const channel = supabaseClient
      .channel(`messages:${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const record = payload.new as MessageRecord;

          if (record.sender_id !== currentUserId && record.receiver_id !== currentUserId) {
            return;
          }

          const message = toChatMessage(record, currentUserId);
          if (loadedConversationIds.current.has(message.conversationId)) {
            appendMessage(message);
          }

          void refreshConversations();
        }
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [appendMessage, currentUserId, refreshConversations]);

  const value = useMemo(
    () => ({
      conversations,
      messagesByConversation,
      isLoading,
      error,
      setConversations,
      upsertConversation,
      setMessages,
      appendMessage,
      refreshConversations,
      loadConversation,
      sendMessage,
      markConversationRead,
    }),
    [
      appendMessage,
      conversations,
      error,
      isLoading,
      loadConversation,
      markConversationRead,
      messagesByConversation,
      refreshConversations,
      sendMessage,
      setMessages,
      upsertConversation,
    ]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const messaging = useContext(MessagingContext);

  if (!messaging) {
    throw new Error('useMessaging must be used within a MessagingProvider.');
  }

  return messaging;
}
