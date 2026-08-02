export const tokens = {
  ink950: '#07111F',
  navy800: '#0B2B46',
  cyan500: '#19B8E6',
  copper500: '#C77A3D',
  mist50: '#F5FAFC',
  success500: '#16A36A',
  danger500: '#D64545',
  fontBody: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  minTouch: '44px',
} as const;

export type Tokens = typeof tokens;
