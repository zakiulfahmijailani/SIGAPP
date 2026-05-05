export type PriorityTier = 'KRITIS' | 'TINGGI' | 'SEDANG' | 'RENDAH';

export const TIER_TEXT_COLORS: Record<PriorityTier, string> = {
  KRITIS: "text-red-600",
  TINGGI: "text-orange-500",
  SEDANG: "text-yellow-600",
  RENDAH: "text-green-600",
};

export const TIER_BG_COLORS: Record<PriorityTier, string> = {
  KRITIS: "#EF4444",
  TINGGI: "#F97316",
  SEDANG: "#EAB308",
  RENDAH: "#22C55E",
};

/**
 * Returns a Tailwind color class string based on the priority tier.
 */
export function getTierColor(tier: PriorityTier): string {
  switch (tier) {
    case 'KRITIS':
      return 'text-red-600 bg-red-100'
    case 'TINGGI':
      return 'text-orange-600 bg-orange-100'
    case 'SEDANG':
      return 'text-yellow-600 bg-yellow-100'
    case 'RENDAH':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Determines the priority tier from a SIGAPP composite index value (0–1).
 * Higher index = higher urgency.
 */
export function getTierFromIndex(index: number): PriorityTier {
  if (index >= 0.65) return 'KRITIS'
  if (index >= 0.50) return 'TINGGI'
  if (index >= 0.35) return 'SEDANG'
  return 'RENDAH'
}

/**
 * Formats a numeric index to a fixed two-decimal-place string (e.g. "0.82").
 */
export function formatIndex(index: number): string {
  return index.toFixed(2)
}

/**
 * Safely parses a Supabase numeric/string value to a float.
 * Supabase returns `numeric` columns as strings (e.g. "0.7423").
 * Handles null, undefined, empty string, and NaN gracefully.
 */
export function parseIndex(value: string | number | null | undefined): number {
  if (value == null || value === '') return 0
  const parsed = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Returns a human-readable pillar name from its key.
 */
export function getPillarName(key: string): string {
  const pillarNames: Record<string, string> = {
    p1_quality_gap: 'Quality Gap',
    p2_spatial_inequity: 'Spatial Inequity',
    p3_structural_risk: 'Structural Risk',
    p4_public_signal: 'Public Signal',
  }

  return pillarNames[key] ?? key
}
