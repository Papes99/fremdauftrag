import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
};

export function Screen({ children, footer }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <View style={{ flex: 1, minHeight: 0, paddingHorizontal: 24 }}>{children}</View>
      {footer ? (
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), gap: 10 }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
