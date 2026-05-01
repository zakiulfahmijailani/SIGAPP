import { getTierFromIndex, formatIndex, PriorityTier, TIER_BG_COLORS } from "@/lib/utils";

interface IndexBadgeProps {
  index?: number;
  tier?: PriorityTier;
}

const tierConfig: Record<
  PriorityTier,
  { label: string; bg: string; text: string }
> = {
  KRITIS: { label: "Kritis",  bg: TIER_BG_COLORS.KRITIS, text: "#FFFFFF" },
  TINGGI: { label: "Tinggi",  bg: TIER_BG_COLORS.TINGGI, text: "#FFFFFF" },
  SEDANG: { label: "Sedang",  bg: TIER_BG_COLORS.SEDANG, text: "#422006" },
  RENDAH: { label: "Rendah",  bg: TIER_BG_COLORS.RENDAH, text: "#FFFFFF" },
};

export function IndexBadge({ index, tier }: IndexBadgeProps) {
  const resolvedTier = tier ?? (index !== undefined ? getTierFromIndex(index) : "RENDAH");
  const config = tierConfig[resolvedTier] ?? tierConfig.RENDAH;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap"
      style={{
        backgroundColor: config.bg,
        color: config.text,
      }}
    >
      {config.label}
      {index !== undefined && (
        <span className="opacity-80 font-normal">
          {formatIndex(index)}
        </span>
      )}
    </span>
  );
}
