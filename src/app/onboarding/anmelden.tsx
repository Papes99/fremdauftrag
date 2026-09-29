import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { BootMark } from '@/components/BootMark';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { Screen } from '@/components/Screen';
import { copy } from '@/i18n';
import { useSession, type LocalSession } from '@/lib/session';
import { signInAnonymously } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignInScreen() {
  const { ready, session, save } = useSession();
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState<boolean | null>(null);

  if (!ready) return <BootMark />;
  if (!session?.ageConfirmed) return <Redirect href="/onboarding/alter" />;

  async function start() {
    if (busy) return;
    setBusy(true);
    const result = await signInAnonymously();
    const next: LocalSession = {
      onboardingComplete: true,
      ageConfirmed: true,
      pushAsked: session?.pushAsked ?? false,
      pushGranted: session?.pushGranted ?? null,
      serverConnected: result.connected,
      createdAt: session?.createdAt ?? new Date().toISOString(),
    };
    await save(next);
    setFinished(result.connected);
    setBusy(false);
  }

  function enterApp() {
    router.dismissAll();
    router.replace('/heute');
  }

  return (
    <Screen
      footer={
        finished === null ? (
          <Button label={busy ? copy.auth.working : copy.auth.start} onPress={start} disabled={busy} />
        ) : (
          <Button label={copy.auth.enter} onPress={enterApp} />
        )
      }
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <AppText variant="label" color={colors.sageDeep}>
          {copy.appName}
        </AppText>
        {finished === null ? (
          <>
            <AppText variant="display" accessibilityRole="header">
              {copy.auth.title}
            </AppText>
            <AppText variant="body">{copy.auth.body}</AppText>
          </>
        ) : (
          <>
            <AppText variant="display" accessibilityRole="header">
              {finished ? copy.auth.connectedTitle : copy.auth.notConnectedTitle}
            </AppText>
            <AppText variant="body">{finished ? copy.auth.connectedBody : copy.auth.notConnectedBody}</AppText>
            <ConnectionBanner connected={finished} />
          </>
        )}
      </View>
    </Screen>
  );
}
