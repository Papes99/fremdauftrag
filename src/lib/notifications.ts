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
