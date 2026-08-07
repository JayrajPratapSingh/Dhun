// Central design tokens for the app (dark, Spotify/Apple-Music inspired).
export const colors = {
  bg: '#0B0B0F',
  bgElevated: '#15151C',
  card: '#1C1C26',
  cardAlt: '#23232F',
  primary: '#1DB954', // vivid green accent
  primaryDark: '#149C43',
  accent: '#8B5CF6',
  text: '#FFFFFF',
  textMuted: '#A2A2B0',
  textFaint: '#6C6C7A',
  border: '#2A2A36',
  danger: '#FF4D4F',
  gold: '#F5C518',
  gradientTop: '#2A1B4D',
  gradientBottom: '#0B0B0F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '800', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, fontWeight: '500', color: colors.text },
  small: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '600', color: colors.textFaint },
};

export default { colors, spacing, radius, typography };
