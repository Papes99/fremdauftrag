import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { BootMark } from '@/components/BootMark';
import { Screen } from '@/components/Screen';
import { copy } from '@/i18n';
import { askPushPermission } from '@/lib/notifications';
import { useSession, type LocalSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

export default function PushScreen() {
  const { ready, session, save } = useSession();
  const { colors } = useTheme();
  const [unavailable, setUnavailable] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready) return <BootMark />;
  if (!session?.ageConfirmed) return <Redirect href="/onboarding/alter" />;

  async function remember(pushGranted: boolean | null) {
    const next: LocalSession = {
      onboardingComplete: false,
      ageConfirmed: true,
      pushAsked: true,
      pushGranted,
      serverConnected: false,
      createdAt: session?.createdAt ?? new Date().toISOString(),
    };
    await save(next);
    router.push('/onboarding/anmelden');
  }

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          {unavailable ? (
            <Button label={copy.push.continue} onPress={() => remember(null)} />
          ) : (
            <Button
              label={copy.push.allow}
              disabled={busy}
              onPress={async () => {
                setBusy(true);
                const result = await askPushPermission();
                setBusy(false);
                if (result === null) {
                  setUnavailable(true);
                  return;
                }
                await remember(result);
              }}
            />
          )}
          {!unavailable ? (
            <Button label={copy.push.skip} variant="ghost" disabled={busy} onPress={() => remember(false)} />
          ) : null}
        </View>
      }
    >
      <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
        <AppText variant="label" color={colors.sageDeep}>
          {copy.appName}
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          {copy.push.title}
        </AppText>
        <AppText variant="body">{copy.push.body}</AppText>
        {unavailable ? <AppText variant="muted">{copy.push.unavailable}</AppText> : null}
      </View>
    </Screen>
  );
}
