import { getTierFromIndex, formatIndex } from "@/lib/utils";

interface IndexBadgeProps {
  index?: number;
  tier?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

const tierConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  CRITICAL: { label: "Critical", bg: "#EF4444", text: "#FFFFFF" },
  HIGH: { label: "High", bg: "#F97316", text: "#FFFFFF" },
  MEDIUM: { label: "Medium", bg: "#EAB308", text: "#422006" },
  LOW: { label: "Low", bg: "#22C55E", text: "#FFFFFF" },
};

export function IndexBadge({ index, tier }: IndexBadgeProps) {
  const resolvedTier = tier ?? (index !== undefined ? getTierFromIndex(index) : "LOW");
  const config = tierConfig[resolvedTier] ?? tierConfig.LOW;

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
