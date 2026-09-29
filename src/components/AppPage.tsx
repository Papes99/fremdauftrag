import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainNav } from '@/components/MainNav';
import { useTheme } from '@/theme/ThemeProvider';

export function AppPage({ children, nav = false }: { children: ReactNode; nav?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + (nav ? 108 : 28),
          gap: 16,
        }}
      >
        {children}
      </ScrollView>
      {nav ? <MainNav /> : null}
    </View>
  );
}
