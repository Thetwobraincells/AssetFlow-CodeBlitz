import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Pencil, ShieldCheck, Search, Filter } from "lucide-react";
import Tabs from "../components/Tabs";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";
import AddDepartmentModal, { type Department } from "../components/AddDepartmentModal";
import AddCategoryModal, { type AssetCategory } from "../components/AddCategoryModal";
import PromoteEmployeeModal from "../components/PromoteEmployeeModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Initial data                                                          */
/* ------------------------------------------------------------------ */

const initDepartments: Department[] = [
  { name: "Engineering", code: "ENG", head: "Aditi Rao", parent: "—", status: "active" },
  { name: "Facilities",  code: "FAC", head: "Rohan Mehta", parent: "—", status: "active" },
  { name: "Field Ops",   code: "OPS", head: "Sana Iqbal",  parent: "—", status: "active" },
  { name: "Marketing",   code: "MKT", head: "—",           parent: "—", status: "inactive" },
];

const initCategories: AssetCategory[] = [
  { name: "Electronics", fields: "warranty_period_months", status: "active" },
  { name: "Furniture",   fields: "—",                      status: "active" },
  { name: "Vehicles",    fields: "registration_expiry, insurance_renewal", status: "active" },
];

interface Employee {
  name: string;
  email: string;
  dept: string;
  role: string;
}

const initEmployees: Employee[] = [
  { name: "Priya Shah",  email: "priya.shah@acme.com",  dept: "Engineering", role: "Employee" },
  { name: "Raj Mehta",   email: "raj.mehta@acme.com",   dept: "Field Ops",   role: "Employee" },
  { name: "Aditi Rao",   email: "aditi.rao@acme.com",   dept: "Engineering", role: "Department Head" },
  { name: "T. Silva",    email: "t.silva@acme.com",      dept: "Facilities",  role: "Asset Manager" },
  { name: "J. Kowalski", email: "j.kowalski@acme.com",  dept: "—",           role: "Admin" },
];

const roleColors: Record<string, string> = {
  Admin:             "bg-amber/10 text-amber border-amber/30",
  "Asset Manager":   "bg-teal/10 text-teal border-teal/30",
  "Department Head": "bg-blue/10 text-blue border-blue/30",
  Employee:          "bg-slate/10 text-slate border-slate/30",
};

