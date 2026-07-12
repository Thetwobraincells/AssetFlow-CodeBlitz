import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Pencil, ShieldCheck, Search, Filter } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tabs from "../components/Tabs";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";
import AddDepartmentModal, { type Department } from "../components/AddDepartmentModal";
import AddCategoryModal, { type AssetCategory } from "../components/AddCategoryModal";
import PromoteEmployeeModal from "../components/PromoteEmployeeModal";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface Employee {
  id: string;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: string;
}

const roleColors: Record<string, string> = {
  admin:            "bg-amber/10 text-amber border-amber/30",
  asset_manager:    "bg-teal/10 text-teal border-teal/30",
  department_head:  "bg-blue/10 text-blue border-blue/30",
  employee:         "bg-slate/10 text-slate border-slate/30",
};

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const queryClient = useQueryClient();
  const { show, ToastOutlet } = useToast();
  const [tab, setTab] = useState("departments");

  // --- Departments ---
  const { data: deptsRes, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn:  () => apiRequest('/departments'),
  });
  const departments: Department[] = (deptsRes?.data || []).map((d: any): Department => ({
    name:   d.name,
    code:   d.code || d.id.slice(0, 4).toUpperCase(),
    head:   d.head?.name || '—',
    parent: d.parent?.name || '—',
    status: d.is_active ? 'active' : 'inactive',
    _id:    d.id,
  } as any));

  // --- Categories ---
  const { data: catsRes, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => apiRequest('/categories'),
  });
  const categories: AssetCategory[] = (catsRes?.data || []).map((c: any): AssetCategory => ({
    name:   c.name,
    fields: c.custom_fields?.join(', ') || '—',
    status: c.is_active ? 'active' : 'inactive',
    _id:    c.id,
  } as any));

  // --- Employees ---
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => apiRequest('/users'),
  });
  const employees: Employee[] = (usersRes?.data || []).map((u: any): Employee => ({
    id:     u.id,
    name:   u.name,
    email:  u.email,
    dept:   u.department?.name || '—',
    role:   u.role,
    status: u.status || 'active',
  }));

  // --- Modal state ---
  const [deptModal, setDeptModal]         = useState<"add" | Department | null>(null);
  const [catModal, setCatModal]           = useState<"add" | AssetCategory | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<Employee | null>(null);

  // --- Employee filters ---
  const [empSearch, setEmpSearch]           = useState("");
  const [empDeptFilter, setEmpDeptFilter]   = useState("All");
  const [empRoleFilter, setEmpRoleFilter]   = useState("All");

  /* Dept handlers */
  async function saveDept(dept: Department) {
    try {
      const raw = dept as any;
      if (deptModal === "add") {
        await apiRequest('/departments', {
          method: 'POST',
          body: JSON.stringify({ name: dept.name, code: dept.code }),
        });
        show(`Department "${dept.name}" added.`);
      } else {
        await apiRequest(`/departments/${raw._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: dept.name, is_active: dept.status === 'active' }),
        });
        show(`Department "${dept.name}" updated.`);
      }
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setDeptModal(null);
    } catch (err: any) {
      show(err.message || 'Failed to save department', 'info');
    }
  }

  /* Category handlers */
  async function saveCat(cat: AssetCategory) {
    try {
      const raw = cat as any;
      if (catModal === "add") {
        await apiRequest('/categories', {
          method: 'POST',
          body: JSON.stringify({ name: cat.name }),
        });
        show(`Category "${cat.name}" added.`);
      } else {
        await apiRequest(`/categories/${raw._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: cat.name, is_active: cat.status === 'active' }),
        });
        show(`Category "${cat.name}" updated.`);
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCatModal(null);
    } catch (err: any) {
      show(err.message || 'Failed to save category', 'info');
    }
  }

  /* Employee role promotion */
  async function savePromotion(newRole: string) {
    if (!promoteTarget) return;
    try {
      await apiRequest(`/users/${promoteTarget.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole.toLowerCase().replace(/ /g, '_') }),
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      show(`${promoteTarget.name} role updated to ${newRole}.`);
      setPromoteTarget(null);
    } catch (err: any) {
      show(err.message || 'Failed to update role', 'info');
    }
  }

  /* Employee filters */
  const uniqueDepts = ["All", ...Array.from(new Set(employees.map((e) => e.dept).filter((d) => d !== "—")))];
  const uniqueRoles = ["All", ...Array.from(new Set(employees.map((e) => formatRole(e.role))))];

  const filteredEmployees = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
                        e.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept   = empDeptFilter === "All" || e.dept === empDeptFilter;
    const matchRole   = empRoleFilter === "All" || formatRole(e.role) === empRoleFilter;
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
          {deptsLoading ? (
            <p className="text-sm text-text-muted text-center py-8">Loading...</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border">
                <tr><Th>Name</Th><Th>Code</Th><Th>Head</Th><Th>Parent</Th><Th>Status</Th><Th /></tr>
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
                {departments.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-sm text-text-muted">No departments yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
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
          {catsLoading ? (
            <p className="text-sm text-text-muted text-center py-8">Loading...</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border">
                <tr><Th>Name</Th><Th>Custom Fields</Th><Th>Status</Th><Th /></tr>
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
                {categories.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-sm text-text-muted">No categories yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {/* ---- EMPLOYEES ---- */}
      {tab === "employees" && (
        <Panel title="Employee Directory">
          <div className="p-3 border-b border-border bg-amber/5 flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck size={14} className="text-amber shrink-0" />
            Role promotion happens only here. Signup always creates an Employee account.
          </div>

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

          {usersLoading ? (
            <p className="text-sm text-text-muted text-center py-8">Loading...</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border">
                <tr><Th>Name</Th><Th>Email</Th><Th>Department</Th><Th>Role</Th><Th /></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-hover">
                    <Td className="font-medium">{e.name}</Td>
                    <Td className="text-text-muted font-mono text-xs">{e.email}</Td>
                    <Td className="text-text-muted">{e.dept}</Td>
                    <Td>
                      <span className={`text-xs px-2 py-1 rounded border font-mono ${roleColors[e.role] ?? ""}`}>
                        {formatRole(e.role)}
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
                    <td colSpan={5} className="text-center py-8 text-sm text-text-muted">No employees match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
          employee={promoteTarget as any}
          onClose={() => setPromoteTarget(null)}
          onSave={savePromotion}
        />
      )}

      {ToastOutlet}
    </div>
  );
}