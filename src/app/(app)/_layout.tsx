import { Redirect, Stack } from 'expo-router';
import { BootMark } from '@/components/BootMark';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';

export default function AppLayout() {
  const { ready, session } = useSession();
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();

  if (!ready) return <BootMark />;
  if (!session?.onboardingComplete) return <Redirect href="/onboarding" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
