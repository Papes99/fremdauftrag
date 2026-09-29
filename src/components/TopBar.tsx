import { Pressable, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  onBack?: () => void;
};

export function TopBar({ title, onBack }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ minHeight: 48, justifyContent: 'center', marginBottom: 12 }}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.a11y.back}
          onPress={onBack}
          hitSlop={12}
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}
        >
          <AppText variant="label" color={colors.sageDeep}>
            {copy.onboarding.back}
          </AppText>
        </Pressable>
      ) : null}
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
    </View>
  );
}
