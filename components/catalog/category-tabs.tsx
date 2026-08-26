"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  const allCategories = ["Todos", ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {allCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            active === cat
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
