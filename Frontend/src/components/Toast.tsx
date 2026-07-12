import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: "bg-teal/10 border-teal/30", text: "text-teal" },
  error:   { bg: "bg-red/10 border-red/30",   text: "text-red" },
  info:    { bg: "bg-blue/10 border-blue/30", text: "text-blue" },
};

function Toast({ message, type = "success", onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const Icon = icons[type];
  const style = colors[type];

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3 s
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-md border shadow-xl
        ${style.bg} transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
    >
      <Icon size={16} className={style.text} />
      <p className="text-sm text-text">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="ml-2 text-text-muted hover:text-text"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hook helper — usage: const { show, ToastOutlet } = useToast();       */
/* ------------------------------------------------------------------ */

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  function show(message: string, type: ToastType = "success") {
    setToast({ message, type });
  }

  const ToastOutlet = toast ? (
    <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
  ) : null;

  return { show, ToastOutlet };
}
