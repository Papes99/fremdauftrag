import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { TopBar } from '@/components/TopBar';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export function LegalView({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 28, gap: 16 }}>
        <TopBar title={title} onBack={onBack} />
        <Card>
          <AppText variant="label" color={colors.sageDeep}>
            {copy.legal.note}
          </AppText>
        </Card>
        <AppText variant="body">{body}</AppText>
      </ScrollView>
    </View>
  );
}
