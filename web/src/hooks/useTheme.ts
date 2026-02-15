import { useEffect, useState } from 'react';
import { Theme, EffectiveTheme } from '../types';

export function useTheme() {
  const getSystemTheme = (): EffectiveTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>(getSystemTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return { theme, setTheme, effectiveTheme };
}
