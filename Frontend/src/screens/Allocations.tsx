import { Filter, Plus, ArrowRight, Mail, AlertTriangle } from "lucide-react";
import Button from "../components/Button";

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

export default function Allocations() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Manage asset distribution and return flow across departments.</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1.5">
            <Filter size={14} /> Filter
          </Button>
          <Button variant="primary" className="flex items-center gap-1.5">
            <Plus size={14} /> New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Pending Requests */}
        <div>
          <ColumnHeader dotColor="bg-blue" title="Pending Requests" count={2} />
          <div className="space-y-3">
            <div className="bg-surface border-l-2 border-l-blue border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber">REQ-8492</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-blue/30 bg-blue/10 text-blue font-mono">RESERVED</span>
              </div>
              <h3 className="text-sm font-medium text-text">Heavy Duty Scissor Lift</h3>
              <p className="text-xs text-text-muted mt-0.5">Eng Dept / M. Chen</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-text-muted">Needed: Oct 12</span>
                <ArrowRight size={14} className="text-text-muted" />
              </div>
            </div>

            {/* Conflict card — double-allocation flow from PRD §6.4 */}
            <div className="bg-surface border-l-2 border-l-red border border-red/30 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber">REQ-8501</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-amber/30 bg-amber/10 text-amber font-mono">TRANSFER</span>
              </div>
              <h3 className="text-sm font-medium text-text">Dell Latitude 5420</h3>
              <p className="text-xs text-text-muted mt-0.5">Eng Dept / R. Davis</p>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-1.5 text-xs text-red">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>Currently held by <strong>Priya Shah</strong>. Submit a transfer request instead of a new allocation.</span>
              </div>
              <Button variant="outline" className="w-full mt-2 !py-1.5 text-xs">Submit Transfer Request</Button>
            </div>
          </div>
        </div>

        {/* Active Allocations */}
        <div>
          <ColumnHeader dotColor="bg-teal" title="Active Allocations" count={2} />
          <div className="space-y-3">
            <div className="bg-surface border-l-2 border-l-teal border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber">AST-0991</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-teal/30 bg-teal/10 text-teal font-mono">ALLOCATED</span>
              </div>
              <h3 className="text-sm font-medium text-text">Thermal Imaging Camera X2</h3>
              <p className="text-xs text-text-muted mt-0.5">Maint. / T. Silva</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-text-muted">Due: Oct 15</span>
              </div>
            </div>

            {/* Overdue — reuses the Dashboard "Overdue Returns" urgent treatment */}
            <div className="bg-red/5 border-l-2 border-l-red border border-red/30 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber">AST-1102</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-red/30 bg-red/10 text-red font-mono">OVERDUE</span>
              </div>
              <h3 className="text-sm font-medium text-text">Portable Generator 5kW</h3>
              <p className="text-xs text-text-muted mt-0.5">Field Ops / R. Davis</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                <span className="flex items-center gap-1 text-xs text-red">
                  <AlertTriangle size={12} /> Due: Oct 08 (3d late)
                </span>
                <button className="text-red hover:text-red/80"><Mail size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Awaiting Inspection */}
        <div>
          <ColumnHeader dotColor="bg-amber" title="Awaiting Inspection" count={1} />
          <div className="space-y-3">
            <div className="bg-surface border-l-2 border-l-amber border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-amber">AST-0554</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded border border-amber/30 bg-amber/10 text-amber font-mono">RETURNED</span>
              </div>
              <h3 className="text-sm font-medium text-text">Industrial Vacuum (Wet/Dry)</h3>
              <p className="text-xs text-text-muted mt-0.5">Rtn by: Facil / L. Gomez</p>
              <Button variant="outline" className="w-full mt-3 !py-1.5 text-xs">Log Inspection</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}