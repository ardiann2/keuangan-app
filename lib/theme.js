export const DARK = {
  bg:        '#000000',
  surface:   '#0A0A0A',
  surfaceUp: '#111111',
  surfaceHi: '#1A1A1A',
  border:    '#222222',
  borderHi:  '#333333',
  textPri:   '#F5F5F5',
  textSec:   '#888888',
  textMuted: '#444444',
  accent:    '#6366F1',
  accentDim: '#1E1B4B',
  income:  { solid:'#34D399', dim:'#052E1A', border:'#064E2E', glow:'rgba(52,211,153,0.15)'  },
  outcome: { solid:'#F87171', dim:'#2D0A0A', border:'#4D1515', glow:'rgba(248,113,113,0.15)' },
  saving:  { solid:'#FBBF24', dim:'#2D1F00', border:'#4D3500', glow:'rgba(251,191,36,0.15)'  },
  asset:   { solid:'#A78BFA', dim:'#1A1030', border:'#2E1B52', glow:'rgba(167,139,250,0.15)' },
}

export const getTheme = () => DARK