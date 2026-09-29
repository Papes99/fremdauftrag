import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { SessionProvider } from '@/lib/session';
import { JournalProvider } from '@/lib/journal';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <JournalProvider>
            <RootNavigator />
          </JournalProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { colors, dark } = useTheme();
  const reduceMotion = useReduceMotion();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center' }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={{ flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.bg }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: reduceMotion ? 'none' : 'fade',
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </View>
    </View>
  );
}
