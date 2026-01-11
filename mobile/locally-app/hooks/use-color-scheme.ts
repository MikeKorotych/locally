import { useThemePreference } from './use-theme-preference';

export function useColorScheme() {
  return useThemePreference((state) => state.theme);
}
