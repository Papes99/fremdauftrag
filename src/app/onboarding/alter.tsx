import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { copy, fill } from '@/i18n';
import { ageGate, birthYearOptions } from '@/lib/age';
import { useSession, type LocalSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

export default function AgeScreen() {
  const { colors } = useTheme();
  const { session, save } = useSession();
  const years = useMemo(() => birthYearOptions(), []);
  const [selected, setSelected] = useState<number | null>(null);
  const [hadBirthday, setHadBirthday] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const gate = selected === null ? null : ageGate(selected);

  function chooseYear(year: number) {
    setSelected(year);
    setHadBirthday(null);
  }

  async function confirm() {
    // Jahr und Geburtstagsantwort werden nicht mitgeschrieben.
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

  async function onContinue() {
    if (selected === null || busy || gate === null) return;
    if (gate === 'refuse') {
      router.push('/onboarding/absage');
      return;
    }
    if (gate === 'ask') {
      if (hadBirthday !== true) return;
    }
    await confirm();
  }

  function onBirthdayNo() {
    setHadBirthday(false);
    router.push('/onboarding/absage');
  }

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          {gate === 'ask' ? (
            <View style={{ gap: 10 }}>
              <AppText variant="label">{copy.age.birthdayQuestion}</AppText>
              <AppText variant="muted">{copy.age.birthdayHint}</AppText>
              <Button
                label={copy.age.birthdayYes}
                variant={hadBirthday === true ? 'primary' : 'secondary'}
                onPress={() => setHadBirthday(true)}
              />
              <Button label={copy.age.birthdayNo} variant="secondary" onPress={onBirthdayNo} />
            </View>
          ) : null}
          <Button
            label={copy.age.continue}
            onPress={onContinue}
            disabled={selected === null || busy || (gate === 'ask' && hadBirthday !== true)}
            accessibilityHint={selected === null ? copy.age.chooseFirst : undefined}
          />
        </View>
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
              onPress={() => chooseYear(year)}
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
