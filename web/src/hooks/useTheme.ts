import { useEffect, useState } from 'react';
import { Theme, EffectiveTheme } from '../types';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<EffectiveTheme>('dark');

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
