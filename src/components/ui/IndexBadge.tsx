import { getTierFromIndex, formatIndex } from "@/lib/utils";

interface IndexBadgeProps {
  index?: number;
  tier?: "KRITIS" | "TINGGI" | "SEDANG" | "RENDAH";
}

const tierConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  KRITIS: { label: "Kritis",  bg: "#EF4444", text: "#FFFFFF" },
  TINGGI: { label: "Tinggi",  bg: "#F97316", text: "#FFFFFF" },
  SEDANG: { label: "Sedang",  bg: "#EAB308", text: "#422006" },
  RENDAH: { label: "Rendah",  bg: "#22C55E", text: "#FFFFFF" },
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
