import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ActiveTool, Editor, filters } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FilterSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FilterSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "relative z-40 flex h-full w-90 flex-col border-r bg-white",
        activeTool === "filter" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        description="Apply a filter to selected image"
        title="Filters"
      />
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 border-b p-4">
          {filters.map((filter) => {
            const label = filter.charAt(0).toUpperCase() + filter.slice(1);
            // Quick map for specific tricky names
            const displayLabel = {
              blacknwhite: "Black & White",
              blendcolor: "Blend Color",
              huerotate: "Hue Rotate",
              removecolor: "Remove Color",
            }[filter] || label;

            return (
              <Button
                key={filter}
                className="h-16 w-full justify-start text-left"
                size="lg"
                variant="secondary"
                onClick={() => editor?.changeImageFilter(filter)}
              >
                {displayLabel}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
