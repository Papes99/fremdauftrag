import { View } from 'react-native';
import { LeafMark } from '@/components/LeafMark';
import { useTheme } from '@/theme/ThemeProvider';

export function BootMark() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <LeafMark />
    </View>
  );
}
