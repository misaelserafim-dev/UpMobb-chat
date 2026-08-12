export type TopNavProps = {
  active?: string;
  searchQuery?: string;
  searchDisabled?: boolean;
  themeId?: string;
  onSearchChange?: (value: string) => void;
  onNavigate?: (id: string) => void;
  onThemeChange?: (id: string) => void;
  onLogout?: () => void;
};
