import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let accessToken: string | null = null;
const accessTokenListeners = new Set<() => void>();

export const supabaseConfigurationError =
  !supabaseUrl || !supabasePublishableKey
    ? 'Supabase n’est pas configuré. Renseignez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    : null;

/**
 * L'authentification de l'application est gérée par SessionProvider. Ce client
 * n'essaie donc pas de restaurer ou de renouveler une session Supabase en parallèle.
 */
export const supabase: SupabaseClient | null = supabaseConfigurationError
  ? null
  : createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      accessToken: async () => accessToken,
    });

/**
 * The auth owner calls this whenever its Supabase JWT is created, refreshed, or cleared.
 * It deliberately accepts only an access token; no service-role or refresh token belongs here.
 */
export function setSupabaseAccessToken(nextAccessToken: string | null) {
  accessToken = nextAccessToken;
  supabase?.realtime.setAuth();
  accessTokenListeners.forEach((listener) => listener());
}

export function hasSupabaseAccessToken() {
  return accessToken !== null;
}

export function subscribeToSupabaseAccessToken(listener: () => void) {
  accessTokenListeners.add(listener);
  return () => {
    accessTokenListeners.delete(listener);
  };
}
