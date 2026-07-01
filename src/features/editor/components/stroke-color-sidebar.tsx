/**
 * Sidebar component for modifying the stroke color of canvas elements.
 * Displays a color picker that updates the active element's stroke color.
 */
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/features/editor/components/color-picker";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor, STROKE_COLOR } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface StrokeColorSidebarProps {
  /** The editor instance used to get and change stroke color */
  editor: Editor | undefined;
  /** Currently active tool in the editor */
  activeTool: ActiveTool;
  /** Callback to update the active tool selection */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokeColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokeColorSidebarProps) => {
  // Falls back to the default STROKE_COLOR if no element is active
  const value = editor?.getActiveStrokeColor() ?? STROKE_COLOR;

  /** Resets the active tool back to the default select tool on close */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  /** Applies the selected color to the active element's stroke */
  const onChange = (value: string) => {
    editor?.changeStrokeColor(value);
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        // Sidebar visibility is toggled based on the active tool
        activeTool === "stroke-color" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Add stroke color to your element"
        title="Stroke color"
      />
      <ScrollArea>
        <div className="space-y-6 p-4">
          <ColorPicker value={value} onChange={onChange} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
