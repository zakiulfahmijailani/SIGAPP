/**
 * Returns a Tailwind color class string based on the priority tier.
 */
export function getTierColor(tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (tier) {
    case 'CRITICAL':
      return 'text-red-600 bg-red-100'
    case 'HIGH':
      return 'text-orange-600 bg-orange-100'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100'
    case 'LOW':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

/**
 * Determines the priority tier from a SIGAPP composite index value (0–1).
 * Higher index = higher urgency.
 */
export function getTierFromIndex(index: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (index >= 0.75) return 'CRITICAL'
  if (index >= 0.50) return 'HIGH'
  if (index >= 0.25) return 'MEDIUM'
  return 'LOW'
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
