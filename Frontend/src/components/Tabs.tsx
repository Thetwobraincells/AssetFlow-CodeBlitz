interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onSelect: (key: string) => void;
}

export default function Tabs({ tabs, active, onSelect }: TabsProps) {
  return (
    <div className="border-b border-border flex gap-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          className={`pb-2.5 text-sm border-b-2 transition-colors ${
            active === t.key
              ? "border-amber text-text"
              : "border-transparent text-text-muted hover:text-text"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
