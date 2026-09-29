import { router } from 'expo-router';
import { RulesView } from '@/components/RulesView';

export default function RulesScreen() {
  return <RulesView onBack={() => router.back()} />;
}
