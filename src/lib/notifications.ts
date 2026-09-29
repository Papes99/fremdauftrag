/**
 * Fragt die System-Erlaubnis. In der Browser-Vorschau kann das fehlschlagen.
 * null heißt: hier nicht fragbar. false heißt: die Person hat nein gesagt.
 */
export async function askPushPermission(): Promise<boolean | null> {
  try {
    const Notifications = await import('expo-notifications');
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return null;
  }
}

const morningLines = [
  'Dein Fremder hat dir 3 Aufgaben hinterlassen.',
  'Guten Morgen. Jemand hat an dich gedacht.',
  '3 kleine Aufträge warten auf dich.',
];

const eveningLines = [
  'Zeit, einem Fremden den Tag zu machen.',
  'Irgendwer wacht morgen mit deinen Aufgaben auf.',
  'Was soll dein Fremder morgen erleben?',
];

function line(list: string[], salt: string): string {
  let h = 0;
  for (let i = 0; i < salt.length; i += 1) h = (h + salt.charCodeAt(i)) % list.length;
  return list[h] ?? list[0]!;
}

/** Höchstens eine Morgen- und eine Abend-Mitteilung. In der Pause keine. */
export async function syncLocalReminders(input: {
  morning: boolean;
  evening: boolean;
  paused: boolean;
  morningTime: string;
  eveningTime: string;
}): Promise<void> {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (input.paused || (!input.morning && !input.evening)) return;
    const day = new Date().toISOString().slice(0, 10);
    if (input.morning) {
      const [hour, minute] = input.morningTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Fremdauftrag', body: line(morningLines, day) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hour ?? 7, minute: minute ?? 0 },
      });
    }
    if (input.evening) {
      const [hour, minute] = input.eveningTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Fremdauftrag', body: line(eveningLines, `${day}:abend`) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hour ?? 18, minute: minute ?? 0 },
      });
    }
  } catch {
    // In der Vorschau gibt es keine System-Mitteilungen.
  }
}
