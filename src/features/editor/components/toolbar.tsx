import { BsBorderWidth } from "react-icons/bs";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  activeTool: ActiveTool;
  editor: Editor | undefined;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Toolbar = ({
  activeTool,
  editor,
  onChangeActiveTool,
}: ToolbarProps) => {
  const fillColor = editor?.getActiveFillColor();
  const strokeColor = editor?.getActiveStrokeColor();

  if (editor?.selectedObjects.length === 0) {
    return (
      <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2" />
    );
  }

  return (
    <div className="z-49 flex h-14 w-full shrink-0 items-center gap-x-2 overflow-x-auto border-b bg-white p-2">
      <div className="flex h-full items-center justify-center">
        <Hint label="Color" side="bottom" sideOffset={5}>
          <Button
            className={cn(activeTool === "fill" && "bg-gray-100")}
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("fill")}
          >
            <div
              className="size-4 rounded-sm border"
              style={{
                backgroundColor: fillColor,
              }}
            />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Stroke color" side="bottom" sideOffset={5}>
          <Button
            className={cn(activeTool === "stroke-color" && "bg-gray-100")}
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("stroke-color")}
          >
            <div
              className="size-4 rounded-sm border-2 bg-white"
              style={{ borderColor: strokeColor }}
            />
          </Button>
        </Hint>
      </div>
      <div className="flex h-full items-center justify-center">
        <Hint label="Stroke width" side="bottom" sideOffset={5}>
          <Button
            className={cn(activeTool === "stroke-width" && "bg-gray-100")}
            size="icon"
            variant="ghost"
            onClick={() => onChangeActiveTool("stroke-width")}
          >
            <BsBorderWidth className="size-4" />
          </Button>
        </Hint>
      </div>
    </div>
  );
};