/* ------------------------------------------------------------------ */
/* Panel shell                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function OrgSetup() {
  const [tab, setTab] = useState("departments");

  // --- Departments state ---
  const [departments, setDepartments]             = useState<Department[]>(initDepartments);
  const [deptModal, setDeptModal]                 = useState<"add" | Department | null>(null);

  // --- Categories state ---
  const [categories, setCategories]               = useState<AssetCategory[]>(initCategories);
  const [catModal, setCatModal]                   = useState<"add" | AssetCategory | null>(null);

  // --- Employees state ---
  const [employees, setEmployees]                 = useState<Employee[]>(initEmployees);
  const [promoteTarget, setPromoteTarget]         = useState<Employee | null>(null);
  const [empSearch, setEmpSearch]                 = useState("");
  const [empDeptFilter, setEmpDeptFilter]         = useState("All");
  const [empRoleFilter, setEmpRoleFilter]         = useState("All");

  const { show, ToastOutlet } = useToast();

  /* Dept handlers */
  function saveDept(dept: Department) {
    if (deptModal === "add") {
      setDepartments((prev) => [...prev, dept]);
      show(`Department "${dept.name}" added.`);
    } else {
      setDepartments((prev) =>
        prev.map((d) => (d.code === (deptModal as Department).code ? dept : d))
      );
      show(`Department "${dept.name}" updated.`);
    }
    setDeptModal(null);
  }

  /* Category handlers */
  function saveCat(cat: AssetCategory) {
    if (catModal === "add") {
      setCategories((prev) => [...prev, cat]);
      show(`Category "${cat.name}" added.`);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.name === (catModal as AssetCategory).name ? cat : c))
      );
      show(`Category "${cat.name}" updated.`);
    }
    setCatModal(null);
  }

  /* Employee role promotion */
  function savePromotion(newRole: string) {
    if (!promoteTarget) return;
    setEmployees((prev) =>
      prev.map((e) => (e.email === promoteTarget.email ? { ...e, role: newRole } : e))
    );
    show(`${promoteTarget.name} promoted to ${newRole}.`);
    setPromoteTarget(null);
  }

  /* Employee filters */
  const uniqueDepts = ["All", ...Array.from(new Set(initEmployees.map((e) => e.dept).filter((d) => d !== "—")))];
  const uniqueRoles = ["All", ...Array.from(new Set(initEmployees.map((e) => e.role)))];

  const filteredEmployees = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                        e.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept = empDeptFilter === "All" || e.dept === empDeptFilter;
    const matchRole = empRoleFilter === "All" || e.role === empRoleFilter;
    return matchSearch && matchDept && matchRole;
  });

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "departments", label: "Departments" },
          { key: "categories",  label: "Asset Categories" },
          { key: "employees",   label: "Employee Directory" },
        ]}
        active={tab}
        onSelect={setTab}
      />

      {/* ---- DEPARTMENTS ---- */}
      {tab === "departments" && (
        <Panel
          title="Departments"
          action={
            <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setDeptModal("add")}>
              <Plus size={14} /> Add Department
            </Button>
          }
        >
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Code</Th><Th>Head</Th><Th>Parent</Th><Th>Status</Th><Th />
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
                    <button
                      onClick={() => setDeptModal(d)}
                      className="text-text-muted hover:text-text transition-colors"
                      title="Edit department"
                    >
                      <Pencil size={14} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* ---- CATEGORIES ---- */}
      {tab === "categories" && (
        <Panel
          title="Asset Categories"
          action={
            <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setCatModal("add")}>
              <Plus size={14} /> Add Category
            </Button>
          }
        >
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Custom Fields</Th><Th>Status</Th><Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.name} className="hover:bg-surface-hover">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="font-mono text-xs text-text-muted">{c.fields}</Td>
                  <Td><StatusPill status={c.status} label={c.status} /></Td>
                  <Td className="text-right">
                    <button
                      onClick={() => setCatModal(c)}
                      className="text-text-muted hover:text-text transition-colors"
                      title="Edit category"
                    >
                      <Pencil size={14} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* ---- EMPLOYEES ---- */}
      {tab === "employees" && (
        <Panel title="Employee Directory">
          <div className="p-3 border-b border-border bg-amber/5 flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={14} className="text-amber shrink-0" />
            Role promotion happens only here. Signup always creates an Employee account — there is no role selection anywhere else.
          </div>

          {/* Employee filters */}
          <div className="p-3 border-b border-border flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full bg-surface-high border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-amber/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-text-muted" />
              <select
                value={empDeptFilter}
                onChange={(e) => setEmpDeptFilter(e.target.value)}
                className="bg-surface-high border border-border rounded-md px-2.5 py-1.5 text-xs text-text focus:outline-none"
              >
                {uniqueDepts.map((d) => <option key={d} value={d}>{d === "All" ? "Dept: All" : d}</option>)}
              </select>
              <select
                value={empRoleFilter}
                onChange={(e) => setEmpRoleFilter(e.target.value)}
                className="bg-surface-high border border-border rounded-md px-2.5 py-1.5 text-xs text-text focus:outline-none"
              >
                {uniqueRoles.map((r) => <option key={r} value={r}>{r === "All" ? "Role: All" : r}</option>)}
              </select>
            </div>
          </div>

          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <Th>Name</Th><Th>Email</Th><Th>Department</Th><Th>Role</Th><Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((e) => (
                <tr key={e.email} className="hover:bg-surface-hover">
                  <Td className="font-medium">{e.name}</Td>
                  <Td className="text-text-muted font-mono text-xs">{e.email}</Td>
                  <Td className="text-text-muted">{e.dept}</Td>
                  <Td>
                    <span className={`text-xs px-2 py-1 rounded border font-mono ${roleColors[e.role] ?? ""}`}>
                      {e.role}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Button
                      variant="ghost"
                      className="!px-2 !py-1 text-xs"
                      onClick={() => setPromoteTarget(e)}
                    >
                      Change Role
                    </Button>
                  </Td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-text-muted">
                    No employees match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      )}

      {/* ---- Modals ---- */}
      {deptModal !== null && (
        <AddDepartmentModal
          initial={deptModal === "add" ? undefined : deptModal}
          onClose={() => setDeptModal(null)}
          onSave={saveDept}
        />
      )}
      {catModal !== null && (
        <AddCategoryModal
          initial={catModal === "add" ? undefined : catModal}
          onClose={() => setCatModal(null)}
          onSave={saveCat}
        />
      )}
      {promoteTarget && (
        <PromoteEmployeeModal
          employee={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onSave={savePromotion}
        />
      )}

      {ToastOutlet}
    </div>
  );
}