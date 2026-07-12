import { useState } from "react";
import { Filter, Plus, ArrowRight, Mail, AlertTriangle, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import Button from "../components/Button";
import NewAllocationRequestModal, { type AllocationRequest } from "../components/NewAllocationRequestModal";
import TransferRequestModal from "../components/TransferRequestModal";
import InspectionModal from "../components/InspectionModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

type AllocStatus = "pending" | "active" | "overdue" | "awaiting_inspection";

interface AllocCard {
  id: string;
  assetTag: string;
  assetName: string;
  department: string;
  person: string;
  dueDate: string;
  status: AllocStatus;
  type?: "RESERVED" | "TRANSFER" | "ALLOCATED" | "RETURNED" | "OVERDUE";
  conflict?: string;
}

/* ------------------------------------------------------------------ */
/* Initial data                                                          */
/* ------------------------------------------------------------------ */

const initCards: AllocCard[] = [
  {
    id: "REQ-8492", assetTag: "AST-0991 ", assetName: "Heavy Duty Scissor Lift",
    department: "Engineering", person: "M. Chen", dueDate: "Oct 12",
    status: "pending", type: "RESERVED",
  },
  {
    id: "REQ-8501", assetTag: "AF-0001", assetName: "Dell Latitude 5420",
    department: "Engineering", person: "R. Davis", dueDate: "—",
    status: "pending", type: "TRANSFER",
    conflict: "Currently held by Priya Shah. Submit a transfer request instead of a new allocation.",
  },
  {
    id: "AST-0991", assetTag: "AST-0991", assetName: "Thermal Imaging Camera X2",
    department: "Maintenance", person: "T. Silva", dueDate: "Oct 15",
    status: "active", type: "ALLOCATED",
  },
  {
    id: "AST-1102", assetTag: "AST-1102", assetName: "Portable Generator 5kW",
    department: "Field Ops", person: "R. Davis", dueDate: "Oct 08",
    status: "overdue", type: "OVERDUE",
  },
  {
    id: "AST-0554", assetTag: "AST-0554", assetName: "Industrial Vacuum (Wet/Dry)",
    department: "Facilities", person: "L. Gomez", dueDate: "—",
    status: "awaiting_inspection", type: "RETURNED",
  },
];

const statusGroups: { key: AllocStatus; label: string; dot: string; filterLabel: string }[] = [
  { key: "pending",              label: "Pending Requests",    dot: "bg-blue",  filterLabel: "Pending" },
  { key: "active",               label: "Active Allocations",  dot: "bg-teal",  filterLabel: "Active" },
  { key: "overdue",              label: "Overdue",             dot: "bg-red",   filterLabel: "Overdue" },
  { key: "awaiting_inspection",  label: "Awaiting Inspection", dot: "bg-amber", filterLabel: "Awaiting Inspection" },
];

const departments = ["All", "Engineering", "Facilities", "Field Ops", "Marketing", "IT", "Logistics", "Design"];

/* ------------------------------------------------------------------ */
/* Column header                                                         */
/* ------------------------------------------------------------------ */

function ColumnHeader({ dotColor, title, count }: { dotColor: string; title: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h2 className="label-caps text-text">{title}</h2>
      </div>
      <span className="text-xs font-mono bg-surface-high border border-border rounded px-1.5 py-0.5 text-text-muted">
        {count}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Allocations() {
  const [cards, setCards]                     = useState<AllocCard[]>(initCards);
  const [showNewRequest, setShowNewRequest]   = useState(false);
  const [showTransfer, setShowTransfer]       = useState<AllocCard | null>(null);
  const [showInspection, setShowInspection]   = useState<AllocCard | null>(null);
  const [filterOpen, setFilterOpen]           = useState(false);
  const [statusFilter, setStatusFilter]       = useState<AllocStatus | "all">("all");
  const [deptFilter, setDeptFilter]           = useState("All");
  const { show, ToastOutlet }                 = useToast();

  /* Filtered view */
  const visibleCards = cards.filter((c) => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchDept   = deptFilter === "All" || c.department === deptFilter;
    return matchStatus && matchDept;
  });

  /* Helpers */
  function addCard(req: AllocationRequest) {
    const newCard: AllocCard = {
      id: req.id,
      assetTag: req.assetTag,
      assetName: req.assetName,
      department: req.department,
      person: req.requestedBy,
      dueDate: req.neededBy,
      status: "pending",
      type: req.type === "reserve" ? "RESERVED" : "ALLOCATED",
    };
    setCards((prev) => [newCard, ...prev]);
    show(`Request ${req.id} submitted.`);
    setShowNewRequest(false);
  }

  function approveCard(id: string) {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, status: "active" } : c));
    show("Request approved — asset allocated.", "success");
  }

  function rejectCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    show("Request rejected and removed.", "info");
  }

  function sendReminder(card: AllocCard) {
    show(`Reminder email sent to ${card.person}.`, "info");
  }

  function saveInspection() {
    if (!showInspection) return;
    setCards((prev) => prev.filter((c) => c.id !== showInspection.id));
    show("Inspection logged. Asset returned to available.", "success");
    setShowInspection(null);
  }

  function saveTransfer() {
    show("Transfer request submitted for approval.", "success");
    setShowTransfer(null);
  }

  /* Card border colours by status */
  const borderByStatus: Record<AllocStatus, string> = {
    pending: "border-l-blue",
    active: "border-l-teal",
    overdue: "border-l-red",
    awaiting_inspection: "border-l-amber",
  };
  const bgByStatus: Record<AllocStatus, string> = {
    pending: "bg-surface",
    active: "bg-surface",
    overdue: "bg-red/5",
    awaiting_inspection: "bg-surface",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Manage asset distribution and return flow across departments.</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1.5"
            onClick={() => setFilterOpen((v) => !v)}
          >
            <Filter size={14} /> Filter
            {filterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </Button>
          <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setShowNewRequest(true)}>
            <Plus size={14} /> New Request
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="flex flex-wrap items-center gap-3 bg-surface border border-border rounded-md px-4 py-3">
          <div>
            <p className="label-caps text-text-muted mb-1">Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded text-xs border transition-colors ${
                  statusFilter === "all" ? "bg-amber/10 border-amber text-amber" : "border-border text-text-muted hover:text-text"
                }`}
              >
                All
              </button>
              {statusGroups.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setStatusFilter(g.key)}
                  className={`px-3 py-1 rounded text-xs border transition-colors ${
                    statusFilter === g.key ? "bg-amber/10 border-amber text-amber" : "border-border text-text-muted hover:text-text"
                  }`}
                >
                  {g.filterLabel}
                </button>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <p className="label-caps text-text-muted mb-1">Department</p>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-surface-high border border-border rounded-md px-3 py-1.5 text-xs text-text focus:outline-none"
            >
              {departments.map((d) => <option key={d}>{d === "All" ? "All Departments" : d}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {statusGroups.map((group) => {
          const groupCards = visibleCards.filter((c) => c.status === group.key);
          return (
            <div key={group.key}>
              <ColumnHeader dotColor={group.dot} title={group.label} count={groupCards.length} />
              <div className="space-y-3">
                {groupCards.map((card) => (
                  <div
                    key={card.id}
                    className={`${bgByStatus[card.status]} border-l-2 ${borderByStatus[card.status]} border border-border rounded-md p-3 ${
                      card.status === "overdue" ? "border border-red/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-amber">{card.id}</span>
                      {card.type && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                          card.type === "OVERDUE" ? "border-red/30 bg-red/10 text-red" :
                          card.type === "TRANSFER" ? "border-amber/30 bg-amber/10 text-amber" :
                          card.type === "RETURNED" ? "border-amber/30 bg-amber/10 text-amber" :
                          card.type === "RESERVED" ? "border-blue/30 bg-blue/10 text-blue" :
                          "border-teal/30 bg-teal/10 text-teal"
                        }`}>
                          {card.type}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-text">{card.assetName}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{card.department} / {card.person}</p>

                    {/* Conflict warning */}
                    {card.conflict && (
                      <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-1.5 text-xs text-red">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        <span>{card.conflict}</span>
                      </div>
                    )}

                    {/* Due date row */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                      {card.status === "overdue" ? (
                        <span className="flex items-center gap-1 text-xs text-red">
                          <AlertTriangle size={12} /> Due: {card.dueDate} (overdue)
                        </span>
                      ) : card.dueDate !== "—" ? (
                        <span className="text-xs text-text-muted">
                          {card.status === "pending" ? "Needed:" : "Due:"} {card.dueDate}
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {card.status === "overdue" && (
                          <button
                            onClick={() => sendReminder(card)}
                            className="text-red hover:text-red/80 transition-colors"
                            title="Send reminder"
                          >
                            <Mail size={14} />
                          </button>
                        )}
                        {card.status === "pending" && !card.conflict && (
                          <>
                            <button
                              onClick={() => rejectCard(card.id)}
                              className="p-1 rounded border border-red/30 text-red hover:bg-red/10 transition-colors"
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                            <button
                              onClick={() => approveCard(card.id)}
                              className="p-1 rounded border border-teal/30 text-teal hover:bg-teal/10 transition-colors"
                              title="Approve"
                            >
                              <Check size={12} />
                            </button>
                          </>
                        )}
                        {card.status === "pending" && card.conflict && (
                          <ArrowRight size={14} className="text-text-muted" />
                        )}
                      </div>
                    </div>

                    {/* Transfer button for conflict cards */}
                    {card.conflict && (
                      <Button
                        variant="outline"
                        className="w-full mt-2 !py-1.5 text-xs"
                        onClick={() => setShowTransfer(card)}
                      >
                        Submit Transfer Request
                      </Button>
                    )}

                    {/* Log inspection button */}
                    {card.status === "awaiting_inspection" && (
                      <Button
                        variant="outline"
                        className="w-full mt-3 !py-1.5 text-xs"
                        onClick={() => setShowInspection(card)}
                      >
                        Log Inspection
                      </Button>
                    )}
                  </div>
                ))}
                {groupCards.length === 0 && (
                  <div className="text-xs text-text-muted border border-dashed border-border rounded-md p-4 text-center">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showNewRequest && (
        <NewAllocationRequestModal onClose={() => setShowNewRequest(false)} onSave={addCard} />
      )}
      {showTransfer && (
        <TransferRequestModal
          assetTag={showTransfer.assetTag}
          assetName={showTransfer.assetName}
          fromEmployee="Priya Shah"
          onClose={() => setShowTransfer(null)}
          onSave={saveTransfer}
        />
      )}
      {showInspection && (
        <InspectionModal
          assetTag={showInspection.assetTag}
          assetName={showInspection.assetName}
          returnedBy={showInspection.person}
          onClose={() => setShowInspection(null)}
          onSave={saveInspection}
        />
      )}

      {ToastOutlet}
    </div>
  );
}