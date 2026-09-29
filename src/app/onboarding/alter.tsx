import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { copy, fill } from '@/i18n';
import { birthYearOptions, isOldEnough } from '@/lib/age';
import { useSession, type LocalSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

export default function AgeScreen() {
  const { colors } = useTheme();
  const { session, save } = useSession();
  const years = useMemo(() => birthYearOptions(), []);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function onContinue() {
    if (selected === null || busy) return;
    if (!isOldEnough(selected)) {
      router.push('/onboarding/absage');
      return;
    }
    // Das Jahr selbst wird nicht mitgeschrieben.
    const next: LocalSession = {
      onboardingComplete: false,
      ageConfirmed: true,
      pushAsked: session?.pushAsked ?? false,
      pushGranted: session?.pushGranted ?? null,
      serverConnected: false,
      createdAt: session?.createdAt ?? new Date().toISOString(),
    };
    setBusy(true);
    await save(next);
    setBusy(false);
    router.push('/onboarding/mitteilungen');
  }

  return (
    <Screen
      footer={
        <Button
          label={copy.age.continue}
          onPress={onContinue}
          disabled={selected === null || busy}
          accessibilityHint={selected === null ? copy.age.chooseFirst : undefined}
        />
      }
    >
      <TopBar title={copy.age.title} onBack={() => router.back()} />
      <AppText variant="body">{copy.age.body}</AppText>
      <ScrollView style={{ flex: 1, marginTop: 16 }} contentContainerStyle={{ paddingBottom: 12 }}>
        {years.map((year) => {
          const active = year === selected;
          return (
            <Pressable
              key={year}
              accessibilityRole="button"
              accessibilityLabel={fill(copy.age.yearLabel, { year })}
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(year)}
              style={{
                minHeight: 48,
                borderRadius: 14,
                paddingHorizontal: 14,
                justifyContent: 'center',
                backgroundColor: active ? colors.sageSoft : 'transparent',
              }}
            >
              <AppText variant="label" color={active ? colors.sageDeep : colors.text}>
                {year}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
