import { router, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { copy } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

const items = [
  { href: '/heute', label: copy.nav.today },
  { href: '/schreiben', label: copy.nav.write },
  { href: '/verlauf', label: copy.nav.history },
] as const;

export function MainNav() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const path = usePathname();

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        gap: 8,
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.line,
      }}
    >
      {items.map((item) => {
        const active = path === item.href;
        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) router.replace(item.href);
            }}
            style={{
              flex: 1,
              minHeight: 48,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.sageSoft : 'transparent',
            }}
          >
            <AppText variant="label" color={colors.sageDeep}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
