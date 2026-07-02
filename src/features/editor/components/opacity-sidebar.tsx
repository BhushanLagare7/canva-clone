/**
 * Sidebar component for adjusting the opacity of the selected canvas element.
 * Provides a slider that ranges from 0 (fully transparent) to 1 (fully opaque).
 * Syncs opacity state with the selected object whenever the selection changes.
 */
import { useEffect, useMemo, useState, useTransition } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface OpacitySidebarProps {
  /** The editor instance used to get and modify element opacity */
  editor: Editor | undefined;
  /** Currently active tool in the editor */
  activeTool: ActiveTool;
  /** Callback to update the active tool selection */
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const OpacitySidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: OpacitySidebarProps) => {
  // Tracks the first selected object to detect selection changes
  const selectedObject = useMemo(
    () => editor?.selectedObjects[0],
    [editor?.selectedObjects],
  );

  const [opacity, setOpacity] = useState(() => editor?.getActiveOpacity() ?? 1);

  // useTransition defers the opacity state update to avoid blocking the UI
  const [, startTransition] = useTransition();

  /**
   * Syncs the local opacity state with the newly selected object's opacity.
   * Runs whenever the selected object changes (e.g., user selects a new element).
   */
  useEffect(() => {
    if (selectedObject) {
      startTransition(() => {
        setOpacity(selectedObject.get("opacity") ?? 1);
      });
    }
  }, [selectedObject]);

  /** Resets the active tool back to the default select tool on close */
  const onClose = () => {
    onChangeActiveTool("select");
  };

  /** Applies the new opacity value to the active element and updates local state */
  const onChange = (value: number) => {
    editor?.changeOpacity(value);
    setOpacity(value);
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        // Sidebar visibility is toggled based on the active tool
        activeTool === "opacity" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Change the opacity of the selected object"
        title="Opacity"
      />
      <ScrollArea>
        <div className="space-y-4 border-b p-4">
          {/* Opacity slider: 0 = fully transparent, 1 = fully opaque, step of 0.01 for fine control */}
          <Slider
            aria-label="Opacity"
            max={1}
            min={0}
            step={0.01}
            value={[opacity]}
            onValueChange={(values) => onChange(values[0])}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
