import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { darkColors, lightColors, type Colors } from './tokens';

const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

type Theme = {
  colors: Colors;
  fonts: typeof fonts;
  dark: boolean;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const colors = dark ? darkColors : lightColors;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.body.style.backgroundColor = colors.bg;
    document.body.style.margin = '0';
  }, [colors.bg]);

  const value = useMemo(() => ({ colors, fonts, dark }), [colors, dark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme außerhalb des ThemeProvider');
  }
  return value;
}
