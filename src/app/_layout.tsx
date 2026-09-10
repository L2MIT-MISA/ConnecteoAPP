import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '../auth/session';
import { MessagingProvider } from '../messaging/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <MessagingProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </MessagingProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
