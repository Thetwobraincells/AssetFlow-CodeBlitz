export type Status =
  | "available" | "allocated" | "reserved" | "maintenance"
  | "lost" | "retired" | "disposed"
  | "pending" | "approved" | "rejected" | "resolved"
  // booking statuses
  | "ongoing" | "upcoming" | "completed"
  // audit checklist
  | "verified" | "missing" | "damaged" | "draft" | "closed" | "active"
  // general
  | "inactive";

const statusStyles: Record<Status, string> = {
  available:  "bg-teal/10 text-teal border-teal/30",
  allocated:  "bg-amber/10 text-amber border-amber/30",
  reserved:   "bg-blue/10 text-blue border-blue/30",
  maintenance:"bg-orange/10 text-orange border-orange/30",
  lost:       "bg-red/10 text-red border-red/30",
  retired:    "bg-slate/10 text-slate border-slate/30",
  disposed:   "bg-slate/10 text-slate border-slate/30 line-through",
  pending:    "bg-slate/10 text-slate border-slate/30",
  approved:   "bg-teal/10 text-teal border-teal/30",
  rejected:   "bg-red/10 text-red border-red/30",
  resolved:   "bg-teal/10 text-teal border-teal/30",
  // booking
  ongoing:    "bg-teal/10 text-teal border-teal/30",
  upcoming:   "bg-blue/10 text-blue border-blue/30",
  completed:  "bg-slate/10 text-slate border-slate/30",
  // audit
  verified:   "bg-teal/10 text-teal border-teal/30",
  missing:    "bg-red/10 text-red border-red/30",
  damaged:    "bg-orange/10 text-orange border-orange/30",
  draft:      "bg-blue/10 text-blue border-blue/30",
  closed:     "bg-slate/10 text-slate border-slate/30",
  active:     "bg-teal/10 text-teal border-teal/30",
  // general
  inactive:   "bg-slate/10 text-slate border-slate/30",
};

export default function StatusPill({ status, label }: { status: Status; label: string }) {
  const style = statusStyles[status] ?? "bg-slate/10 text-slate border-slate/30";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}