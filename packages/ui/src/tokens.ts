/**
 * Design tokens for RaceMind AI. Colors are drawn from real timing-screen
 * conventions, not arbitrary: blue is brand/primary, green/amber/red are
 * semantic (faster/marginal/critical) and used consistently for that
 * meaning everywhere - never decoratively for something unrelated to
 * performance state.
 */

export const colors = {
  carbon: "#0A0B0D", // base background
  graphite: "#17191D", // surface (cards, panels)
  graphiteLight: "#212429", // elevated surface / hover
  border: "#2A2D33",

  textPrimary: "#F5F6F7",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",

  electricBlue: "#2F7FFF", // brand / primary actions / links
  electricBlueDim: "#1B4FB0",

  signalGreen: "#22D67A", // faster / optimal / positive delta
  amber: "#FFB020", // caution / marginal / degrading
  red: "#FF4D4D", // critical / slower / negative delta
} as const;

export const fonts = {
  sans: "'Fira Sans', ui-sans-serif, system-ui, sans-serif",
  mono: "'Fira Code', ui-monospace, 'SFMono-Regular', monospace",
} as const;

export type ColorToken = keyof typeof colors;
