export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radii = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
} as const;

export interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  incoming: string;
  incomingSurface: string;
  outgoing: string;
  outgoingSurface: string;
  danger: string;
}

// Text contrast ratios are at least 4.5:1 against their theme backgrounds.
export const lightPalette: Palette = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#E9EBEF',
  border: '#DADDE3',
  text: '#15171C',
  textMuted: '#5B6170',
  accent: '#A3195B',
  onAccent: '#FFFFFF',
  incoming: '#0B7A3B',
  incomingSurface: '#E3F4EA',
  outgoing: '#15171C',
  outgoingSurface: '#ECEDF1',
  danger: '#B42318',
};

export const darkPalette: Palette = {
  background: '#0E0F12',
  surface: '#1A1C21',
  surfaceMuted: '#24272E',
  border: '#2F333B',
  text: '#F2F3F5',
  textMuted: '#A4AAB6',
  accent: '#F07AB0',
  onAccent: '#1A0710',
  incoming: '#5BD08A',
  incomingSurface: '#16301F',
  outgoing: '#F2F3F5',
  outgoingSurface: '#24272E',
  danger: '#FF8A80',
};
