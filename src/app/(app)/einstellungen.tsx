import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { BootMark } from '@/components/BootMark';
import { copy, fill } from '@/i18n';
import { shiftMinutes, type Weekday } from '@/lib/clock';
import { formatDay } from '@/lib/clock';
import { useJournal } from '@/lib/journal';
import { askPushPermission, syncLocalReminders } from '@/lib/notifications';
import { useSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

const days: { id: Weekday; label: string }[] = [
  { id: 'mo', label: copy.settings.weekdays.mo },
  { id: 'di', label: copy.settings.weekdays.di },
  { id: 'mi', label: copy.settings.weekdays.mi },
  { id: 'do', label: copy.settings.weekdays.do },
  { id: 'fr', label: copy.settings.weekdays.fr },
  { id: 'sa', label: copy.settings.weekdays.sa },
  { id: 'so', label: copy.settings.weekdays.so },
];

const links = [
  { label: copy.settings.rules, href: '/regeln' as const },
  { label: copy.settings.privacy, href: '/recht/datenschutz' as const },
  { label: copy.settings.imprint, href: '/recht/impressum' as const },
  { label: copy.settings.terms, href: '/recht/nutzung' as const },
  { label: copy.settings.contact, href: '/kontakt' as const },
  { label: copy.settings.shop, href: '/shop' as const },
  { label: copy.settings.moderation, href: '/moderation' as const },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { ready, view, patchSettings, pauseFor, exportJson, wipe } = useJournal();
  const { session, forget } = useSession();
  const [shiftOpen, setShiftOpen] = useState(false);
  const [openDay, setOpenDay] = useState<Weekday | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!view) return;
    syncLocalReminders({
      morning: view.settings.notifyMorning,
      evening: view.settings.notifyEvening,
      paused: view.paused,
      morningTime: view.settings.morning,
      eveningTime: view.settings.eveningStart,
    }).catch(() => undefined);
  }, [view]);

  if (!ready || !view) return <BootMark />;
  const settings = view.settings;

  function step(field: 'morning' | 'eveningStart' | 'eveningEnd', delta: number) {
    patchSettings({ [field]: shiftMinutes(settings[field], delta) });
  }

  function setDay(day: Weekday, field: 'morning' | 'eveningStart' | 'eveningEnd', delta: number) {
    const current = settings.overrides[day]?.[field] ?? settings[field];
    patchSettings({
      overrides: {
        ...settings.overrides,
        [day]: { ...settings.overrides[day], [field]: shiftMinutes(current, delta) },
      },
    });
  }

  async function download() {
    const payload = exportJson();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Fremdauftrag', text: payload });
        return;
      } catch {
        // Teilen abgebrochen. Danach der Download, falls der Browser das kann.
      }
    }
    if (typeof document === 'undefined') return;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fremdauftrag.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function wipeAll() {
    await wipe();
    await forget();
    router.replace('/onboarding');
  }

  return (
    <AppPage>
      <TopBar title={copy.settings.title} onBack={() => router.back()} />
      <Card>
        <AppText variant="label" color={colors.sageDeep}>
          {session?.serverConnected ? copy.settings.connected : copy.settings.notConnected}
        </AppText>
        <AppText variant="body" style={{ marginTop: 8 }}>
          {copy.settings.accountBody}
        </AppText>
        <AppText variant="muted" style={{ marginTop: 8 }}>
          {fill(copy.settings.strikes, { count: view.strikeCount })}
        </AppText>
      </Card>
      <Card>
        <AppText variant="label">{copy.settings.timesTitle}</AppText>
        <Stepper label={copy.settings.morning} value={settings.morning} onShift={(delta) => step('morning', delta)} />
        <Stepper label={copy.settings.eveningStart} value={settings.eveningStart} onShift={(delta) => step('eveningStart', delta)} />
        <Stepper label={copy.settings.eveningEnd} value={settings.eveningEnd} onShift={(delta) => step('eveningEnd', delta)} />
        <Button label={shiftOpen ? copy.settings.shiftHide : copy.settings.shiftShow} variant="ghost" onPress={() => setShiftOpen((open) => !open)} />
        {shiftOpen
          ? days.map((day) => {
              const extra = settings.overrides[day.id];
              const open = openDay === day.id;
              const summary = extra
                ? `${extra.morning ?? settings.morning} · ${extra.eveningStart ?? settings.eveningStart}–${extra.eveningEnd ?? settings.eveningEnd}`
                : copy.settings.likeNormal;
              return (
                <View key={day.id} style={{ marginTop: 12, gap: 6 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={day.label}
                    accessibilityState={{ expanded: open }}
                    onPress={() => setOpenDay(open ? null : day.id)}
                    style={{ minHeight: 48, justifyContent: 'center' }}
                  >
                    <AppText variant="label">{day.label}</AppText>
                    <AppText variant="muted">{summary}</AppText>
                  </Pressable>
                  {open ? (
                    <View style={{ gap: 4 }}>
                      <Stepper
                        label={copy.settings.morning}
                        value={extra?.morning ?? settings.morning}
                        onShift={(delta) => setDay(day.id, 'morning', delta)}
                      />
                      <Stepper
                        label={copy.settings.eveningStart}
                        value={extra?.eveningStart ?? settings.eveningStart}
                        onShift={(delta) => setDay(day.id, 'eveningStart', delta)}
                      />
                      <Stepper
                        label={copy.settings.eveningEnd}
                        value={extra?.eveningEnd ?? settings.eveningEnd}
                        onShift={(delta) => setDay(day.id, 'eveningEnd', delta)}
                      />
                      <Button
                        label={copy.settings.resetDay}
                        variant="ghost"
                        onPress={() => {
                          const overrides = { ...settings.overrides };
                          delete overrides[day.id];
                          patchSettings({ overrides });
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              );
            })
          : null}
      </Card>
      <Card>
        <AppText variant="label">{copy.settings.pauseTitle}</AppText>
        <AppText variant="body" style={{ marginTop: 8 }}>
          {view.paused || settings.pauseUntil
            ? fill(copy.settings.pauseActive, { date: formatDay(settings.pauseUntil ?? view.today) })
            : copy.settings.pauseBody}
        </AppText>
        <View style={{ gap: 8, marginTop: 12 }}>
          {[1, 3, 7, 14].map((days) => (
            <Button key={days} label={days === 1 ? copy.settings.pauseOne : fill(copy.settings.pauseDays, { count: days })} variant="secondary" onPress={() => pauseFor(days)} />
          ))}
          <Button label={copy.settings.pauseEnd} variant="ghost" onPress={() => pauseFor(null)} />
        </View>
      </Card>
      <Card>
        <AppText variant="label">{copy.settings.notifyTitle}</AppText>
        <Toggle
          label={copy.settings.notifyMorning}
          on={settings.notifyMorning}
          onPress={() => {
            if (!settings.notifyMorning) askPushPermission().catch(() => undefined);
            patchSettings({ notifyMorning: !settings.notifyMorning });
          }}
        />
        <Toggle
          label={copy.settings.notifyEvening}
          on={settings.notifyEvening}
          onPress={() => {
            if (!settings.notifyEvening) askPushPermission().catch(() => undefined);
            patchSettings({ notifyEvening: !settings.notifyEvening });
          }}
        />
        <AppText variant="muted" style={{ marginTop: 8 }}>
          {copy.settings.notifyBody}
        </AppText>
      </Card>
      <Card>
        <AppText variant="label">{copy.settings.sponsorTitle}</AppText>
        <AppText variant="body" style={{ marginTop: 8 }}>
          {copy.settings.sponsorBody}
        </AppText>
        <View style={{ gap: 8, marginTop: 12 }}>
          {(['off', 'weekly', 'rare'] as const).map((mode) => (
            <Button
              key={mode}
              label={copy.settings.sponsorModes[mode]}
              variant={settings.sponsorMode === mode ? 'primary' : 'secondary'}
              onPress={() => patchSettings({ sponsorMode: mode })}
            />
          ))}
        </View>
      </Card>
      <Card>
        <AppText variant="label">{copy.settings.secureTitle}</AppText>
        <AppText variant="muted" style={{ marginTop: 8 }}>
          {copy.settings.secureBody}
        </AppText>
        <View style={{ gap: 8, marginTop: 12 }}>
          <Button label={copy.settings.export} variant="secondary" onPress={download} />
          <Button
            label={confirmDelete ? copy.settings.deleteConfirm : copy.settings.delete}
            variant="ghost"
            onPress={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                return;
              }
              wipeAll().catch(() => undefined);
            }}
          />
        </View>
      </Card>
      <View style={{ gap: 8 }}>
        {links.map((link) => (
          <Pressable
            key={link.href}
            accessibilityRole="button"
            accessibilityLabel={link.label}
            onPress={() => router.push(link.href)}
            style={{
              minHeight: 56,
              borderRadius: 16,
              paddingHorizontal: 16,
              justifyContent: 'center',
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <AppText variant="label">{link.label}</AppText>
          </Pressable>
        ))}
      </View>
    </AppPage>
  );
}

function Stepper({ label, value, onShift }: { label: string; value: string; onShift: (delta: number) => void }) {
  return (
    <View style={{ marginTop: 12, gap: 6 }}>
      <AppText variant="body">
        {label}: {value}
      </AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label={copy.settings.minus} variant="secondary" style={{ flex: 1 }} onPress={() => onShift(-30)} />
        <Button label={copy.settings.plus} variant="secondary" style={{ flex: 1 }} onPress={() => onShift(30)} />
      </View>
    </View>
  );
}

function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={{ minHeight: 48, justifyContent: 'center', marginTop: 8 }}
    >
      <AppText variant="label" color={on ? colors.sageDeep : colors.muted}>
        {label}: {on ? copy.settings.on : copy.settings.off}
      </AppText>
    </Pressable>
  );
}
