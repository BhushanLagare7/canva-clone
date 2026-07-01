import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";
import { FaDiamond } from "react-icons/fa6";
import { IoTriangle } from "react-icons/io5";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

/** Props for the ShapeSidebar component */
interface ShapeSidebarProps {
  /** The editor instance used to add shapes to the canvas */
  editor: Editor | undefined;
  /** The currently active tool in the editor */
  activeTool: ActiveTool;
  /** Callback to update the active tool */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/**
 * A sidebar panel that provides shape tools for adding
 * various shapes (circle, rectangle, triangle, diamond) to the canvas.
 * Visible only when the "shapes" tool is active.
 */
export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  /** Resets the active tool back to "select" when the sidebar is closed */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        // Sidebar is only visible when the "shapes" tool is active
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Add shapes to your canvas"
        title="Shapes"
      />
      <ScrollArea>
        {/* Grid of available shape tools */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <ShapeTool icon={FaCircle} onClick={() => editor?.addCircle()} />
          <ShapeTool
            icon={FaSquare}
            onClick={() => editor?.addSoftRectangle()} // Rectangle with rounded corners
          />
          <ShapeTool
            icon={FaSquareFull}
            onClick={() => editor?.addRectangle()} // Rectangle with sharp corners
          />
          <ShapeTool icon={IoTriangle} onClick={() => editor?.addTriangle()} />
          <ShapeTool
            icon={IoTriangle}
            iconClassName="rotate-180" // Flips the triangle icon to point downward
            onClick={() => editor?.addInverseTriangle()}
          />
          <ShapeTool icon={FaDiamond} onClick={() => editor?.addDiamond()} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
