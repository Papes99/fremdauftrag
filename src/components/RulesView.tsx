import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export function RulesView({ onBack }: { onBack: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 28, gap: 16 }}>
        <TopBar title={copy.rules.title} onBack={onBack} />
        <AppText variant="body">{copy.rules.intro}</AppText>
        <Card>
          <AppText variant="label">{copy.rules.allowedTitle}</AppText>
          <AppText variant="body" style={{ marginTop: 8 }}>
            {copy.rules.allowedBody}
          </AppText>
        </Card>
        <Card>
          <AppText variant="label">{copy.rules.forbiddenTitle}</AppText>
          <View style={{ marginTop: 10, gap: 8 }}>
            {copy.rules.forbidden.map((line) => (
              <AppText key={line} variant="body">
                {`·  ${line}`}
              </AppText>
            ))}
          </View>
          <AppText variant="muted" style={{ marginTop: 12 }}>
            {copy.rules.foodNote}
          </AppText>
        </Card>
        <AppText variant="label" color={colors.sageDeep}>
          {copy.rules.voluntary}
        </AppText>
      </ScrollView>
    </View>
  );
}
