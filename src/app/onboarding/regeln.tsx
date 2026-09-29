import { router } from 'expo-router';
import { RulesView } from '@/components/RulesView';

export default function OnboardingRules() {
  return <RulesView onBack={() => router.back()} />;
}
