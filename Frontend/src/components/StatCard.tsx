import type { LucideIcon } from "lucide-react";

type AccentColor = "amber" | "teal" | "red" | "blue" | "orange" | "slate";

const accentMap: Record<AccentColor, string> = {
  amber: "bg-amber",
  teal: "bg-teal",
  red: "bg-red",
  blue: "bg-blue",
  orange: "bg-orange",
  slate: "bg-slate",
};

const textAccentMap: Record<AccentColor, string> = {
  amber: "text-amber",
  teal: "text-teal",
  red: "text-red",
  blue: "text-blue",
  orange: "text-orange",
  slate: "text-slate",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "amber",
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: AccentColor;
  sublabel?: string;
}) {
  return (
    <div className="relative bg-surface border border-border rounded-md p-4 overflow-hidden hover:border-border-bright transition-colors group">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accentMap[accent]} scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom`}
      />
      <div className="flex justify-between items-start mb-2">
        <h3 className="label-caps text-text-muted">{label}</h3>
        <Icon size={16} strokeWidth={1.5} className="text-text-muted" />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="font-mono text-2xl leading-none text-text">{value}</p>
      </div>
      {sublabel && (
        <p className={`font-mono text-xs mt-1 ${textAccentMap[accent]}`}>{sublabel}</p>
      )}
    </div>
  );
}