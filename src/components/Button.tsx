import * as Haptics from 'expo-haptics';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
  style,
}: Props) {
  const { colors } = useTheme();
  const background =
    variant === 'primary' ? colors.orange : variant === 'secondary' ? colors.sage : 'transparent';
  const textColor = variant === 'ghost' ? colors.sageDeep : colors.onAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        {
          minHeight: 56,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: pressed && variant === 'primary' ? colors.orangePressed : background,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <AppText variant="label" color={textColor} style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}
