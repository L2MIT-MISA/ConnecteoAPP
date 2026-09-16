import type { User } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '../lib/supabase';

// Le profil correspond à la table "profiles" (table du projet).
type Profil = {
  id: string;
  full_name: string;
  email: string | null;
  phoneNumber: string | null;
};

type SessionContextValue = {
  user: User | null;
  profil: Profil | null;
  chargementInitial: boolean;
  signIn: (email: string, motDePasse: string) => Promise<{ erreur: string | null }>;
  signUp: (
    fullName: string,
    email: string,
    motDePasse: string,
    phoneNumber: string
  ) => Promise<{ erreur: string | null }>;
  updateProfil: (fullName: string, phoneNumber: string) => Promise<{ erreur: string | null }>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  // Sert uniquement à afficher un écran de chargement au tout premier
  // lancement de l'app, le temps de savoir si une session existe déjà.
  const [chargementInitial, setChargementInitial] = useState(true);

  // Va chercher la ligne "profiles" correspondant à l'utilisateur connecté.
  async function chargerProfil(idUtilisateur: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phoneNumber')
      .eq('id', idUtilisateur)
      .single();

    if (error) {
      console.error('Erreur lors du chargement du profil :', error.message);
      setProfil(null);
      return;
    }
    setProfil(data);
  }

  useEffect(() => {
    // Au premier lancement : vérifie si une session existe déjà
    // (utilisateur déjà connecté lors d'un lancement précédent de l'app).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        chargerProfil(session.user.id);
      }
      setChargementInitial(false);
    });

    // Écoute tout changement de session (connexion, déconnexion,
    // renouvellement automatique du token) pour garder l'app synchronisée.
    const { data: abonnement } = supabase.auth.onAuthStateChange((_evenement, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        chargerProfil(session.user.id);
      } else {
        setProfil(null);
      }
    });

    return () => abonnement.subscription.unsubscribe();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      profil,
      chargementInitial,

      async signIn(email, motDePasse) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: motDePasse,
        });
        // "user" et "profil" se mettent à jour automatiquement via
        // onAuthStateChange ci-dessus : pas besoin de setUser() ici.
        return { erreur: error ? error.message : null };
      },

      async signUp(fullName, email, motDePasse, phoneNumber) {
        const { error } = await supabase.auth.signUp({
          email,
          password: motDePasse,
          options: {
            data: { full_name: fullName, phoneNumber },
          },
        });
        return { erreur: error ? error.message : null };
      },

      async updateProfil(fullName, phoneNumber) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName, phoneNumber })
          .eq('id', user?.id);
        return { erreur: error ? error.message : null };
      },

      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [user, profil, chargementInitial]
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
