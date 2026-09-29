import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export function ConnectionBanner({ connected }: { connected: boolean }) {
  const { colors } = useTheme();
  const title = connected ? copy.home.connectedTitle : copy.home.notConnectedTitle;
  const body = connected ? copy.home.connectedBody : copy.home.notConnectedBody;

  return (
    <View
      accessibilityRole="summary"
      style={{
        backgroundColor: colors.sageSoft,
        borderRadius: 20,
        padding: 18,
        gap: 6,
      }}
    >
      <AppText variant="label" color={colors.sageDeep}>
        {title}
      </AppText>
      <AppText variant="body">{body}</AppText>
    </View>
  );
}
