import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface TextSidebarProps {
  /** The editor instance used to add and modify text elements. */
  editor: Editor | undefined;
  /** The currently active tool in the editor. */
  activeTool: ActiveTool;
  /** Callback to update the active tool. */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/**
 * TextSidebar provides options for adding different types of text elements
 * (textbox, heading, subheading, paragraph) to the editor canvas.
 * Visible only when the active tool is "text".
 */
export const TextSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextSidebarProps) => {
  /** Closes the text sidebar by switching the active tool back to "select". */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "text" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader description="Add text to your canvas" title="Text" />
      <ScrollArea>
        <div className="space-y-4 border-b p-4">
          {/* Default textbox with no specific styling */}
          <Button className="w-full" onClick={() => editor?.addText("Textbox")}>
            Add a textbox
          </Button>

          {/* Heading: large, bold text */}
          <Button
            className="h-16 w-full"
            size="lg"
            variant="secondary"
            onClick={() =>
              editor?.addText("Heading", {
                fontSize: 80,
                fontWeight: 700,
              })
            }
          >
            <span className="text-3xl font-bold">Add a heading</span>
          </Button>

          {/* Subheading: medium-sized, semi-bold text */}
          <Button
            className="h-16 w-full"
            size="lg"
            variant="secondary"
            onClick={() =>
              editor?.addText("Subheading", {
                fontSize: 44,
                fontWeight: 600,
              })
            }
          >
            <span className="text-xl font-semibold">Add a subheading</span>
          </Button>

          {/* Paragraph: standard body text */}
          <Button
            className="h-16 w-full"
            size="lg"
            variant="secondary"
            onClick={() =>
              editor?.addText("Paragraph", {
                fontSize: 32,
              })
            }
          >
            Paragraph
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
