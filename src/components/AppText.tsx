import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'display' | 'title' | 'body' | 'label' | 'muted';

type Props = TextProps & {
  variant?: Variant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const { colors, fonts } = useTheme();
  const variantStyle: Record<Variant, TextStyle> = {
    display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, color: colors.text },
    title: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, color: colors.text },
    body: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: colors.text },
    label: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: colors.muted },
  };

  return (
    <Text
      maxFontSizeMultiplier={2}
      style={[variantStyle[variant], color ? { color } : null, style]}
      {...rest}
    />
  );
}
