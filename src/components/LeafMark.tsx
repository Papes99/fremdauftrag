import Svg, { Circle, Path } from 'react-native-svg';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export function LeafMark({ size = 96 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      accessibilityRole="image"
      accessibilityLabel={copy.a11y.leaf}
    >
      <Circle cx="48" cy="48" r="48" fill={colors.sageSoft} />
      <Path
        d="M48 70c0-14 1-22 2-30"
        stroke={colors.sageDeep}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M49 52c-14-2-22-12-16-20 8 2 14 10 16 20Z" fill={colors.sage} />
      <Path d="M50 44c12-4 20-14 14-20-8 4-12 12-14 20Z" fill={colors.sageDeep} />
    </Svg>
  );
}
