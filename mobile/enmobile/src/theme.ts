import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  background: 'transparent',
  surface: 'rgba(255, 255, 255, 0.4)',
  primary: '#1A1A1A',
  primaryLight: '#334155',
  secondary: '#4A4A4A',
  secondaryLight: '#94A3B8',
  accent: '#D95C14',

  gradientAmber: ['#FEF3C7', '#FDE68A'],
  gradientTeal: ['#CCFBF1', '#99F6E4'],
  gradientCream: ['#FEF3C7', '#D1FAE5'],
  gradientIndigo: ['#6366F1', '#8B5CF6'],

  success: '#4ADE80',
  successBg: '#F0FDF4',
  successText: '#16A34A',
  warning: '#FBBF24',
  warningBg: '#FEF3C7',
  warningText: '#D97706',
  error: '#F87171',
  errorBg: '#FEF2F2',
  errorText: '#DC2626',
  info: '#60A5FA',
  infoBg: '#EFF6FF',
  infoText: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',
  border: 'rgba(255, 255, 255, 0.4)',
  cardBorder: 'rgba(255, 255, 255, 0.6)',
  overlay: 'rgba(0,0,0,0.5)',

  avatarBlue: '#DBEAFE',
  avatarGreen: '#D1FAE5',
  avatarPurple: '#EDE9FE',
  avatarOrange: '#FFEDD5',
  avatarRose: '#FFE4E6',
  avatarTeal: '#CCFBF1',
  avatarAmber: '#FEF3C7',
};

export const FONTS = {
  h1: { fontFamily: 'Outfit_700Bold', fontSize: 30, color: COLORS.primary, letterSpacing: -0.5 },
  h2: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: COLORS.primary },
  h3: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: COLORS.primary },
  body: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: COLORS.primary },
  bodySmall: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: COLORS.secondary },
  caption: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: COLORS.secondaryLight, textTransform: 'uppercase' as const, letterSpacing: 1 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: COLORS.primary },
  button: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: COLORS.white },
};

export const SHADOWS = {
  soft: {
    shadowColor: '#1F2687',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 0,
  },
  medium: {
    shadowColor: '#1F2687',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 0,
  },
  strong: {
    shadowColor: '#1F2687',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 0,
  },
  btnGlow: {
    shadowColor: '#D95C14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
  }
};

export const SIZES = {
  screenWidth: width,
  screenHeight: height,
  padding: 24,
  paddingSmall: 16,
  radius: 24,
  radiusSmall: 16,
  radiusFull: 999,
  navHeight: 80,
  navBottomOffset: 24,
};
