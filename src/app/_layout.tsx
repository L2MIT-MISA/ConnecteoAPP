import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../auth/session';
import { MessagingProvider } from '../messaging/store';
import { ThemeProvider } from '../theme/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <MessagingProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </MessagingProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}