import { router } from 'expo-router';
import { LegalView } from '@/components/LegalView';
import { copy } from '@/i18n';

export default function ContactScreen() {
  return <LegalView title={copy.contact.title} body={copy.contact.body} onBack={() => router.back()} />;
}
