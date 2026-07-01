import type { IconType } from "react-icons";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Props for the ShapeToolProps component */
interface ShapeToolProps {
  /** Callback function to handle the click event */
  onClick: () => void;
  /** The icon to display */
  icon: LucideIcon | IconType;
  /** Optional class name for the icon */
  iconClassName?: string;
}

/**
 * ShapeTool component displays a clickable shape tool with an icon.
 */
export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName,
}: ShapeToolProps) => {
  return (
    <button className="aspect-square rounded-md border p-5" onClick={onClick}>
      {/* The icon to display */}
      <Icon className={cn("h-full w-full", iconClassName)} />
    </button>
  );
};
