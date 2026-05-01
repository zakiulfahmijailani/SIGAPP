/**
 * Returns a Tailwind color class string based on the priority tier.
 */
export function getTierColor(tier: 'KRITIS' | 'TINGGI' | 'SEDANG' | 'RENDAH'): string {
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
 * NOTE: These are fallback thresholds. Prefer using priority_tier from Supabase directly.
 */
export function getTierFromIndex(index: number): 'KRITIS' | 'TINGGI' | 'SEDANG' | 'RENDAH' {
  if (index >= 0.75) return 'KRITIS'
  if (index >= 0.50) return 'TINGGI'
  if (index >= 0.25) return 'SEDANG'
  return 'RENDAH'
}

/**
 * Formats a numeric index to a fixed two-decimal-place string (e.g. "0.82").
 */
export function formatIndex(index: number): string {
  return index.toFixed(2)
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
