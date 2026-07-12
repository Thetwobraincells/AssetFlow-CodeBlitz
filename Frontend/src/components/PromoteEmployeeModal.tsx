import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export type EmployeeRole = "Employee" | "Department Head" | "Asset Manager" | "Admin";

interface Employee {
  name: string;
  email: string;
  dept: string;
  role: string;
}

interface Props {
  employee: Employee;
  onClose: () => void;
  onSave: (newRole: EmployeeRole) => void;
}

const roles: EmployeeRole[] = ["Employee", "Department Head", "Asset Manager", "Admin"];

const roleDesc: Record<EmployeeRole, string> = {
  Employee: "Can request allocations and bookings.",
  "Department Head": "Can approve transfer requests within their department.",
  "Asset Manager": "Full asset lifecycle management.",
  Admin: "Full system access including org setup.",
};

export default function PromoteEmployeeModal({ employee, onClose, onSave }: Props) {
  const [selected, setSelected] = useState<EmployeeRole>(employee.role as EmployeeRole || "Employee");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(selected);
  }

  return (
    <Modal title="Change Employee Role" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-high border border-border rounded-md px-4 py-3">
          <p className="text-sm text-text font-medium">{employee.name}</p>
          <p className="font-mono text-xs text-text-muted mt-0.5">{employee.email}</p>
          <p className="text-xs text-text-muted mt-0.5">
            Current role: <span className="text-amber font-medium">{employee.role}</span>
          </p>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-2">New Role</label>
          <div className="space-y-2">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelected(r)}
                className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                  selected === r
                    ? "bg-amber/5 border-amber/50 text-text"
                    : "border-border text-text-muted hover:text-text hover:border-border-bright"
                }`}
              >
                <p className="text-sm font-medium">{r}</p>
                <p className="text-xs text-text-muted mt-0.5">{roleDesc[r]}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={selected === employee.role}>
            Confirm Promotion
          </Button>
        </div>
      </form>
    </Modal>
  );
}
