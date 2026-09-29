import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppPage } from '@/components/AppPage';
import { AppText } from '@/components/AppText';
import { BootMark } from '@/components/BootMark';
import { copy, fill } from '@/i18n';
import { formatDay } from '@/lib/clock';
import { useJournal } from '@/lib/journal';
import { useTheme } from '@/theme/ThemeProvider';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { ready, view, marks, tasksFor } = useJournal();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [selected, setSelected] = useState<string | null>(null);
  if (!ready || !view) return <BootMark />;

  const cells = marks(cursor.year, cursor.month);
  const first = new Date(Date.UTC(cursor.year, cursor.month - 1, 1));
  const pad = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(cursor.year, cursor.month, 0)).getUTCDate();
  const selectedTasks = selected ? tasksFor(selected) : null;

  function shift(delta: number) {
    const next = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1));
    setCursor({ year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 });
    setSelected(null);
  }

  return (
    <AppPage nav>
      <AppText variant="title" accessibilityRole="header">
        {copy.history.title}
      </AppText>
      <AppText variant="body">{fill(copy.history.best, { count: view.best })}</AppText>
      <AppText variant="body">{fill(copy.history.total, { count: view.totalDone })}</AppText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.history.prev} onPress={() => shift(-1)} style={{ minHeight: 48, justifyContent: 'center' }}>
          <AppText variant="label">{copy.history.prev}</AppText>
        </Pressable>
        <AppText variant="label">
          {new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)}
        </AppText>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.history.next} onPress={() => shift(1)} style={{ minHeight: 48, justifyContent: 'center' }}>
          <AppText variant="label">{copy.history.next}</AppText>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {copy.history.week.map((label) => (
          <AppText key={label} variant="muted" style={{ width: `${100 / 7}%`, textAlign: 'center' }}>
            {label}
          </AppText>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: pad }, (_, index) => (
          <View key={`pad-${index}`} style={{ width: `${100 / 7}%`, height: 48 }} />
        ))}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const iso = `${cursor.year}-${String(cursor.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const mark = cells[iso];
          const background =
            mark === 'done' ? colors.sage : mark === 'pause' ? colors.line : mark === 'miss' ? colors.card : 'transparent';
          return (
            <Pressable
              key={iso}
              accessibilityRole="button"
              accessibilityLabel={formatDay(iso)}
              onPress={() => setSelected(iso)}
              style={{
                width: `${100 / 7}%`,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: background,
                  borderWidth: selected === iso ? 2 : 0,
                  borderColor: colors.orange,
                }}
              >
                <AppText variant="label">{day}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
      {selected ? (
        <View style={{ gap: 8 }}>
          <AppText variant="label">{formatDay(selected)}</AppText>
          {selectedTasks && selectedTasks.length > 0 ? (
            selectedTasks.map((task) => (
              <View key={task.key} style={{ gap: 4 }}>
                <AppText variant="body">{task.text}</AppText>
                <AppText variant="muted">
                  {task.status === 'done'
                    ? copy.home.done
                    : task.status === 'skipped'
                      ? copy.home.skip
                      : task.status === 'expired'
                        ? copy.home.expired
                        : copy.home.open}
                </AppText>
                {task.note ? <AppText variant="muted">{task.note}</AppText> : null}
              </View>
            ))
          ) : (
            <AppText variant="muted">{copy.history.empty}</AppText>
          )}
        </View>
      ) : null}
    </AppPage>
  );
}
