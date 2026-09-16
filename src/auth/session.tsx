import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react';

type User = {
  id: string;
};

type SessionContextValue = {
  user: User | null;
  signIn: () => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({
      user,
      signIn: () => setUser({ id: 'current-user' }),
      signOut: () => setUser(null),
    }),
    [user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession must be used within a SessionProvider.');
  }

  return session;
}