import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type Conversation = {
  id: string;
  initials: string;
  name: string;
  lastMessage?: string;
  updatedAt?: string;
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

type MessagingContextValue = {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (message: ChatMessage) => void;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

export function MessagingProvider({ children }: PropsWithChildren) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});

  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((current) => {
      const exists = current.some((item) => item.id === conversation.id);
      const updated = exists
        ? current.map((item) => (item.id === conversation.id ? conversation : item))
        : [...current, conversation];

      return updated.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    });
  }, []);

  const setMessages = useCallback((conversationId: string, messages: ChatMessage[]) => {
    setMessagesByConversation((current) => ({ ...current, [conversationId]: messages }));
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessagesByConversation((current) => ({
      ...current,
      [message.conversationId]: [...(current[message.conversationId] ?? []), message],
    }));
  }, []);

  const value = useMemo(
    () => ({
      conversations,
      messagesByConversation,
      setConversations,
      upsertConversation,
      setMessages,
      appendMessage,
    }),
    [appendMessage, conversations, messagesByConversation, setMessages, upsertConversation]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

/** Point d'entrée pour le client backend : appelle ces fonctions après chaque réponse ou événement temps réel. */
export function useMessaging() {
  const messaging = useContext(MessagingContext);

  if (!messaging) {
    throw new Error('useMessaging must be used within a MessagingProvider.');
  }

  return messaging;
}
