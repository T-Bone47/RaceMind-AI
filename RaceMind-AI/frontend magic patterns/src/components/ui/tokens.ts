/**
 * RaceMind AI design tokens.
 * Single source of truth for semantic colour. Colour must always carry meaning —
 * never decorate with an accent that does not encode state.
 */

export const status = {
  optimal: '#00D68F',
  warning: '#FFC531',
  critical: '#E10600',
  info: '#3D8BFF',
  ai: '#00E5FF',
  neutral: '#8E99A8'
} as const;

export type StatusKey = keyof typeof status;

/** Official tyre compound colours. Always paired with the compound name in text. */
export const compound = {
  SOFT: { color: '#E10600', ink: '#FFFFFF', short: 'S', name: 'Soft' },
  MEDIUM: { color: '#FFC531', ink: '#1A1400', short: 'M', name: 'Medium' },
  HARD: { color: '#F3F7FB', ink: '#0A0C10', short: 'H', name: 'Hard' },
  INTERMEDIATE: { color: '#00D68F', ink: '#04140E', short: 'I', name: 'Intermediate' },
  WET: { color: '#3D8BFF', ink: '#03101F', short: 'W', name: 'Wet' }
} as const;

export type CompoundKey = keyof typeof compound;

export function compoundOf(name: string) {
  const key = name.toUpperCase().replace('PROJECTED ', '').trim() as CompoundKey;
  return compound[key] ?? compound.MEDIUM;
}

/** Tyre / brake surface temperature banding, returned with a text label so colour is never the only signal. */
export function thermalBand(temp: number): {color: string;label: string;} {
  if (temp > 120) return { color: status.critical, label: 'Overheating' };
  if (temp > 108) return { color: '#FF7A29', label: 'Hot' };
  if (temp > 95) return { color: status.optimal, label: 'In window' };
  if (temp > 82) return { color: status.info, label: 'Cool' };
  return { color: status.neutral, label: 'Cold' };
}

/** Wear banding with an explicit label for accessibility. */
export function wearBand(wear: number): {color: string;label: string;} {
  if (wear > 70) return { color: status.critical, label: 'Critical' };
  if (wear > 55) return { color: '#FF7A29', label: 'High' };
  if (wear > 35) return { color: status.warning, label: 'Moderate' };
  return { color: status.optimal, label: 'Healthy' };
}

/** Shared geometry so every surface in the product agrees. */
export const radius = { sm: 6, md: 8, lg: 12, xl: 14 } as const;
export const iconSize = { xs: 'h-3 w-3', sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-[18px] w-[18px]' } as const;