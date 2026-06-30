import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HintProps {
  /** Text to display inside the tooltip */
  label: string;
  /** The element that triggers the tooltip on hover */
  children: ReactElement;
  /** Which side of the trigger to render the tooltip */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the tooltip relative to the trigger */
  align?: "start" | "center" | "end";
  /** Distance in pixels between the tooltip and the trigger (side axis) */
  sideOffset?: number;
  /** Distance in pixels between the tooltip and the trigger (align axis) */
  alignOffset?: number;
}

/**
 * A reusable tooltip wrapper that displays a styled label
 * when the user hovers over the child element.
 */
export const Hint = ({
  label,
  children,
  side,
  align,
  sideOffset,
  alignOffset,
}: HintProps) => {
  return (
    <TooltipProvider>
      {/* 100ms delay before the tooltip appears */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          align={align}
          alignOffset={alignOffset}
          className="border-slate-800 bg-slate-800 text-white"
          side={side}
          sideOffset={sideOffset}
        >
          <p className="font-semibold capitalize">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
