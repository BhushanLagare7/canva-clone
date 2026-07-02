/**
 * Sidebar component for modifying stroke width and type of canvas elements.
 * Provides a slider for width control and buttons for selecting stroke style
 * (solid or dashed).
 */
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import {
  ActiveTool,
  Editor,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
} from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface StrokeWidthSidebarProps {
  /** The editor instance used to get and change stroke properties */
  editor: Editor | undefined;
  /** Currently active tool in the editor */
  activeTool: ActiveTool;
  /** Callback to update the active tool selection */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokeWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
  // Falls back to defaults if no active element is found
  const widthValue = editor?.getActiveStrokeWidth() ?? STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() ?? STROKE_DASH_ARRAY;

  /** Resets the active tool back to the default select tool on close */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  /** Applies the given width value to the active element's stroke */
  const onChangeStrokeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  /**
   * Applies the given dash array to the active element's stroke.
   * An empty array [] produces a solid line, while [5,5] produces a dashed line.
   */
  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        // Sidebar visibility is toggled based on the active tool
        activeTool === "stroke-width" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Modify the stroke of your element"
        title="Stroke options"
      />
      <ScrollArea>
        {/* Stroke width control section */}
        <div className="space-y-4 border-b p-4">
          <Label className="text-sm">Stroke width</Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onChangeStrokeWidth(values[0])}
          />
        </div>

        {/* Stroke type selection: solid ([]) or dashed ([5,5]) */}
        <div className="space-y-4 border-b p-4">
          <Label className="text-sm">Stroke type</Label>

          {/* Solid stroke option */}
          <Button
            aria-label="Solid"
            aria-pressed={JSON.stringify(typeValue) === `[]`}
            className={cn(
              "h-16 w-full justify-start text-left",
              JSON.stringify(typeValue) === `[]` && "border-2 border-blue-500",
            )}
            size="lg"
            style={{ padding: "8px 16px" }}
            variant="secondary"
            onClick={() => onChangeStrokeType([])}
          >
            <div className="w-full rounded-full border-4 border-black" />
          </Button>

          {/* Dashed stroke option */}
          <Button
            aria-label="Dashed"
            aria-pressed={JSON.stringify(typeValue) === `[5,5]`}
            className={cn(
              "h-16 w-full justify-start text-left",
              JSON.stringify(typeValue) === `[5,5]` &&
                "border-2 border-blue-500",
            )}
            size="lg"
            style={{ padding: "8px 16px" }}
            variant="secondary"
            onClick={() => onChangeStrokeType([5, 5])}
          >
            <div className="w-full rounded-full border-4 border-dashed border-black" />
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
