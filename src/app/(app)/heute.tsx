import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { LeafMark } from '@/components/LeafMark';
import { Button } from '@/components/Button';
import { ConnectionBanner } from '@/components/ConnectionBanner';
import { TaskCard } from '@/components/TaskCard';
import { BootMark } from '@/components/BootMark';
import { copy } from '@/i18n';
import { formatDay } from '@/lib/clock';
import { streakLine } from '@/lib/card';
import { useJournal } from '@/lib/journal';
import { useSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return copy.home.greetingMorning;
  if (hour < 18) return copy.home.greetingDay;
  return copy.home.greetingEvening;
}

export default function TodayScreen() {
  const { colors } = useTheme();
  const { ready, view, setStatus, setNote, setPhoto, report } = useJournal();
  const { session } = useSession();
  if (!ready || !view) return <BootMark />;

  return (
    <AppPage nav>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText variant="label" color={colors.sageDeep}>
          {copy.appName}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.a11y.settings}
          onPress={() => router.push('/einstellungen')}
          hitSlop={12}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          <AppText variant="label">{copy.settings.title}</AppText>
        </Pressable>
      </View>
      <View style={{ gap: 4 }}>
        <AppText variant="muted">{formatDay(view.today)}</AppText>
        <AppText variant="display" accessibilityRole="header">
          {greeting()}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {view.streak > 0 ? <LeafMark size={28} /> : null}
          <AppText variant="label">{view.streak > 0 ? streakLine(view.streak) : copy.home.streakZero}</AppText>
        </View>
      </View>
      <ConnectionBanner connected={session?.serverConnected ?? false} />
      {session?.pushGranted === false ? <AppText variant="muted">{copy.home.pushOff}</AppText> : null}
      {view.paused ? (
        <View style={{ gap: 6 }}>
          <AppText variant="title">{copy.home.pauseTitle}</AppText>
          <AppText variant="body">{copy.home.pauseBody}</AppText>
        </View>
      ) : null}
      {view.assignment?.tasks.map((task) => (
        <TaskCard
          key={task.key}
          task={task}
          onStatus={(status) => setStatus(task.key, status)}
          onNote={(note) => setNote(task.key, note)}
          onPhoto={(photo) => setPhoto(task.key, photo)}
          onReport={(reason) => report(task.key, reason)}
        />
      ))}
      {view.cardReady ? <Button label={copy.home.cardCta} onPress={() => router.push('/tageskarte')} /> : null}
      {view.inEvening && view.lock === 'none' ? (
        <Button label={copy.home.eveningCta} variant="secondary" onPress={() => router.push('/schreiben')} />
      ) : null}
    </AppPage>
  );
}
