import { ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  onClose,
  children,
  widthClass = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${widthClass} bg-surface border border-border-bright rounded-md shadow-xl max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}