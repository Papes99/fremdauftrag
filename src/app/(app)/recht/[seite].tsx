import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { LegalView } from '@/components/LegalView';
import { copy } from '@/i18n';

const pages = {
  datenschutz: copy.legal.privacy,
  impressum: copy.legal.imprint,
  nutzung: copy.legal.terms,
} as const;

export default function LegalScreen() {
  const { seite } = useLocalSearchParams<{ seite: string }>();
  const page = seite && seite in pages ? pages[seite as keyof typeof pages] : null;
  if (!page) return <Redirect href="/einstellungen" />;
  return <LegalView title={page.title} body={page.body} onBack={() => router.back()} />;
}
