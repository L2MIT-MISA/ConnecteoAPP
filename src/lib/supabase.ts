import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Expo expose automatiquement les variables préfixées "EXPO_PUBLIC_"
// au code de l'application (aucune librairie supplémentaire nécessaire,
// contrairement à un projet Vite classique). Ces variables sont lues
// depuis un fichier ".env" à la racine du projet.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY manquantes dans .env'
  );
}

// Client unique, réutilisé dans tout le projet (auth/session.tsx,
// settings/account.tsx, messaging/store.tsx, etc.).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // "detectSessionInUrl: false" est nécessaire en React Native :
    // cette détection est pensée pour le web (lecture de l'URL du
    // navigateur), elle n'a pas de sens ici et peut causer des erreurs.
    detectSessionInUrl: false,
  },
});
