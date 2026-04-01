import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getColors } from '@/constants/colors';

/** Returns the themed color palette based on current dark/light mode */
export function useColors() {
  const { isDark } = useTheme();
  return useMemo(() => getColors(isDark), [isDark]);
}
