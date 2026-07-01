import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/features/editor/components/color-picker";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor, FILL_COLOR } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface FillColorSidebarProps {
  /** The editor instance used to read and update the fill color. */
  editor: Editor | undefined;
  /** The currently active tool, used to toggle sidebar visibility. */
  activeTool: ActiveTool;
  /** Callback to switch the active tool. */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/**
 * Sidebar panel for changing the fill color of the selected canvas element.
 * Visible only when the active tool is "fill".
 */
export const FillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) => {
  // Get the active fill color from the editor, or use the default fill color.
  const value = editor?.getActiveFillColor() ?? FILL_COLOR;

  /** Resets the active tool back to the default selection tool on close. */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  /** Applies the chosen color as the fill color of the selected element. */
  const onChange = (value: string) => {
    editor?.changeFillColor(value);
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        // Show the sidebar only when the fill tool is active.
        activeTool === "fill" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Add fill color to your element"
        title="Fill color"
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
