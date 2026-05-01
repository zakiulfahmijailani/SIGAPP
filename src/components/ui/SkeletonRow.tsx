interface SkeletonRowProps {
  columns?: number;
}

export function SkeletonRow({ columns = 5 }: SkeletonRowProps) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="skeleton-shimmer rounded"
            style={{
              height: 14,
              width: i === 0 ? "60%" : i === columns - 1 ? "40%" : "75%",
              borderRadius: 4,
            }}
          />
        </td>
      ))}
    </tr>
  );
}
