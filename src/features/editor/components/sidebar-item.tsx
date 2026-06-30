import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  /** Lucide icon component to display above the label */
  icon: LucideIcon;
  /** Text label displayed below the icon */
  label: string;
  /** Highlights the item when it corresponds to the active sidebar section */
  isActive?: boolean;
  /** Callback fired when the sidebar item is clicked */
  onClick: () => void;
}

/**
 * A single navigational item in the sidebar, displayed as a
 * vertical icon-label button. Visually indicates the active state.
 */
export const SidebarItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: SidebarItemProps) => {
  return (
    <Button
      aria-pressed={isActive}
      className={cn(
        "flex h-auto w-full flex-col rounded-none p-3 py-4",
        isActive && "bg-muted text-primary", // Apply active styles when selected
      )}
      variant="ghost"
      onClick={onClick}
    >
      <Icon className="size-5 shrink-0 stroke-2" />
      <span className="mt-2 text-xs">{label}</span>
    </Button>
  );
};
