import { useApp } from '@/context/AppContext';
import { en, ar } from '@/constants/strings';

export function useStrings() {
  const { language } = useApp();
  return language === 'ar' ? ar : en;
}

export function useIsRTL() {
  const { language } = useApp();
  return language === 'ar';
}
