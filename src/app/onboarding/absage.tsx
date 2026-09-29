import { router } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { LeafMark } from '@/components/LeafMark';
import { Screen } from '@/components/Screen';
import { copy } from '@/i18n';

export default function RefusalScreen() {
  return (
    <Screen footer={<Button label={copy.refusal.retry} onPress={() => router.back()} />}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        <LeafMark size={88} />
        <AppText variant="display" accessibilityRole="header">
          {copy.refusal.title}
        </AppText>
        <AppText variant="body">{copy.refusal.body}</AppText>
      </View>
    </Screen>
  );
}
