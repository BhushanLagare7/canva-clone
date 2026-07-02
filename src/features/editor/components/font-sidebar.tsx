import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor, fonts } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface FontSidebarProps {
  /** The editor instance used to get and modify font properties. */
  editor: Editor | undefined;
  /** The currently active tool in the editor. */
  activeTool: ActiveTool;
  /** Callback to update the active tool. */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

/**
 * FontSidebar displays a list of available fonts for the user to apply
 * to the selected text element in the editor.
 * Visible only when the active tool is "font".
 */
export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  // Retrieve the font family of the currently active/selected element.
  const value = editor?.getActiveFontFamily();

  /** Closes the font sidebar by switching the active tool back to "select". */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "font" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader description="Change the text font" title="Font" />
      <ScrollArea>
        <div className="space-y-1 border-b p-4">
          {/* Render a button for each available font */}
          {fonts.map((font) => (
            <Button
              key={font}
              className={cn(
                "h-16 w-full justify-start text-left",
                // Highlight the button if this font is currently active
                value === font && "border-2 border-blue-500",
              )}
              size="lg"
              style={{
                fontFamily: font,
                fontSize: "16px",
                padding: "8px 16px",
              }}
              variant="secondary"
              onClick={() => editor?.changeFontFamily(font)}
            >
              {font}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
