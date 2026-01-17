"use client";

interface SortOption {
  value: "new" | "top" | "hot";
  label: string;
  icon: string;
}

interface SortTabsProps {
  selectedSort: "new" | "top" | "hot";
  onSort: (sort: "new" | "top" | "hot") => void;
}

const sortOptions: SortOption[] = [
  { value: "new", label: "Newest", icon: "✨" },
  { value: "top", label: "Top Rated", icon: "⭐" },
  { value: "hot", label: "Hot", icon: "🔥" },
];

export function SortTabs({ selectedSort, onSort }: SortTabsProps) {
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mb-2">
      {sortOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onSort(option.value)}
          className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 flex-shrink-0 ${
            selectedSort === option.value
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated-hover)]"
          }`}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
