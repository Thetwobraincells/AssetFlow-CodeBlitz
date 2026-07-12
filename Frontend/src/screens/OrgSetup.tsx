import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Pencil, ShieldCheck } from "lucide-react";
import Tabs from "../components/Tabs";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";

const departments = [
  { name: "Engineering", code: "ENG", head: "Aditi Rao", parent: "—", status: "active" as const },
  { name: "Facilities", code: "FAC", head: "Rohan Mehta", parent: "—", status: "active" as const },
  { name: "Field Ops", code: "OPS", head: "Sana Iqbal", parent: "—", status: "active" as const },
  { name: "Marketing", code: "MKT", head: "—", parent: "—", status: "inactive" as const },
];

const categories = [
  { name: "Electronics", fields: "warranty_period_months: 24", status: "active" as const },
  { name: "Furniture", fields: "—", status: "active" as const },
  { name: "Vehicles", fields: "registration_expiry, insurance_renewal", status: "active" as const },
];

const employees = [
  { name: "Priya Shah", email: "priya.shah@acme.com", dept: "Engineering", role: "Employee" },
  { name: "Raj Mehta", email: "raj.mehta@acme.com", dept: "Field Ops", role: "Employee" },
  { name: "Aditi Rao", email: "aditi.rao@acme.com", dept: "Engineering", role: "Department Head" },
  { name: "T. Silva", email: "t.silva@acme.com", dept: "Facilities", role: "Asset Manager" },
  { name: "J. Kowalski", email: "j.kowalski@acme.com", dept: "—", role: "Admin" },
];

const roleColors: Record<string, string> = {
  Admin: "bg-amber/10 text-amber border-amber/30",
  "Asset Manager": "bg-teal/10 text-teal border-teal/30",
  "Department Head": "bg-blue/10 text-blue border-blue/30",
  Employee: "bg-slate/10 text-slate border-slate/30",
};

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Th({ children }: { children?: ReactNode }) {
  return <th className="label-caps text-text-muted text-left px-4 py-2.5">{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-text ${className}`}>{children}</td>;
}

export default function OrgSetup() {
  const [tab, setTab] = useState("departments");

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "departments", label: "Departments" },
          { key: "categories", label: "Asset Categories" },
          { key: "employees", label: "Employee Directory" },
        ]}
        active={tab}
        onSelect={setTab}
      />

      {tab === "departments" && (
        <Panel
          title="Departments"
          action={
            <Button variant="primary" className="flex items-center gap-1.5">
              <Plus size={14} /> Add Department
            </Button>
          }
        >
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Code</Th><Th>Head</Th><Th>Parent</Th><Th>Status</Th><Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {departments.map((d) => (
                <tr key={d.code} className="hover:bg-surface-hover">
                  <Td className="font-medium">{d.name}</Td>
                  <Td className="font-mono text-text-muted">{d.code}</Td>
                  <Td className="text-text-muted">{d.head}</Td>
                  <Td className="text-text-muted">{d.parent}</Td>
                  <Td><StatusPill status={d.status} label={d.status} /></Td>
                  <Td className="text-right">
                    <button className="text-text-muted hover:text-text"><Pencil size={14} /></button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "categories" && (
        <Panel
          title="Asset Categories"
          action={
            <Button variant="primary" className="flex items-center gap-1.5">
              <Plus size={14} /> Add Category
            </Button>
          }
        >
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Custom Fields</Th><Th>Status</Th><Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.name} className="hover:bg-surface-hover">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="font-mono text-xs text-text-muted">{c.fields}</Td>
                  <Td><StatusPill status={c.status} label={c.status} /></Td>
                  <Td className="text-right">
                    <button className="text-text-muted hover:text-text"><Pencil size={14} /></button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === "employees" && (
        <Panel title="Employee Directory">
          <div className="p-3 border-b border-border bg-amber/5 flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={14} className="text-amber shrink-0" />
            Role promotion happens only here. Signup always creates an Employee account — there is no role selection anywhere else.
          </div>
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Email</Th><Th>Department</Th><Th>Role</Th><Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.map((e) => (
                <tr key={e.email} className="hover:bg-surface-hover">
                  <Td className="font-medium">{e.name}</Td>
                  <Td className="text-text-muted font-mono text-xs">{e.email}</Td>
                  <Td className="text-text-muted">{e.dept}</Td>
                  <Td>
                    <span className={`text-xs px-2 py-1 rounded border font-mono ${roleColors[e.role]}`}>
                      {e.role}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Button variant="ghost" className="!px-2 !py-1 text-xs">Promote</Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}