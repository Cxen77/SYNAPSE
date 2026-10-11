export const Colors = {
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryLight: '#EFF6FF',
    accent: '#3B82F6',
    destructive: '#EF4444',
    destructiveLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    badge: '#F3F4F6',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabActive: '#2563EB',
    tabInactive: '#9CA3AF',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primaryLight: 'rgba(59, 130, 246, 0.15)',
    accent: '#60A5FA',
    destructive: '#F87171',
    destructiveLight: 'rgba(239, 68, 68, 0.15)',
    success: '#34D399',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#FBBF24',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    badge: '#334155',
    tabBar: '#1E293B',
    tabBarBorder: '#334155',
    tabActive: '#60A5FA',
    tabInactive: '#64748B',
  }
};

export const Typography = {
  fontFamily: 'System',
  heading1: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  heading2: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  heading3: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  bodyLarge: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  button: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
};
