import { Redirect } from 'expo-router';
import { BootMark } from '@/components/BootMark';
import { useSession } from '@/lib/session';

export default function Index() {
  const { ready, session } = useSession();
  if (!ready) return <BootMark />;
  if (session?.onboardingComplete) return <Redirect href="/heute" />;
  return <Redirect href="/onboarding" />;
}
